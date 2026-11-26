"use client";

import { Lightbulb, Paperclip, Plus, Search, ThumbsDown, ThumbsUp, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser, initials } from "./data";
import { iso } from "./date-picker";
import { Select } from "./select";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

/* ---------- dados (demonstração, ficam no localStorage) ---------- */

type Status = "Pendente" | "Em análise" | "Aprovada" | "Implementada" | "Não aprovada";
type Ideia = { id: number; title: string; body: string; author: string; date: string; time: string; status: Status; files: string[]; up: number; down: number };
type Voto = 1 | -1;

const STATUSES: Status[] = ["Pendente", "Em análise", "Aprovada", "Implementada", "Não aprovada"];
const STATUS_STYLE: Record<Status, string> = {
  Pendente: "bg-surface text-ink-soft ring-1 ring-line",
  "Em análise": "bg-brand-soft text-brand-dark",
  Aprovada: "bg-warn-soft text-warn-ink",
  Implementada: "bg-ok-soft text-ok-ink",
  "Não aprovada": "bg-danger-soft text-danger-ink",
};
const SORTS = ["Mais recentes", "Mais votadas"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const asDate = (s: string) => new Date(`${s}T12:00:00`);
const brDate = (s: string) => s.split("-").reverse().join("/");

// As três primeiras são ideias reais do portal (texto corrigido); os autores são fictícios.
const seeds = (): Ideia[] => [
  {
    id: 5, title: "Acessibilidade no Horus", status: "Pendente", date: "2026-11-12", time: "15:21", author: "Ana Exemplo Alves", files: [], up: 3, down: 1,
    body: "Proponho adicionar alguma funcionalidade que permita aumentar o tamanho das fontes (letras) no sistema Horus. Isso seria de enorme ajuda para quem tem alguma restrição visual (miopia, visão monocular etc.), pois às vezes acabamos forçando a vista para identificar dados como benefício e números de AFs.\n\nObrigado pela compreensão.",
  },
  {
    id: 4, title: "#melhoria #crm #templates", status: "Pendente", date: "2026-09-28", time: "12:08", author: "Bruno Exemplo Rocha", files: [], up: 5, down: 1,
    body: "Gostaria de sugerir uma melhoria nas mensagens prontas que encaminhamos para os clientes no DigSac. Não temos nenhuma mensagem de abordagem inicial: em todas as mensagens há a pressuposição de que o cliente já fechou algum produto ou tem algo pendente, o que na maioria das vezes nem foi negociado. Precisamos de uma mensagem que não faça o cliente ter medo de clicar ou responder! Muitas vezes perdemos a venda ou somos bloqueados justamente por causa dessa mensagem. Se a Facta nos limita a usar apenas o DigSac como canal de atendimento, ele precisa ser melhorado.",
  },
  {
    id: 3, title: "Vendas no SAC", status: "Em análise", date: "2026-07-14", time: "09:47", author: "Carla Exemplo Souza", files: ["fluxo-atendimento-sac.pdf"], up: 2, down: 0,
    body: "Gostaria de compartilhar uma sugestão em relação ao processo de vendas realizado atualmente pelo SAC.\n\nEntendo que a iniciativa de possibilitar vendas através do SAC é uma ideia válida, pois amplia as oportunidades de atendimento e facilita a jornada do cliente.",
  },
  { id: 2, title: "Modo escuro no portal", status: "Implementada", date: "2026-04-02", time: "17:30", author: "Diego Exemplo Lima", files: [], up: 9, down: 0, body: "Um tema escuro ajudaria quem passa o dia inteiro com o portal aberto, principalmente no fim da tarde." },
  { id: 1, title: "Busca por CPF na tela de solicitações", status: "Não aprovada", date: "2026-02-19", time: "10:05", author: "Elisa Exemplo Prado", files: [], up: 1, down: 2, body: "Seria útil pesquisar solicitações pelo CPF do cliente, sem precisar do código." },
];

/* ---------- nova ideia ---------- */

const control = "w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);

function IdeiaModal({ onSave, onClose }: { onSave: (d: Pick<Ideia, "title" | "body" | "files">) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [err, setErr] = useState<{ title?: string; body?: string }>({});
  const box = useRef<HTMLFormElement>(null);
  const tRef = useRef<HTMLInputElement>(null);
  const bRef = useRef<HTMLTextAreaElement>(null);
  useModalFocus(box, tRef, onClose);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { title: title.trim() ? undefined : "Dê um título para a ideia.", body: body.trim() ? undefined : "Descreva a ideia." };
    setErr(next);
    if (next.title) return tRef.current?.focus();
    if (next.body) return bRef.current?.focus();
    onSave({ title: title.trim(), body: body.trim(), files });
  };
  const errCount = Object.values(err).filter(Boolean).length;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="ideia-title" noValidate onSubmit={submit} className="max-h-[94vh] w-full max-w-[680px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="ideia-title" className="text-[20px] font-bold">Nova ideia</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft"><X className="size-5" /></button>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <p className="text-[14px] text-ink-soft">Conte qual sistema, o que poderia mudar e como isso ajudaria. Você pode usar hashtags no título, como #portal ou #crm.</p>
          {errCount > 0 && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">{errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}</p>
          )}
          <div>
            <label htmlFor="id-tit" className={label}>Título<Req /></label>
            <input id="id-tit" ref={tRef} value={title} maxLength={100} aria-invalid={!!err.title} onChange={(e) => (setTitle(e.target.value), setErr({ ...err, title: undefined }))} placeholder="Ex.: Aumentar a fonte no Horus" className={cn(control, "h-11", err.title ? "border-danger" : "border-line")} />
            <Err m={err.title} />
          </div>
          <div>
            <label htmlFor="id-desc" className={label}>Descrição<Req /></label>
            <textarea id="id-desc" ref={bRef} rows={6} value={body} maxLength={3000} aria-invalid={!!err.body} onChange={(e) => (setBody(e.target.value), setErr({ ...err, body: undefined }))} className={cn(control, "resize-y py-2.5", err.body ? "border-danger" : "border-line")} />
            <Err m={err.body} />
          </div>
          <div>
            <span className={label}>Arquivos</span>
            <label className="flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-line bg-surface px-4 py-4 text-center text-[14px] text-ink-soft hover:border-brand hover:text-brand focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
              <Upload className="size-5" />
              <span><span className="font-bold">Escolha arquivos</span> (prints, PDFs, planilhas)</span>
              <input type="file" multiple className="sr-only" onChange={(e) => setFiles((f) => [...f, ...[...(e.target.files ?? [])].map((x) => x.name)])} />
            </label>
            {files.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {files.map((n, i) => (
                  <li key={`${n}-${i}`} className="flex items-center gap-1.5 rounded-lg bg-brand-soft py-1 pl-3 pr-1 text-[14px] text-navy">
                    <Paperclip className="size-3.5" /> {n}
                    <button type="button" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))} aria-label={`Remover ${n}`} className="flex size-8 items-center justify-center rounded-md hover:bg-paper"><X className="size-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Enviar ideia</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- card ---------- */

function IdeiaCard({ i, vote, onVote }: { i: Ideia; vote?: Voto; onVote: (v: Voto) => void }) {
  const [open, setOpen] = useState(false);
  const long = i.body.length > 280;
  const up = i.up + (vote === 1 ? 1 : 0);
  const down = i.down + (vote === -1 ? 1 : 0);
  return (
    <article className="rounded-2xl border border-line bg-paper p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[18px] font-bold leading-snug text-navy">{i.title}</h3>
        <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-bold", STATUS_STYLE[i.status])}>{i.status}</span>
      </div>
      <p className={cn("mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft", long && !open && "line-clamp-4")}>{i.body}</p>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-1 text-[14px] font-bold text-brand hover:underline">
          {open ? "Mostrar menos" : "Ler mais"}
        </button>
      )}
      {i.files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {i.files.map((f) => (
            <li key={f} className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1 text-[13px] text-ink-soft"><Paperclip className="size-3.5" /> {f}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex items-center gap-2 text-[14px] text-ink-soft">
          <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[12px] font-bold text-brand">{initials(i.author)}</span>
          <span><span className="font-semibold text-ink">{i.author}</span> · <span className="tabular">{brDate(i.date)} às {i.time}</span></span>
        </p>
        <div className="flex items-center gap-1">
          <button type="button" aria-pressed={vote === 1} aria-label={`Concordo (${up})`} onClick={() => onVote(1)} className={cn("flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold tabular transition-colors motion-reduce:transition-none", vote === 1 ? "bg-brand text-white" : "text-ink-soft hover:bg-brand-soft hover:text-brand")}>
            <ThumbsUp className={cn("size-4", vote === 1 && "fill-current")} /> {up}
          </button>
          <button type="button" aria-pressed={vote === -1} aria-label={`Discordo (${down})`} onClick={() => onVote(-1)} className={cn("flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold tabular transition-colors motion-reduce:transition-none", vote === -1 ? "bg-danger text-white" : "text-ink-soft hover:bg-danger-soft hover:text-danger-ink")}>
            <ThumbsDown className={cn("size-4", vote === -1 && "fill-current")} /> {down}
          </button>
        </div>
      </div>
    </article>
  );
}

function DateNode({ date }: { date: string }) {
  const d = asDate(date);
  return (
    <div className="flex items-center gap-4">
      <div className="relative z-10 flex size-12 shrink-0 flex-col items-center justify-center rounded-full border-2 border-brand/30 bg-paper leading-none md:size-16">
        <span className="tabular text-[18px] font-bold md:text-[20px]">{String(d.getDate()).padStart(2, "0")}</span>
        <span className="mt-0.5 text-[12px] font-bold uppercase text-ink-soft">{MONTHS[d.getMonth()]}</span>
      </div>
      <span className="text-[14px] font-semibold text-ink-soft">{d.getFullYear()}</span>
    </div>
  );
}

/* ---------- tela ---------- */

export function IdeiasView() {
  const [list, setList] = useStored<Ideia[]>("facta-ideias", seeds);
  const [votes, setVotes] = useStored<Record<number, Voto>>("facta-ideias-votos", () => ({}));
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState(SORTS[0]);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");

  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const words = norm(q).split(/\s+/).filter(Boolean);
  const score = (i: Ideia) => i.up - i.down + (votes[i.id] ?? 0);
  const shown = list
    .filter((i) => (!status || i.status === status) && words.every((w) => norm(`${i.title} ${i.body} ${i.author}`).includes(w)))
    .sort((a, b) => (sort === SORTS[1] ? score(b) - score(a) : 0) || b.date.localeCompare(a.date) || b.id - a.id);
  const byDate = sort === SORTS[0];
  const days = [...new Set(shown.map((i) => i.date))];
  const chip = (active: boolean) => cn("flex h-10 coarse:h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-semibold transition-colors motion-reduce:transition-none", active ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink");

  const vote = (id: number, v: Voto) => setVotes((o) => {
    const next = { ...o };
    if (next[id] === v) delete next[id];
    else next[id] = v;
    return next;
  });
  const save = (d: Pick<Ideia, "title" | "body" | "files">) => {
    const now = new Date();
    setList((l) => [...l, { ...d, id: Math.max(0, ...l.map((x) => x.id)) + 1, author: currentUser.name, date: iso(now), time: now.toTimeString().slice(0, 5), status: "Pendente", up: 0, down: 0 }]);
    setModal(false);
    setStatus("");
    setSort(SORTS[0]);
    setToast("Ideia enviada para a equipe de programação.");
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Ajuda" }, { label: "Banco de Ideias" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <Lightbulb className="size-8 text-brand" strokeWidth={1.8} /> Banco de Ideias
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Sugestões e ideias para os sistemas. A equipe de programação lê todas, e você pode apoiar as dos colegas.</p>
        </div>
        <button type="button" onClick={() => setModal(true)} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Nova ideia
        </button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Buscar ideias</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-mute" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, texto ou autor" className={cn(control, "h-11 border-line pl-10")} />
        </label>
        <div className="md:w-[200px]">
          <Select aria-label="Ordenar" value={sort} onChange={setSort} options={SORTS} searchable={false} />
        </div>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filtrar por status">
        <button type="button" aria-pressed={!status} onClick={() => setStatus("")} className={chip(!status)}>Todas <span className="tabular text-[12px] opacity-70">{list.length}</span></button>
        {STATUSES.map((s) => (
          <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(status === s ? "" : s)} className={chip(status === s)}>
            {s}
            <span className="tabular text-[12px] opacity-70">{list.filter((i) => i.status === s).length}</span>
          </button>
        ))}
      </div>

      <section aria-label="Ideias" className="rounded-3xl border border-paper bg-paper/90 p-4 shadow-card md:p-8">
        {shown.length === 0 ? (
          <div className="py-10 text-center">
            <Lightbulb className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-[16px] font-bold">Nenhuma ideia encontrada.</p>
            <p className="text-[14px] text-ink-soft">Tente outra busca ou envie a sua.</p>
          </div>
        ) : byDate ? (
          <ol className="relative">
            <span aria-hidden className="absolute bottom-6 left-6 top-6 w-0.5 -translate-x-1/2 bg-brand/20 md:bottom-8 md:left-8 md:top-8" />
            {days.map((day) => (
              <li key={day} className="relative pb-8 last:pb-0">
                <DateNode date={day} />
                <div className="mt-3 space-y-3 pl-14 md:pl-[88px]">
                  {shown.filter((i) => i.date === day).map((i) => (
                    <IdeiaCard key={i.id} i={i} vote={votes[i.id]} onVote={(v) => vote(i.id, v)} />
                  ))}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="space-y-3">
            {shown.map((i) => (
              <IdeiaCard key={i.id} i={i} vote={votes[i.id]} onVote={(v) => vote(i.id, v)} />
            ))}
          </div>
        )}
      </section>

      {modal && <IdeiaModal onSave={save} onClose={() => setModal(false)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
