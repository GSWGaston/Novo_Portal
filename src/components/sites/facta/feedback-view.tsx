"use client";

import { ClipboardList, MessageSquareHeart, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";
import { DatePicker, iso } from "./date-picker";
import { Select } from "./select";
import { useStored } from "./use-stored";

/* ---------- dados (demonstração, ficam no localStorage) ---------- */

export type Tipo = "lojas" | "adm";
type Status = "Rascunho" | "Aguardando resposta" | "Respondido";
type Nota = "A melhorar" | "Bom" | "Excelente";
type Missao = { month: string; mission: string; result: string; due: string };
type Feedback = {
  id: number;
  tipo: Tipo;
  status: Status;
  date: string;
  setor: string;
  uf: string;
  month: string;
  mode: "individual" | "equipe";
  colab: string;
  positives: string;
  improvements: string;
  ratings: Record<string, Nota>;
  missions: Missao[];
  plan: string;
};

const TIPOS: { id: Tipo; label: string }[] = [
  { id: "lojas", label: "Lojas" },
  { id: "adm", label: "Operacional/Adm" },
];
const STATUSES: Status[] = ["Rascunho", "Aguardando resposta", "Respondido"];
const NOTAS: Nota[] = ["A melhorar", "Bom", "Excelente"];
const BASE_CRITERIA = ["Pontualidade", "Assiduidade", "Proatividade", "Produtividade", "Valores da empresa"];
// os três critérios de vendas e loja só existem no formulário das lojas
const CRITERIA: Record<Tipo, string[]> = {
  lojas: [...BASE_CRITERIA, "Criatividade em vendas", "Desempenho técnico em vendas", "Clima organizacional da loja", "Gestão e acompanhamento da equipe"],
  adm: [...BASE_CRITERIA, "Gestão e acompanhamento da equipe"],
};
const SETORES = ["Comercial", "Financeiro", "Informática", "Jurídico", "Lojas", "Marketing", "Operacional", "Recursos Humanos"];
const UFS = ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"];
const COLABS: { name: string; reg: string }[] = [
  { name: "Ana Exemplo Alves", reg: "10231" },
  { name: "Bruno Exemplo Rocha", reg: "10458" },
  { name: "Carla Exemplo Souza", reg: "11002" },
  { name: "Diego Exemplo Lima", reg: "11317" },
  { name: "Elisa Exemplo Prado", reg: "12045" },
  { name: "Felipe Exemplo Costa", reg: "12388" },
];
const GESTOR = { name: currentUser.name, reg: "15166" };
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const monthsBack = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    return `${MONTH_NAMES[d.getMonth()]}/${d.getFullYear()}`;
  });
const STORAGE = "facta-feedbacks";
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const emptyMission = (): Missao => ({ month: "", mission: "", result: "", due: "" });
const brDate = (s: string) => s.split("-").reverse().join("/");

function seeds(): Feedback[] {
  const [m0, m1] = monthsBack(2);
  const base = { positives: "Boa comunicação com a equipe.", improvements: "Organizar melhor a agenda da semana.", missions: [emptyMission()], plan: "" };
  const all = (tipo: Tipo, n: Nota) => Object.fromEntries(CRITERIA[tipo].map((c) => [c, n])) as Record<string, Nota>;
  return [
    { ...base, id: 1001, tipo: "lojas", status: "Respondido", date: daysAgo(34), setor: "Lojas", uf: "Rio Grande do Sul", month: m1, mode: "individual", colab: COLABS[0].name, ratings: all("lojas", "Bom") },
    { ...base, id: 1002, tipo: "lojas", status: "Aguardando resposta", date: daysAgo(6), setor: "Lojas", uf: "Santa Catarina", month: m0, mode: "individual", colab: COLABS[1].name, ratings: all("lojas", "Excelente") },
    { ...base, id: 1003, tipo: "lojas", status: "Rascunho", date: daysAgo(1), setor: "Lojas", uf: "Rio Grande do Sul", month: m0, mode: "equipe", colab: "", ratings: {} },
    { ...base, id: 1004, tipo: "adm", status: "Aguardando resposta", date: daysAgo(3), setor: "Informática", uf: "Rio Grande do Sul", month: m0, mode: "individual", colab: COLABS[3].name, ratings: all("adm", "Bom") },
  ];
}

