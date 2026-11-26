"use client";

import { BriefcaseBusiness, FileText, GraduationCap, HeartPulse, IdCard, Lock, Paperclip, Plus, Trash2, Upload, UserRound, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { DatePicker } from "./date-picker";
import { beneficios, cadastro, UFS } from "./meu-rh-data";
import { Select } from "./select";
import { useStored } from "./use-stored";

/* ---------- dados editáveis (demonstração, ficam no localStorage) ---------- */

type Curso = { inicio: string; fim: string; escola: string; curso: string; atividades: string };
type Experiencia = { admissao: string; desligamento: string; empresa: string; cargo: string; atividades: string };
type Dados = {
  apelido: string;
  orgaoEmissor: string;
  dataEmissao: string;
  titulo: string;
  habilitacao: string;
  telResidencial: string;
  telCelular: string;
  telRecado: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  estado: string;
  cidade: string;
  email: string;
  emergenciaNome: string;
  emergenciaTel: string;
  escolaridade: string;
  curso: string;
  cursoStatus: string;
  excel: string;
  word: string;
  powerpoint: string;
  outros: string;
  cursos: Curso[];
  experiencias: Experiencia[];
  mudarResidencia: string;
  viagens: string;
  cnh: string;
  interesses: string;
  anexos: string[];
};
const inicial = (): Dados => ({
  apelido: "", orgaoEmissor: "", dataEmissao: "", titulo: "", habilitacao: "", telResidencial: "", telCelular: "", telRecado: "",
  cep: "", logradouro: "", numero: "", complemento: "", bairro: "", estado: "Rio Grande do Sul", cidade: "Porto Alegre",
  email: "", emergenciaNome: "", emergenciaTel: "", escolaridade: "", curso: "", cursoStatus: "", excel: "", word: "", powerpoint: "", outros: "",
  cursos: [], experiencias: [], mudarResidencia: "Não", viagens: "Não", cnh: "Não", interesses: "", anexos: [],
});

const HABILITACAO = ["Não possui", "A", "B", "AB", "C", "D", "E"];
const ESCOLARIDADE = ["Fundamental", "Médio", "Técnico", "Superior", "Pós-graduação", "Mestrado", "Doutorado"];
const STATUS_CURSO = ["Cursando", "Concluído", "Trancado"];
const NIVEIS = ["Nenhum", "Básico", "Intermediário", "Avançado"];
const SIM_NAO = ["Sim", "Não"];

const digits = (v: string) => v.replace(/\D/g, "");
const maskFone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};
const maskCep = (v: string) => {
  const d = digits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- peças ---------- */

const control = "h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const card = "rounded-3xl border border-paper bg-paper/90 p-5 shadow-card md:p-7";

function Section({ icon: Icon, title, note, children }: { icon: typeof IdCard; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className={card} aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2.5 text-[18px] font-bold"><Icon className="size-5 text-brand" /> {title}</h2>
        {note && <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft"><Lock className="size-3.5" /> {note}</p>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Campo só de leitura: vem da folha, o colaborador não altera. */
function Info({ k, v, className }: { k: string; v: string; className?: string }) {
  return (
    <div className={cn("min-w-0 rounded-xl bg-surface px-3 py-2.5", className)}>
      <dt className="text-[12px] font-semibold text-ink-soft">{k}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-bold">{v || "—"}</dd>
    </div>
  );
}

function Field({ id, title, value, onChange, className, ...rest }: { id: string; title: string; value: string; onChange: (v: string) => void; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id" | "className">) {
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>{title}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} className={control} {...rest} />
    </div>
  );
}

function Pick({ id, title, value, onChange, options, className }: { id: string; title: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <div className={className}>
      <span id={id} className={label}>{title}</span>
      <Select aria-labelledby={id} value={value} onChange={onChange} options={options} placeholder="- Selecione -" />
    </div>
  );
}

function Area({ id, title, value, onChange, className }: { id: string; title: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={label}>{title}</label>
      <textarea id={id} rows={3} value={value} maxLength={1000} onChange={(e) => onChange(e.target.value)} className={cn(control, "h-auto resize-y py-2.5")} />
    </div>
  );
}

function DateField({ id, title, value, onChange }: { id: string; title: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span id={id} className={label}>{title}</span>
      <DatePicker aria-labelledby={id} value={value} onChange={onChange} />
    </div>
  );
}

/* ---------- abas ---------- */

type Tab = "cadastro" | "documentacao" | "beneficios" | "complementares";
const TABS: { id: Tab; label: string; icon: typeof IdCard }[] = [
  { id: "cadastro", label: "Cadastro", icon: IdCard },
  { id: "documentacao", label: "Documentação", icon: FileText },
  { id: "beneficios", label: "Benefícios", icon: HeartPulse },
  { id: "complementares", label: "Complementares", icon: GraduationCap },
];

export function MeuRhDados() {
  const [saved, setSaved, loaded] = useStored<Dados>("facta-meu-rh", inicial);
  const [draft, setDraft] = useState<Dados | null>(null);
  const [tab, setTab] = useState<Tab>("cadastro");
  const [toast, setToast] = useState("");
  const f = draft ?? saved;
  const set = <K extends keyof Dados>(k: K, v: Dados[K]) => setDraft({ ...f, [k]: v });
  const setItem = <K extends "cursos" | "experiencias">(k: K, i: number, patch: Partial<Dados[K][number]>) =>
    set(k, f[k].map((x, j) => (j === i ? { ...x, ...patch } : x)) as Dados[K]);
  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  };
  const save = () => {
    setSaved(f);
    setDraft(null);
    say("Seus dados foram atualizados.");
  };

  if (!loaded) return <p className="py-10 text-center text-[14px] text-ink-soft">Carregando…</p>;

  return (
    <div className="space-y-6 pb-24">
      <div>
        <Breadcrumb trail={[{ label: "Início", href: "/" }, { label: "RH" }, { label: "Meus Dados" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <UserRound className="size-8 text-brand" strokeWidth={1.8} /> Meus Dados
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Confira seus dados no RH e mantenha atualizado o que é de sua responsabilidade.</p>
      </div>

      <div role="tablist" aria-label="Seções" className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-paper p-1 shadow-sm [scrollbar-width:none]">
        {TABS.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="rh-painel" onClick={() => setTab(t.id)} className={cn("flex h-11 shrink-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      <div id="rh-painel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-6">
        {tab === "cadastro" && (
          <Section icon={IdCard} title="Cadastro" note="Mantido pelo RH">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info k="Código" v={cadastro.codigo} />
              <Info k="Nome completo" v={cadastro.nome} className="lg:col-span-3" />
              <Info k="Cargo" v={cadastro.cargo} className="sm:col-span-2" />
              <Info k="Centro de custos" v={cadastro.centroCustos} />
              <Info k="Empresa" v={cadastro.empresa} />
              <Info k="Tipo de funcionário" v={cadastro.tipo} />
              <Info k="Situação" v={cadastro.situacao} />
              <Info k="Data inicial" v={cadastro.dataInicial} />
              <Info k="Data de admissão" v={cadastro.admissao} />
              <Info k="Prorrogação da experiência" v={cadastro.prorrogacaoExperiencia} />
              <Info k="Indicação de primeiro emprego" v={cadastro.primeiroEmprego} />
            </dl>
            <div className="mt-5 max-w-[360px] border-t border-line pt-5">
              <Field id="rh-apelido" title="Apelido (como prefere ser chamado)" value={f.apelido} onChange={(v) => set("apelido", v)} maxLength={40} />
            </div>
          </Section>
        )}

        {tab === "documentacao" && (
          <>
            <Section icon={FileText} title="Dados pessoais">
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Info k="Nome completo" v={cadastro.nome} className="sm:col-span-2" />
                <Info k="Data de nascimento" v={cadastro.nascimento} />
                <Info k="CPF" v={cadastro.cpf} />
                <Info k="RG" v={cadastro.rg} />
              </dl>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field id="rh-orgao" title="Órgão emissor" value={f.orgaoEmissor} onChange={(v) => set("orgaoEmissor", v.toUpperCase())} maxLength={12} placeholder="Ex.: SSP/RS" />
                <DateField id="rh-emissao" title="Data de emissão" value={f.dataEmissao} onChange={(v) => set("dataEmissao", v)} />
                <Field id="rh-titulo" title="Título eleitoral" value={f.titulo} onChange={(v) => set("titulo", digits(v).slice(0, 12))} inputMode="numeric" />
                <Pick id="rh-cnh-cat" title="Habilitação" value={f.habilitacao} onChange={(v) => set("habilitacao", v)} options={HABILITACAO} />
                <Field id="rh-tel-res" title="Telefone residencial" type="tel" value={f.telResidencial} onChange={(v) => set("telResidencial", maskFone(v))} placeholder="(00) 0000-0000" />
                <Field id="rh-tel-cel" title="Telefone celular" type="tel" value={f.telCelular} onChange={(v) => set("telCelular", maskFone(v))} placeholder="(00) 00000-0000" />
                <Field id="rh-tel-rec" title="Telefone de recado" type="tel" value={f.telRecado} onChange={(v) => set("telRecado", maskFone(v))} placeholder="(00) 00000-0000" />
              </div>
              <h3 className="mt-6 text-[14px] font-bold uppercase tracking-wide text-ink-soft">Endereço</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-6">
                <Field id="rh-cep" title="CEP" className="sm:col-span-2" inputMode="numeric" value={f.cep} onChange={(v) => set("cep", maskCep(v))} placeholder="00000-000" />
                <Field id="rh-log" title="Logradouro" className="sm:col-span-4" value={f.logradouro} onChange={(v) => set("logradouro", v)} maxLength={120} />
                <Field id="rh-num" title="Número" className="sm:col-span-2" value={f.numero} onChange={(v) => set("numero", v)} maxLength={10} />
                <Field id="rh-comp" title="Complemento" className="sm:col-span-2" value={f.complemento} onChange={(v) => set("complemento", v)} maxLength={60} />
                <Field id="rh-bairro" title="Bairro" className="sm:col-span-2" value={f.bairro} onChange={(v) => set("bairro", v)} maxLength={60} />
                <Pick id="rh-uf" title="Estado" className="sm:col-span-3" value={f.estado} onChange={(v) => set("estado", v)} options={UFS} />
                <Field id="rh-cidade" title="Cidade" className="sm:col-span-3" value={f.cidade} onChange={(v) => set("cidade", v)} maxLength={60} />
              </div>
            </Section>
            <Section icon={BriefcaseBusiness} title="Dados profissionais" note="Mantido pelo RH">
              <dl className="grid gap-3 sm:grid-cols-3">
                <Info k="PIS" v={cadastro.pis} />
                <Info k="Carteira de trabalho" v={cadastro.carteira} />
                <Info k="Série" v={cadastro.serie} />
                <Info k="Tipo de funcionário" v={cadastro.tipo} />
                <Info k="Data de admissão" v={cadastro.dataInicial} />
                <Info k="Data de demissão" v={cadastro.demissao} />
              </dl>
            </Section>
          </>
        )}

        {tab === "beneficios" && (
          <Section icon={HeartPulse} title="Benefícios" note="Mantido pelo RH">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Info k="Plano de saúde" v={beneficios.planoSaude} className="lg:col-span-2" />
              <Info k="Vale-transporte" v={brl(beneficios.valeTransporte)} />
              <Info k="Vale-refeição" v={brl(beneficios.valeRefeicao)} />
              <Info k="Dependentes / filhos" v={`${beneficios.dependentes} / ${beneficios.filhos}`} />
            </dl>
            <p className="mt-4 text-[14px] text-ink-soft">Para incluir dependentes ou alterar benefícios, abra uma solicitação para o RH.</p>
          </Section>
        )}

        {tab === "complementares" && (
          <>
            <Section icon={UserRound} title="Contato e formação">
              <div className="grid gap-4 sm:grid-cols-6">
                <Field id="rh-email" title="E-mail pessoal" className="sm:col-span-3" type="email" value={f.email} onChange={(v) => set("email", v)} placeholder="nome@exemplo.com" />
                <Field id="rh-tel" title="Telefone" className="sm:col-span-3" type="tel" value={f.telCelular} onChange={(v) => set("telCelular", maskFone(v))} placeholder="(00) 00000-0000" />
                <Field id="rh-em-nome" title="Contato de emergência" className="sm:col-span-3" value={f.emergenciaNome} onChange={(v) => set("emergenciaNome", v)} maxLength={80} />
                <Field id="rh-em-tel" title="Telefone do contato de emergência" className="sm:col-span-3" type="tel" value={f.emergenciaTel} onChange={(v) => set("emergenciaTel", maskFone(v))} placeholder="(00) 00000-0000" />
                <Pick id="rh-esc" title="Escolaridade" className="sm:col-span-2" value={f.escolaridade} onChange={(v) => set("escolaridade", v)} options={ESCOLARIDADE} />
                <Field id="rh-curso" title="Curso" className="sm:col-span-2" value={f.curso} onChange={(v) => set("curso", v)} maxLength={80} />
                <Pick id="rh-curso-st" title="Status do curso" className="sm:col-span-2" value={f.cursoStatus} onChange={(v) => set("cursoStatus", v)} options={STATUS_CURSO} />
              </div>
              <h3 className="mt-6 text-[14px] font-bold uppercase tracking-wide text-ink-soft">Conhecimentos em informática</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Pick id="rh-excel" title="Excel" value={f.excel} onChange={(v) => set("excel", v)} options={NIVEIS} />
                <Pick id="rh-word" title="Word" value={f.word} onChange={(v) => set("word", v)} options={NIVEIS} />
                <Pick id="rh-ppt" title="PowerPoint" value={f.powerpoint} onChange={(v) => set("powerpoint", v)} options={NIVEIS} />
                <Field id="rh-outros" title="Outros" value={f.outros} onChange={(v) => set("outros", v)} maxLength={120} placeholder="Ex.: Power BI" />
              </div>
            </Section>

            <Section icon={GraduationCap} title="Cursos complementares">
              {f.cursos.length === 0 && <p className="text-[14px] text-ink-soft">Nenhum curso adicionado.</p>}
              <ul className="space-y-4">
                {f.cursos.map((c, i) => (
                  <li key={i} className="rounded-2xl border border-line p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <DateField id={`c-ini-${i}`} title="Início" value={c.inicio} onChange={(v) => setItem("cursos", i, { inicio: v })} />
                      <DateField id={`c-fim-${i}`} title="Fim" value={c.fim} onChange={(v) => setItem("cursos", i, { fim: v })} />
                      <Field id={`c-esc-${i}`} title="Escola" value={c.escola} onChange={(v) => setItem("cursos", i, { escola: v })} maxLength={80} />
                      <Field id={`c-cur-${i}`} title="Curso" value={c.curso} onChange={(v) => setItem("cursos", i, { curso: v })} maxLength={80} />
                      <Area id={`c-atv-${i}`} title="Atividades" className="sm:col-span-2 lg:col-span-4" value={c.atividades} onChange={(v) => setItem("cursos", i, { atividades: v })} />
                    </div>
                    <button type="button" onClick={() => set("cursos", f.cursos.filter((_, j) => j !== i))} className="mt-3 flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold text-danger-ink hover:bg-danger-soft"><Trash2 className="size-4" /> Remover curso</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => set("cursos", [...f.cursos, { inicio: "", fim: "", escola: "", curso: "", atividades: "" }])} className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-[14px] font-bold hover:border-brand hover:text-brand"><Plus className="size-4" /> Adicionar curso</button>
            </Section>

            <Section icon={BriefcaseBusiness} title="Experiências profissionais">
              {f.experiencias.length === 0 && <p className="text-[14px] text-ink-soft">Nenhuma experiência adicionada.</p>}
              <ul className="space-y-4">
                {f.experiencias.map((x, i) => (
                  <li key={i} className="rounded-2xl border border-line p-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <DateField id={`x-adm-${i}`} title="Admissão" value={x.admissao} onChange={(v) => setItem("experiencias", i, { admissao: v })} />
                      <DateField id={`x-des-${i}`} title="Desligamento" value={x.desligamento} onChange={(v) => setItem("experiencias", i, { desligamento: v })} />
                      <Field id={`x-emp-${i}`} title="Empresa" value={x.empresa} onChange={(v) => setItem("experiencias", i, { empresa: v })} maxLength={80} />
                      <Field id={`x-car-${i}`} title="Cargo" value={x.cargo} onChange={(v) => setItem("experiencias", i, { cargo: v })} maxLength={80} />
                      <Area id={`x-atv-${i}`} title="Atividades" className="sm:col-span-2 lg:col-span-4" value={x.atividades} onChange={(v) => setItem("experiencias", i, { atividades: v })} />
                    </div>
                    <button type="button" onClick={() => set("experiencias", f.experiencias.filter((_, j) => j !== i))} className="mt-3 flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold text-danger-ink hover:bg-danger-soft"><Trash2 className="size-4" /> Remover experiência</button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => set("experiencias", [...f.experiencias, { admissao: "", desligamento: "", empresa: "", cargo: "", atividades: "" }])} className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-[14px] font-bold hover:border-brand hover:text-brand"><Plus className="size-4" /> Adicionar experiência</button>
            </Section>

            <Section icon={FileText} title="Dados complementares">
              <div className="grid gap-4 sm:grid-cols-3">
                <Pick id="rh-mudar" title="Disponível para mudar de residência" value={f.mudarResidencia} onChange={(v) => set("mudarResidencia", v)} options={SIM_NAO} />
                <Pick id="rh-viagens" title="Disponível para viagens" value={f.viagens} onChange={(v) => set("viagens", v)} options={SIM_NAO} />
                <Pick id="rh-cnh" title="Carteira de habilitação" value={f.cnh} onChange={(v) => set("cnh", v)} options={SIM_NAO} />
                <Area id="rh-interesse" title="Áreas de interesse dentro da empresa" className="sm:col-span-3" value={f.interesses} onChange={(v) => set("interesses", v)} />
              </div>
            </Section>

            <Section icon={Paperclip} title="Certificações e anexos">
              <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-surface px-4 py-4 text-center text-[14px] text-ink-soft hover:border-brand hover:text-brand focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
                <Upload className="size-5" />
                <span><span className="font-bold">Escolha arquivos</span> (certificados, diplomas)</span>
                <input type="file" multiple className="sr-only" onChange={(e) => set("anexos", [...f.anexos, ...[...(e.target.files ?? [])].map((x) => x.name)])} />
              </label>
              {f.anexos.length === 0 ? (
                <p className="mt-3 text-[14px] text-ink-soft">Nenhum anexo enviado.</p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {f.anexos.map((n, i) => (
                    <li key={`${n}-${i}`} className="flex items-center gap-1.5 rounded-lg bg-brand-soft py-1 pl-3 pr-1 text-[14px] text-navy">
                      <Paperclip className="size-3.5" /> {n}
                      <button type="button" onClick={() => set("anexos", f.anexos.filter((_, j) => j !== i))} aria-label={`Remover ${n}`} className="flex size-8 items-center justify-center rounded-md hover:bg-paper"><X className="size-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1720px] items-center justify-end gap-3 px-4 py-3 md:px-8">
          {draft && <span className="mr-auto text-[14px] font-semibold text-warn-ink">Alterações não salvas</span>}
          <button type="button" disabled={!draft} onClick={() => setDraft(null)} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface disabled:opacity-50">Cancelar</button>
          <button type="button" disabled={!draft} onClick={save} className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-50">Atualizar</button>
        </div>
      </div>

      <p role="status" aria-live="polite" className={cn("fixed bottom-20 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
