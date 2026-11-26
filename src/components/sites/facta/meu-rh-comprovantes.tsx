"use client";

import { CheckCircle2, Clock, Download, Eye, FileSignature, FileX, Lock, Receipt, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { cadastro, comprovantes, nomeMes, PENDENTES_INICIAIS, precisaAssinar, type Comprovante, type TipoComprovante } from "./meu-rh-data";
import { Select } from "./select";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

const TIPOS: TipoComprovante[] = ["Contracheque", "13º", "DIRF"];
const TONE: Record<TipoComprovante, string> = {
  Contracheque: "bg-brand-soft text-brand",
  "13º": "bg-ok-soft text-ok-ink",
  DIRF: "bg-warn-soft text-warn-ink",
};
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pad = (n: number) => String(n).padStart(2, "0");

/* ---------- valores fictícios do comprovante ---------- */

type Linha = { cod: string; desc: string; ref?: string; prov?: number; desc$?: number };
const SALARIO = 3200;
function linhas(c: Comprovante): Linha[] {
  if (c.tipo === "DIRF") {
    const meses = c.ano - 1 === 2023 ? 6 : 12;
    const bruto = SALARIO * meses + SALARIO;
    return [
      { cod: "01", desc: "Total de rendimentos", ref: `${meses} meses + 13º`, prov: bruto },
      { cod: "02", desc: "Contribuição previdenciária oficial", desc$: Math.round(bruto * 0.09) },
      { cod: "03", desc: "Imposto sobre a renda retido na fonte", desc$: Math.round(bruto * 0.035) },
    ];
  }
  if (c.tipo === "13º") {
    const primeira = c.mes === 11;
    return primeira
      ? [{ cod: "130", desc: "13º salário: adiantamento", ref: "50%", prov: SALARIO / 2 }]
      : [
          { cod: "131", desc: "13º salário integral", ref: "12/12", prov: SALARIO },
          { cod: "132", desc: "Adiantamento de 13º já pago", desc$: SALARIO / 2 },
          { cod: "901", desc: "INSS sobre 13º", ref: "9%", desc$: SALARIO * 0.09 },
        ];
  }
  const extras = ((c.mes * 7 + c.ano) % 5) * 22.5;
  return [
    { cod: "001", desc: "Salário base", ref: "30 dias", prov: SALARIO },
    ...(extras ? [{ cod: "050", desc: "Horas extras 50%", ref: `${(extras / 22.5) * 2}h`, prov: extras }] : []),
    { cod: "901", desc: "INSS", ref: "9%", desc$: (SALARIO + extras) * 0.09 },
    { cod: "902", desc: "IRRF", ref: "7,5%", desc$: Math.max(0, (SALARIO + extras) * 0.91 - 2259.2) * 0.075 },
    { cod: "910", desc: "Plano de saúde (coparticipação)", desc$: 48.9 },
  ];
}

function Visualizar({ c, onClose, onDownload }: { c: Comprovante; onClose: () => void; onDownload: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useModalFocus(box, close, onClose);
  const ls = linhas(c);
  const prov = ls.reduce((s, l) => s + (l.prov ?? 0), 0);
  const desc = ls.reduce((s, l) => s + (l.desc$ ?? 0), 0);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="comp-title" className="max-h-[94vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4 md:px-8">
          <div>
            <h2 id="comp-title" className="text-[20px] font-bold">{c.label}</h2>
            <p className="text-[14px] text-ink-soft">{c.tipo === "DIRF" ? `Ano-calendário ${c.ano - 1}` : `Competência ${pad(c.mes)}/${c.ano}`}</p>
          </div>
          <button ref={close} type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-brand-soft"><X className="size-5" /></button>
        </div>
        <div className="p-6 md:p-8">
          <dl className="grid gap-x-6 gap-y-2 rounded-2xl bg-surface p-4 text-[14px] sm:grid-cols-2">
            <div><dt className="text-ink-soft">Empresa</dt><dd className="font-bold">{cadastro.empresa}</dd></div>
            <div><dt className="text-ink-soft">Colaborador</dt><dd className="font-bold">{cadastro.codigo} · {cadastro.nome}</dd></div>
            <div><dt className="text-ink-soft">Cargo</dt><dd className="font-bold">{cadastro.cargo}</dd></div>
            <div><dt className="text-ink-soft">Centro de custos</dt><dd className="font-bold">{cadastro.centroCustos}</dd></div>
          </dl>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-[14px]">
              <thead>
                <tr className="border-b border-line text-left text-[12px] font-bold uppercase tracking-wide text-ink-soft">
                  <th className="py-2 pr-3">Cód.</th>
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 pr-3">Ref.</th>
                  <th className="py-2 pr-3 text-right">{c.tipo === "DIRF" ? "Rendimentos" : "Proventos"}</th>
                  <th className="py-2 text-right">{c.tipo === "DIRF" ? "Deduções" : "Descontos"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ls.map((l) => (
                  <tr key={l.cod}>
                    <td className="py-2.5 pr-3 tabular text-ink-soft">{l.cod}</td>
                    <td className="py-2.5 pr-3 font-semibold">{l.desc}</td>
                    <td className="py-2.5 pr-3 tabular text-ink-soft">{l.ref ?? ""}</td>
                    <td className="py-2.5 pr-3 text-right tabular">{l.prov ? brl(l.prov) : ""}</td>
                    <td className="py-2.5 text-right tabular text-danger-ink">{l.desc$ ? brl(l.desc$) : ""}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-line font-bold">
                  <td colSpan={3} className="py-2.5 pr-3">Totais</td>
                  <td className="py-2.5 pr-3 text-right tabular">{brl(prov)}</td>
                  <td className="py-2.5 text-right tabular text-danger-ink">{brl(desc)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-4 flex items-center justify-between rounded-2xl bg-brand-soft px-5 py-4 text-navy">
            <span className="text-[14px] font-bold uppercase tracking-wide">{c.tipo === "DIRF" ? "Rendimento tributável" : "Valor líquido"}</span>
            <span className="text-[24px] font-extrabold tabular">{brl(prov - desc)}</span>
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="button" onClick={onDownload} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white hover:bg-brand-dark"><Download className="size-4" /> Baixar PDF</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- assinatura eletrônica ---------- */

// confirma a identidade pedindo os 4 últimos dígitos do CPF (os 7 primeiros aparecem), como no portal atual
const CPF = cadastro.cpf.replace(/\D/g, "");
const VISIVEIS = CPF.slice(0, 7);

function Assinar({ c, onSign, onView, onClose }: { c: Comprovante; onSign: () => void; onView: () => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLInputElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [dig, setDig] = useState(["", "", "", ""]);
  const [err, setErr] = useState("");
  useModalFocus(box, first, onClose);

  const type = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    setDig((o) => o.map((x, j) => (j === i ? d : x)));
    setErr("");
    if (d && i < 3) inputs.current[i + 1]?.focus();
  };
  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (dig.some((d) => !d)) return setErr("Preencha os 4 dígitos que faltam do seu CPF.");
    if (VISIVEIS + dig.join("") !== CPF) return setErr("Os dígitos não conferem com o seu CPF.");
    onSign();
  };
  const cell = "flex size-9 shrink-0 items-center justify-center rounded-lg text-[16px] font-bold tabular";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="ass-title" className="w-full max-w-[560px] rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
          <h2 id="ass-title" className="flex items-center gap-2 text-[20px] font-bold"><Lock className="size-5 text-brand" /> Assinatura eletrônica</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-brand-soft"><X className="size-5" /></button>
        </div>
        <form onSubmit={confirm} noValidate className="space-y-5 p-6">
          <p className="rounded-2xl bg-brand-soft px-4 py-3 text-[15px] text-navy">Declaro que estou ciente e de acordo com os valores pagos e descritos neste contracheque.</p>
          <dl className="grid grid-cols-3 gap-3 text-[14px]">
            <div><dt className="text-ink-soft">Nome</dt><dd className="font-bold">{cadastro.nome}</dd></div>
            <div><dt className="text-ink-soft">Mês referente</dt><dd className="font-bold tabular">{pad(c.mes)}/{c.ano}</dd></div>
            <div>
              <dt className="text-ink-soft">Comprovante</dt>
              <dd><button type="button" onClick={onView} className="flex items-center gap-1 font-bold text-brand hover:underline"><Eye className="size-4" /> Ver antes</button></dd>
            </div>
          </dl>
          <fieldset>
            <legend className="text-[14px] font-semibold">Para assinar, complete o seu CPF</legend>
            <div className="mt-3 flex items-center gap-1">
              {VISIVEIS.split("").map((d, i) => (
                <span key={i} className={cn(cell, "bg-surface text-ink-soft", (i === 3 || i === 6) && "ml-2")}>{d}</span>
              ))}
              {dig.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                    if (i === 0) first.current = el;
                  }}
                  value={d}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-label={`Dígito ${8 + i} do CPF`}
                  aria-invalid={!!err}
                  onChange={(e) => type(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Backspace" && !d && i > 0 && inputs.current[i - 1]?.focus()}
                  className={cn(cell, "border-2 bg-paper text-center text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15", err ? "border-danger" : "border-line", i === 2 && "ml-2")}
                />
              ))}
            </div>
            {err && <p role="alert" className="mt-2 text-[14px] font-medium text-danger-ink">{err}</p>}
          </fieldset>
          <div className="flex justify-end gap-3 border-t border-line pt-4">
            <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
            <button type="submit" className="flex h-11 items-center gap-2 rounded-xl bg-ok px-5 text-[16px] font-bold text-white hover:brightness-95"><FileSignature className="size-4" /> Confirmar assinatura</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- tela ---------- */

export function MeuRhComprovantes() {
  const [tipo, setTipo] = useState<"" | TipoComprovante>("");
  const [ano, setAno] = useState("");
  const [open, setOpen] = useState<Comprovante | null>(null);
  const [assinando, setAssinando] = useState<Comprovante | null>(null);
  const [assinados, setAssinados] = useStored<string[]>("facta-comprovantes-assinados", () => []);
  const pendente = (c: Comprovante) => PENDENTES_INICIAIS.includes(c.id) && !assinados.includes(c.id);
  const pendentes = comprovantes.filter(pendente);
  const [toast, setToast] = useState("");

  const anos = [...new Set(comprovantes.map((c) => String(c.ano)))];
  const rows = comprovantes.filter((c) => (!tipo || c.tipo === tipo) && (!ano || String(c.ano) === ano));
  const assinar = (c: Comprovante) => {
    setAssinados((l) => [...l, c.id]);
    setAssinando(null);
    setToast(`Contracheque ${pad(c.mes)}/${c.ano} assinado.`);
    window.setTimeout(() => setToast(""), 3200);
  };
  const download = (c: Comprovante) => {
    setToast(`Demonstração: o PDF de "${c.label} ${c.tipo === "DIRF" ? "" : `${pad(c.mes)}/${c.ano}`}" ainda não está conectado.`);
    window.setTimeout(() => setToast(""), 3200);
  };
  const chip = (active: boolean) => cn("flex h-10 coarse:h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-semibold transition-colors motion-reduce:transition-none", active ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink");

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Início", href: "/" }, { label: "RH" }, { label: "Comprovantes" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <Receipt className="size-8 text-brand" strokeWidth={1.8} /> Comprovantes
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Contracheques, 13º salário e informes de rendimentos (DIRF) desde a sua admissão.</p>
      </div>

      {pendentes.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-3 text-warn-ink">
          <Clock className="size-5 shrink-0" />
          <p className="flex-1 text-[14px] font-semibold">
            {pendentes.length === 1 ? `Você tem 1 comprovante aguardando assinatura: ${pendentes[0].label} ${pendentes[0].ano}.` : `Você tem ${pendentes.length} comprovantes aguardando assinatura.`}
          </p>
          <button type="button" onClick={() => setAssinando(pendentes[0])} className="flex h-10 coarse:h-11 items-center gap-1.5 rounded-xl bg-warn px-4 text-[14px] font-bold text-white hover:brightness-95"><FileSignature className="size-4" /> Assinar agora</button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="-mx-4 flex flex-1 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0" role="group" aria-label="Filtrar por tipo">
          <button type="button" aria-pressed={!tipo} onClick={() => setTipo("")} className={chip(!tipo)}>Todos <span className="tabular text-[12px] opacity-70">{comprovantes.length}</span></button>
          {TIPOS.map((t) => (
            <button key={t} type="button" aria-pressed={tipo === t} onClick={() => setTipo(tipo === t ? "" : t)} className={chip(tipo === t)}>
              {t === "13º" ? "13º salário" : t}
              <span className="tabular text-[12px] opacity-70">{comprovantes.filter((c) => c.tipo === t).length}</span>
            </button>
          ))}
        </div>
        <div className="w-full sm:w-[180px]">
          <Select aria-label="Ano" value={ano} onChange={setAno} options={[{ value: "", label: "Todos os anos" }, ...anos]} placeholder="Todos os anos" searchable={false} />
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <FileX className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-[16px] font-bold">Nenhum comprovante com esses filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface text-left text-[12px] font-bold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3">Mês/Ano</th>
                  <th className="px-5 py-3">Comprovante</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Assinatura</th>
                  <th className="px-5 py-3 text-right"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-brand-soft/40">
                    <td className="px-5 py-3 font-semibold tabular">{pad(c.mes)}/{c.ano}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold">{c.label}</span>
                      {c.tipo === "Contracheque" && <span className="ml-1 text-ink-soft">{c.ano}</span>}
                    </td>
                    <td className="px-5 py-3"><span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-bold", TONE[c.tipo])}>{c.tipo === "13º" ? "13º salário" : c.tipo}</span></td>
                    <td className="px-5 py-3">
                      {!precisaAssinar(c) ? (
                        <span className="text-[13px] text-ink-mute">Não se aplica</span>
                      ) : pendente(c) ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-warn-soft px-2.5 py-0.5 text-[12px] font-bold text-warn-ink"><Clock className="size-3.5" /> Pendente</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ok-soft px-2.5 py-0.5 text-[12px] font-bold text-ok-ink"><CheckCircle2 className="size-3.5" /> Assinado</span>
                      )}
                    </td>
                    <td className="px-5 py-2 text-right">
                      <div className="inline-flex gap-1">
                        {pendente(c) && (
                          <button type="button" onClick={() => setAssinando(c)} className="flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg bg-warn px-3 font-bold text-white hover:brightness-95"><FileSignature className="size-4" /> Assinar</button>
                        )}
                        <button type="button" onClick={() => setOpen(c)} className="flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 font-bold text-brand hover:bg-brand-soft"><Eye className="size-4" /> Ver</button>
                        <button type="button" onClick={() => download(c)} aria-label={`Baixar ${c.label} ${nomeMes(c.mes)} ${c.ano}`} title="Baixar PDF" className="flex size-10 coarse:size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-brand-soft hover:text-brand"><Download className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {assinando && !open && <Assinar c={assinando} onSign={() => assinar(assinando)} onView={() => setOpen(assinando)} onClose={() => setAssinando(null)} />}
      {open && <Visualizar c={open} onClose={() => setOpen(null)} onDownload={() => download(open)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