const STATUS_STYLE: Record<Status, string> = {
  Rascunho: "bg-surface text-ink-soft",
  "Aguardando resposta": "bg-warn-soft text-warn-ink",
  Respondido: "bg-ok-soft text-ok-ink",
};

function TipoTabs({ value, onChange, counts, label }: { value: Tipo; onChange: (t: Tipo) => void; counts?: Record<Tipo, number>; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
      {TIPOS.map((t) => (
        <button key={t.id} role="tab" type="button" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cn("flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", value === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
          {t.label}
          {counts && <span className={cn("tabular rounded-full px-2 py-0.5 text-[12px]", value === t.id ? "bg-white/15" : "bg-surface")}>{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- consulta (lojas e operacional/adm na mesma tela) ---------- */

export function FeedbackList({ initialTipo, saved }: { initialTipo: Tipo; saved?: string }) {
  const [list] = useStored<Feedback[]>(STORAGE, seeds);
  const [tipo, setTipo] = useState<Tipo>(initialTipo);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(saved === "rascunho" ? "Rascunho salvo." : saved ? "Feedback enviado." : "");
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const counts = { lojas: list.filter((f) => f.tipo === "lojas").length, adm: list.filter((f) => f.tipo === "adm").length };
  const term = q.trim().toLowerCase();
  const rows = list
    .filter((f) => f.tipo === tipo && (!status || f.status === status) && (!term || String(f.id).includes(term) || f.colab.toLowerCase().includes(term)))
    .sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "Formulário de Feedback" }, { label: "Consultar" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <MessageSquareHeart className="size-8 text-brand" strokeWidth={1.8} /> Feedback
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Acompanhe os feedbacks que você aplicou e continue os rascunhos.</p>
        </div>
        <Link href={`/rh/feedback/novo?tipo=${tipo}`} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Gerar feedback
        </Link>
      </div>

      <TipoTabs value={tipo} onChange={setTipo} counts={counts} label="Tipo de feedback" />

      <section className="rounded-3xl border border-paper bg-paper/90 p-4 shadow-card md:p-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar por código ou colaborador</span>
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-mute" />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código ou colaborador" className="h-11 w-full rounded-xl border border-line bg-paper pl-10 pr-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
          </label>
          <div className="md:w-[240px]">
            <Select aria-label="Status" value={status} onChange={setStatus} options={[{ value: "", label: "Todos os status" }, ...STATUSES]} placeholder="Todos os status" searchable={false} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-12 text-center">
            <ClipboardList className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-[16px] font-bold">Nenhum feedback encontrado.</p>
            <p className="text-[14px] text-ink-soft">{term || status ? "Tente outra busca ou outro status." : "Clique em Gerar feedback para aplicar o primeiro."}</p>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-[12px] font-bold uppercase tracking-wide text-ink-soft">
                  <th className="py-3 pr-4">#</th>
                  <th className="py-3 pr-4">Tipo</th>
                  <th className="py-3 pr-4">Gestor</th>
                  <th className="py-3 pr-4">Colaborador</th>
                  <th className="py-3 pr-4">Mês</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Data</th>
                  <th className="py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((f) => (
                  <tr key={f.id}>
                    <td className="py-3 pr-4 font-semibold tabular">{f.id}</td>
                    <td className="py-3 pr-4">{f.mode === "equipe" ? "Gestor para equipe" : "Gestor para colaborador"}</td>
                    <td className="py-3 pr-4">{GESTOR.name}</td>
                    <td className="py-3 pr-4 font-semibold">{f.mode === "equipe" ? `Equipe · ${f.setor}` : f.colab || "—"}</td>
                    <td className="py-3 pr-4">{f.month}</td>
                    <td className="py-3 pr-4"><span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-bold", STATUS_STYLE[f.status])}>{f.status}</span></td>
                    <td className="py-3 pr-4 tabular">{brDate(f.date)}</td>
                    <td className="py-3 text-right">
                      {f.status === "Rascunho" && (
                        <Link href={`/rh/feedback/novo?id=${f.id}`} className="inline-flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 font-bold text-brand hover:bg-brand-soft">
                          <Pencil className="size-4" /> Continuar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}

/* ---------- formulário ---------- */

const control = "w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);
const card = "rounded-3xl border border-paper bg-paper/90 p-5 shadow-card md:p-8";
const h2 = "text-[20px] font-bold";
type Errors = Partial<Record<"colab" | "positives" | "improvements" | "ratings", string>>;

function Rating({ name, value, onChange, invalid }: { name: string; value?: Nota; onChange: (n: Nota) => void; invalid: boolean }) {
  return (
    <fieldset className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <legend className="float-left text-[14px] font-semibold sm:float-none sm:contents">
        <span className={cn(invalid && !value && "text-danger-ink")}>{name}</span>
      </legend>
      <div className="clear-left flex gap-1 rounded-xl bg-surface p-1">
        {NOTAS.map((n) => (
          <label key={n} className={cn("flex h-10 coarse:h-11 flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-lg px-3 text-[14px] font-semibold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand/30 motion-reduce:transition-none sm:w-[112px] sm:flex-none", value === n ? (n === "A melhorar" ? "bg-warn text-white" : n === "Bom" ? "bg-brand text-white" : "bg-ok text-white") : "text-ink-soft hover:bg-paper")}>
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="sr-only" />
            {n}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Form({ initial, onSave }: { initial: Feedback; onSave: (f: Feedback) => void }) {
  const [f, setF] = useState<Feedback>(initial);
  const [err, setErr] = useState<Errors>({});
  const posRef = useRef<HTMLTextAreaElement>(null);
  const impRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLParagraphElement>(null);
  const set = <K extends keyof Feedback>(k: K, v: Feedback[K]) => {
    setF((o) => ({ ...o, [k]: v }));
    setErr((e) => ({ ...e, [k]: undefined }));
  };
  const criteria = CRITERIA[f.tipo];
  const colab = COLABS.find((c) => c.name === f.colab);
  const setMission = (i: number, k: keyof Missao, v: string) => set("missions", f.missions.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  const submit = (draft: boolean) => {
    if (!draft) {
      const missing = criteria.filter((c) => !f.ratings[c]).length;
      const next: Errors = {
        colab: f.mode === "individual" && !f.colab ? "Escolha o colaborador." : undefined,
        positives: f.positives.trim() ? undefined : "Descreva os pontos positivos.",
        improvements: f.improvements.trim() ? undefined : "Descreva as oportunidades de melhoria.",
        ratings: missing ? (missing === 1 ? "Falta avaliar 1 critério." : `Faltam avaliar ${missing} critérios.`) : undefined,
      };
      setErr(next);
      if (Object.values(next).some(Boolean)) {
        if (next.positives) posRef.current?.focus();
        else if (next.improvements) impRef.current?.focus();
        else topRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    onSave({ ...f, status: draft ? "Rascunho" : "Aguardando resposta", date: iso(new Date()), missions: f.missions.filter((m) => m.month || m.mission || m.result || m.due) });
  };
  const errCount = Object.values(err).filter(Boolean).length;

  return (
    <form noValidate onSubmit={(e) => (e.preventDefault(), submit(false))} className="space-y-6">
      {errCount > 0 && (
        <p ref={topRef} role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">
          {errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}
        </p>
      )}

      <section className={card} aria-labelledby="fb-dados">
        <h2 id="fb-dados" className={h2}>Dados do feedback</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <span id="fb-setor" className={label}>Setor</span>
            <Select aria-labelledby="fb-setor" value={f.setor} onChange={(v) => set("setor", v)} options={SETORES} searchable={false} />
          </div>
          <div>
            <span id="fb-uf" className={label}>UF</span>
            <Select aria-labelledby="fb-uf" value={f.uf} onChange={(v) => set("uf", v)} options={UFS} />
          </div>
          <div>
            <span id="fb-mes" className={label}>Mês de aplicação</span>
            <Select aria-labelledby="fb-mes" value={f.month} onChange={(v) => set("month", v)} options={monthsBack(6)} searchable={false} />
          </div>
        </div>
      </section>

      <section className={card} aria-labelledby="fb-part">
        <h2 id="fb-part" className={h2}>Participantes</h2>
        <div role="radiogroup" aria-label="Quem recebe o feedback" className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl bg-surface p-1">
          {(["individual", "equipe"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={f.mode === m} onClick={() => set("mode", m)} className={cn("h-11 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", f.mode === m ? "bg-navy text-white" : "text-ink-soft hover:bg-paper")}>
              {m === "individual" ? "De gestor para colaborador" : "De gestor para equipe"}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_200px]">
          <div>
            <span className={label}>Gestor(a)</span>
            <p className="flex h-11 items-center rounded-xl border border-line bg-surface px-3 text-[14px] font-semibold">{GESTOR.name}</p>
          </div>
          <div>
            <span className={label}>Matrícula</span>
            <p className="flex h-11 items-center rounded-xl border border-line bg-surface px-3 text-[14px] tabular">{GESTOR.reg}</p>
          </div>
          {f.mode === "individual" ? (
            <>
              <div>
                <span id="fb-colab" className={label}>Colaborador(a)<Req /></span>
                <Select aria-labelledby="fb-colab" aria-invalid={!!err.colab} value={f.colab} onChange={(v) => set("colab", v)} options={COLABS.map((c) => c.name)} placeholder="- Selecione o colaborador -" className={cn(err.colab && "border-danger")} />
                <Err m={err.colab} />
              </div>
              <div>
                <span className={label}>Matrícula</span>
                <p className="flex h-11 items-center rounded-xl border border-line bg-surface px-3 text-[14px] tabular text-ink-soft">{colab?.reg ?? "Preenchida ao escolher"}</p>
              </div>
            </>
          ) : (
            <p className="rounded-xl bg-brand-soft px-4 py-3 text-[14px] text-navy md:col-span-2">O feedback vale para toda a equipe do setor <span className="font-bold">{f.setor}</span>.</p>
          )}
        </div>
      </section>

      <section className={card} aria-labelledby="fb-comp">
        <h2 id="fb-comp" className={h2}>Comportamento no último mês</h2>
        <div className="mt-5 space-y-5">
          <div>
            <label htmlFor="fb-pos" className={label}>Aspectos comportamentais e atitudes positivas observadas<Req /></label>
            <textarea id="fb-pos" ref={posRef} rows={4} value={f.positives} maxLength={2000} aria-invalid={!!err.positives} onChange={(e) => set("positives", e.target.value)} className={cn(control, "resize-y py-2.5", err.positives ? "border-danger" : "border-line")} />
            <Err m={err.positives} />
          </div>
          <div>
            <label htmlFor="fb-imp" className={label}>Oportunidades de melhoria nos aspectos comportamentais e atitudes<Req /></label>
            <textarea id="fb-imp" ref={impRef} rows={4} value={f.improvements} maxLength={2000} aria-invalid={!!err.improvements} onChange={(e) => set("improvements", e.target.value)} className={cn(control, "resize-y py-2.5", err.improvements ? "border-danger" : "border-line")} />
            <Err m={err.improvements} />
          </div>
        </div>
      </section>

      <section className={card} aria-labelledby="fb-crit">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="fb-crit" className={h2}>Avalie os critérios<Req /></h2>
          <p className="text-[14px] text-ink-soft tabular">{criteria.filter((c) => f.ratings[c]).length} de {criteria.length} avaliados</p>
        </div>
        <Err m={err.ratings} />
        <div className="mt-3 divide-y divide-line">
          {criteria.map((c) => (
            <Rating key={c} name={c} value={f.ratings[c]} invalid={!!err.ratings} onChange={(n) => set("ratings", { ...f.ratings, [c]: n })} />
          ))}
        </div>
      </section>

      <section className={card} aria-labelledby="fb-mis">
        <h2 id="fb-mis" className={h2}>Missões</h2>
        <p className="mt-1 text-[14px] text-ink-soft">Histórico das missões combinadas nos últimos meses e o novo prazo, <span className="font-semibold text-ink">caso não tenham sido cumpridas no prazo anterior</span>.</p>
        <ul className="mt-5 space-y-3">
          {f.missions.map((m, i) => (
            <li key={i} className="grid gap-3 rounded-2xl border border-line p-3 md:grid-cols-[120px_1fr_1fr_170px_auto] md:items-end md:border-0 md:p-0">
              <div>
                <label htmlFor={`m-mes-${i}`} className={cn(label, i > 0 && "md:sr-only")}>Mês/Ano</label>
                <input id={`m-mes-${i}`} value={m.month} maxLength={7} placeholder="mm/aaaa" onChange={(e) => setMission(i, "month", e.target.value)} className={cn(control, "h-11 border-line tabular")} />
              </div>
              <div>
                <label htmlFor={`m-mis-${i}`} className={cn(label, i > 0 && "md:sr-only")}>Missão</label>
                <input id={`m-mis-${i}`} value={m.mission} maxLength={200} onChange={(e) => setMission(i, "mission", e.target.value)} className={cn(control, "h-11 border-line")} />
              </div>
              <div>
                <label htmlFor={`m-res-${i}`} className={cn(label, i > 0 && "md:sr-only")}>Resultado</label>
                <input id={`m-res-${i}`} value={m.result} maxLength={200} onChange={(e) => setMission(i, "result", e.target.value)} className={cn(control, "h-11 border-line")} />
              </div>
              <div>
                <span id={`m-prazo-${i}`} className={cn(label, i > 0 && "md:sr-only")}>Novo prazo</span>
                <DatePicker aria-labelledby={`m-prazo-${i}`} value={m.due} onChange={(v) => setMission(i, "due", v)} />
              </div>
              <button type="button" onClick={() => set("missions", f.missions.filter((_, j) => j !== i))} disabled={f.missions.length === 1} aria-label={`Remover missão ${i + 1}`} className="flex size-11 items-center justify-center justify-self-end rounded-lg text-ink-soft hover:bg-danger-soft hover:text-danger-ink disabled:invisible">
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => set("missions", [...f.missions, emptyMission()])} className="mt-4 flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-[14px] font-bold hover:border-brand hover:text-brand">
          <Plus className="size-4" /> Adicionar missão
        </button>

        <div className="mt-6">
          <label htmlFor="fb-plan" className={label}>Novas missões, encaminhamentos, combinações e plano de ação</label>
          <textarea id="fb-plan" rows={4} value={f.plan} maxLength={2000} onChange={(e) => set("plan", e.target.value)} className={cn(control, "resize-y border-line py-2.5")} />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-3">
        <Link href={`/rh/feedback?tipo=${f.tipo}`} className="flex h-12 items-center rounded-xl px-5 text-[16px] font-bold text-ink-soft hover:bg-paper">Cancelar</Link>
        <button type="button" onClick={() => submit(true)} className="h-12 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Salvar rascunho</button>
        <button type="submit" className="h-12 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Enviar feedback</button>
      </div>
    </form>
  );
}

export function FeedbackForm({ tipo: tipoParam, id }: { tipo: Tipo; id?: number }) {
  const router = useRouter();
  const [list, setList, loaded] = useStored<Feedback[]>(STORAGE, seeds);
  const [tipo, setTipo] = useState<Tipo>(tipoParam);
  const draft = id ? list.find((f) => f.id === id && f.status === "Rascunho") : undefined;

  const blank = (t: Tipo): Feedback => ({
    id: 0, tipo: t, status: "Rascunho", date: "", setor: SETORES[t === "lojas" ? 4 : 2], uf: "Rio Grande do Sul", month: monthsBack(1)[0],
    mode: "individual", colab: "", positives: "", improvements: "", ratings: {}, missions: [emptyMission()], plan: "",
  });
  const save = (f: Feedback) => {
    const next = f.id ? f : { ...f, id: Math.max(1000, ...list.map((x) => x.id)) + 1 };
    const all = f.id ? list.map((x) => (x.id === f.id ? next : x)) : [...list, next];
    setList(all);
    // grava já: a troca de página pode acontecer antes do efeito do useStored
    try {
      localStorage.setItem(STORAGE, JSON.stringify(all));
    } catch {
      /* segue em memória */
    }
    router.push(`/rh/feedback?tipo=${next.tipo}&salvo=${next.status === "Rascunho" ? "rascunho" : "enviado"}`);
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "Formulário de Feedback", href: `/rh/feedback?tipo=${tipo}` }, { label: draft ? `Rascunho #${draft.id}` : "Solicitar" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <MessageSquareHeart className="size-8 text-brand" strokeWidth={1.8} /> {draft ? "Continuar feedback" : "Novo feedback"}
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Os campos com * são obrigatórios. Você pode salvar como rascunho e terminar depois.</p>
      </div>

      {!draft && <TipoTabs value={tipo} onChange={setTipo} label="Formulário" />}

      {!loaded ? (
        <p className="py-10 text-center text-[14px] text-ink-soft">Carregando…</p>
      ) : id && !draft ? (
        <p className="rounded-xl bg-warn-soft px-4 py-3 text-[14px] font-semibold text-warn-ink">Este rascunho não foi encontrado ou já foi enviado.</p>
      ) : (
        <Form key={draft ? draft.id : tipo} initial={draft ?? blank(tipo)} onSave={save} />
      )}
    </div>
  );
}
