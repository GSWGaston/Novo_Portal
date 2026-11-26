"use client";

import { BookOpen, BookX, CalendarDays, Clock, FileText, Lightbulb, MessageSquare, Plus, Search, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";
import { iso } from "./date-picker";
import { Select } from "./select";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

/* ---------- dados (acervo de demonstração; sugestões ficam no localStorage) ---------- */

type Livro = { id: number; title: string; author: string; publisher: string; year: number; pages: number; genre: string; available: boolean };
type Status = "Em análise" | "Aprovada" | "Não aprovada";
type Sugestao = { id: number; title: string; author: string; reason: string; by: string; date: string; status: Status; feedback?: string };
type Tab = "acervo" | "sugestoes";

const PICKUP = "Retirada e devolução às sextas-feiras, das 16h às 17h, na Recepção RH.";

const L = (id: number, title: string, author: string, publisher: string, year: number, pages: number, genre: string, available = true): Livro => ({ id, title, author, publisher, year, pages, genre, available });
const BOOKS: Livro[] = [
  L(1, "Esperança para a Família", "Willie e Elaine Oliver", "Casa Publicadora Brasileira", 2019, 80, "Relações Humanas"),
  L(2, "O Girassol na Ventania e outras histórias", "Marco De Curtis", "Editora Sulina", 2009, 269, "Crônicas"),
  L(3, "Equipes 100% energizadas", "Heike Bruch e Bernd Vogel", "Editora Vozes", 2011, 295, "Administração e Negócios"),
  L(4, "1501 maneiras de premiar seus colaboradores", "Bob Nelson", "Sextante", 2014, 287, "Administração e Negócios"),
  L(5, "Os 7 hábitos das pessoas altamente eficazes", "Stephen R. Covey", "Franklin Covey", 2017, 432, "Autoajuda", false),
  L(6, "Mindset: a nova psicologia do sucesso", "Carol S. Dweck", "Objetiva", 2017, 312, "Autoajuda"),
  L(7, "O poder do hábito", "Charles Duhigg", "Objetiva", 2012, 408, "Autoajuda", false),
  L(8, "Comunicação não violenta", "Marshall B. Rosenberg", "Ágora", 2006, 288, "Comunicação"),
  L(9, "Rápido e devagar", "Daniel Kahneman", "Objetiva", 2012, 608, "Filosofia"),
  L(10, "Incansáveis", "Maurício Benvenutti", "Gente", 2016, 240, "Administração e Negócios"),
  L(11, "A arte da guerra", "Sun Tzu", "Editora Vozes", 2015, 160, "História"),
  L(12, "Inteligência emocional", "Daniel Goleman", "Objetiva", 2012, 384, "Relações Humanas", false),
];
const GENRES = [...new Set(BOOKS.map((b) => b.genre))].sort((a, b) => a.localeCompare(b, "pt-BR"));
const SORTS = ["Título (A–Z)", "Mais recentes", "Mais antigos"];

// capa gerada: cor por gênero (o acervo real tem fotos de capa; aqui não temos as imagens)
const COVER = ["from-[#0b5fe0] to-[#052a66]", "from-[#17a05d] to-[#0c4a2c]", "from-[#f08a00] to-[#8f3c00]", "from-[#7a3fd1] to-[#33166b]", "from-[#e5391f] to-[#7a1608]", "from-[#0a8c9c] to-[#06404a]"];
const coverOf = (genre: string) => COVER[GENRES.indexOf(genre) % COVER.length];

const SUG_KEY = "facta-biblioteca-sugestoes";
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const seeds = (): Sugestao[] => [
  { id: 1, title: "Essencialismo", author: "Greg McKeown", reason: "Ajuda a priorizar o que importa no trabalho.", by: "Ana Exemplo Alves", date: daysAgo(40), status: "Aprovada", feedback: "Compra aprovada. O livro chega no próximo mês." },
  { id: 2, title: "A coragem de ser imperfeito", author: "Brené Brown", reason: "Bom para conversas sobre liderança e feedback.", by: "Carla Exemplo Souza", date: daysAgo(12), status: "Em análise" },
  { id: 3, title: "Curso avançado de Excel", author: "", reason: "Para o time de relatórios.", by: "Bruno Exemplo Rocha", date: daysAgo(25), status: "Não aprovada", feedback: "Já temos dois títulos de Excel no acervo. Procure em Informática." },
];
const brDate = (s: string) => s.split("-").reverse().join("/");

/* ---------- peças ---------- */

function Cover({ b, big }: { b: Livro; big?: boolean }) {
  return (
    <div aria-hidden className={cn("relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br p-4 pl-6 text-white shadow-[0_12px_24px_-12px_rgba(5,42,102,0.6)]", coverOf(b.genre), big && "p-5 pl-7")}>
      <span className="absolute inset-y-0 left-2 w-px bg-white/25" />
      <span className={cn("font-semibold uppercase tracking-wider text-white/75", big ? "text-[12px]" : "text-[11px]")}>{b.author}</span>
      <span className={cn("font-extrabold leading-tight [text-wrap:balance]", big ? "text-[22px]" : "text-[15px] sm:text-[17px]", "hyphens-auto [overflow-wrap:anywhere]")}>{b.title}</span>
      <span className="text-[11px] font-semibold text-white/60">{b.publisher}</span>
    </div>
  );
}

const Disp = ({ ok }: { ok: boolean }) => (
  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-bold", ok ? "bg-ok-soft text-ok-ink" : "bg-warn-soft text-warn-ink")}>{ok ? "Disponível" : "Emprestado"}</span>
);

const STATUS_STYLE: Record<Status, string> = {
  "Em análise": "bg-brand-soft text-brand-dark",
  Aprovada: "bg-ok-soft text-ok-ink",
  "Não aprovada": "bg-danger-soft text-danger-ink",
};

const overlay = "fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]";
const panel = "max-h-[94vh] w-full overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]";

function CloseBtn({ onClose, btn }: { onClose: () => void; btn?: React.Ref<HTMLButtonElement> }) {
  return (
    <button ref={btn} type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
      <X className="size-5" />
    </button>
  );
}

function LivroModal({ b, onClose }: { b: Livro; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useModalFocus(box, close, onClose);
  const rows: [string, React.ReactNode][] = [
    ["Autor", b.author],
    ["Editora", b.publisher],
    ["Gênero", b.genre],
    ["Ano", <span key="y" className="tabular">{b.year}</span>],
    ["Páginas", <span key="p" className="tabular">{b.pages}</span>],
  ];
  return (
    <div className={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="livro-title" className={cn(panel, "max-w-[680px]")}>
        <div className="flex justify-end px-5 pt-5">
          <CloseBtn onClose={onClose} btn={close} />
        </div>
        <div className="grid gap-6 px-6 pb-8 sm:grid-cols-[200px_1fr] md:px-8">
          <div className="mx-auto w-[180px] sm:w-full"><Cover b={b} big /></div>
          <div>
            <Disp ok={b.available} />
            <h2 id="livro-title" className="mt-2 text-[24px] font-extrabold leading-tight">{b.title}</h2>
            <dl className="mt-4 divide-y divide-line border-y border-line">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5 text-[14px]">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex gap-2 rounded-xl bg-brand-soft px-4 py-3 text-[14px] text-navy">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {b.available ? PICKUP : "Este título está emprestado. Assim que for devolvido, ele volta a aparecer como disponível."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const control = "w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);

function SugestaoModal({ onSave, onClose }: { onSave: (s: Pick<Sugestao, "title" | "author" | "reason">) => void; onClose: () => void }) {
  const [f, setF] = useState({ title: "", author: "", reason: "" });
  const [err, setErr] = useState<{ title?: string; reason?: string }>({});
  const box = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  useModalFocus(box, titleRef, onClose);
  const set = (k: keyof typeof f, v: string) => {
    setF((o) => ({ ...o, [k]: v }));
    setErr((e) => ({ ...e, [k]: undefined }));
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      title: f.title.trim() ? undefined : "Informe o título do livro.",
      reason: f.reason.trim() ? undefined : "Conte por que o livro seria útil.",
    };
    setErr(next);
    if (next.title) return titleRef.current?.focus();
    if (next.reason) return reasonRef.current?.focus();
    onSave({ title: f.title.trim(), author: f.author.trim(), reason: f.reason.trim() });
  };
  const errCount = Object.values(err).filter(Boolean).length;

  return (
    <div className={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="sug-title" noValidate onSubmit={submit} className={cn(panel, "max-w-[600px]")}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="sug-title" className="text-[20px] font-bold">Sugerir título</h2>
          <CloseBtn onClose={onClose} />
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <p className="text-[14px] text-ink-soft">Deixe sua indicação e a justificativa. O RH analisa e responde por aqui. Os campos com * são obrigatórios.</p>
          {errCount > 0 && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">
              {errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}
            </p>
          )}
          <div>
            <label htmlFor="sug-tit" className={label}>Título do livro<Req /></label>
            <input id="sug-tit" ref={titleRef} value={f.title} maxLength={140} aria-invalid={!!err.title} onChange={(e) => set("title", e.target.value)} className={cn(control, "h-11", err.title ? "border-danger" : "border-line")} />
            <Err m={err.title} />
          </div>
          <div>
            <label htmlFor="sug-aut" className={label}>Autor</label>
            <input id="sug-aut" value={f.author} maxLength={100} onChange={(e) => set("author", e.target.value)} className={cn(control, "h-11 border-line")} />
          </div>
          <div>
            <label htmlFor="sug-just" className={label}>Justificativa<Req /></label>
            <textarea id="sug-just" ref={reasonRef} rows={4} value={f.reason} maxLength={600} aria-invalid={!!err.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Por que esse livro seria útil para a equipe?" className={cn(control, "resize-y py-2.5", err.reason ? "border-danger" : "border-line")} />
            <Err m={err.reason} />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Enviar sugestão</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- abas ---------- */

function Acervo({ onOpen }: { onOpen: (b: Livro) => void }) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [sort, setSort] = useState(SORTS[0]);

  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const nq = norm(q.trim());
  const list = BOOKS.filter((b) => (!genre || b.genre === genre) && (!onlyFree || b.available) && (!nq || norm(`${b.title} ${b.author} ${b.publisher}`).includes(nq))).sort((a, b) =>
    sort === SORTS[1] ? b.year - a.year : sort === SORTS[2] ? a.year - b.year : a.title.localeCompare(b.title, "pt-BR"),
  );
  const chip = (active: boolean) => cn("flex h-10 coarse:h-11 items-center gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition-colors motion-reduce:transition-none", active ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar no acervo</span>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-mute" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, autor ou editora" className={cn(control, "h-11 border-line pl-10")} />
        </label>
        <div className="md:w-[220px]">
          <Select aria-label="Ordenar por" value={sort} onChange={setSort} options={SORTS} searchable={false} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por gênero">
        <button type="button" aria-pressed={!genre} onClick={() => setGenre("")} className={chip(!genre)}>Todos</button>
        {GENRES.map((g) => (
          <button key={g} type="button" aria-pressed={genre === g} onClick={() => setGenre(genre === g ? "" : g)} className={chip(genre === g)}>
            {g}
            <span className="tabular text-[12px] opacity-70">{BOOKS.filter((b) => b.genre === g).length}</span>
          </button>
        ))}
        <label className="ml-auto flex h-10 coarse:h-11 cursor-pointer items-center gap-2 text-[14px] font-semibold text-ink-soft">
          <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} className="size-4 accent-brand" />
          Só disponíveis
        </label>
      </div>

      <p className="text-[14px] text-ink-soft" aria-live="polite">{list.length === 1 ? "1 livro encontrado" : `${list.length} livros encontrados`}</p>

      {list.length === 0 ? (
        <div className="py-10 text-center">
          <BookX className="mx-auto size-8 text-ink-mute" />
          <p className="mt-2 text-[16px] font-bold">Nenhum livro com esses filtros.</p>
          <p className="text-[14px] text-ink-soft">Não achou o que procura? Sugira o título na aba Sugestões.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {list.map((b) => (
            <li key={b.id}>
              <button type="button" onClick={() => onOpen(b)} className="group block w-full rounded-xl text-left outline-none focus-visible:ring-4 focus-visible:ring-brand/30">
                <div className="transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                  <Cover b={b} />
                </div>
                <div className="mt-3 space-y-1">
                  <Disp ok={b.available} />
                  <h3 className="line-clamp-2 text-[15px] font-bold leading-snug group-hover:text-brand">{b.title}</h3>
                  <p className="truncate text-[14px] text-ink-soft">{b.author}</p>
                  <p className="flex items-center gap-3 text-[12px] text-ink-mute">
                    <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /><span className="tabular">{b.year}</span></span>
                    <span className="flex items-center gap-1"><FileText className="size-3.5" /><span className="tabular">{b.pages} p.</span></span>
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Sugestoes({ list, onNew }: { list: Sugestao[]; onNew: () => void }) {
  if (list.length === 0)
    return (
      <div className="py-10 text-center">
        <Lightbulb className="mx-auto size-8 text-ink-mute" />
        <p className="mt-2 text-[16px] font-bold">Nenhuma sugestão ainda.</p>
        <button type="button" onClick={onNew} className="mt-3 h-11 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">Sugerir título</button>
      </div>
    );
  return (
    <ul className="divide-y divide-line">
      {list.map((s) => (
        <li key={s.id} className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto] md:gap-6">
          <div className="min-w-0">
            <h3 className="text-[16px] font-bold">
              {s.title}
              {s.author && <span className="font-medium text-ink-soft"> · {s.author}</span>}
            </h3>
            <p className="mt-1 text-[14px] text-ink-soft">{s.reason}</p>
            {s.feedback && (
              <p className="mt-2 flex gap-2 rounded-xl bg-surface px-3 py-2 text-[14px]">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-brand" />
                <span><span className="font-semibold">Resposta do RH:</span> {s.feedback}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1.5">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-bold", STATUS_STYLE[s.status])}>{s.status}</span>
            <span className="text-[14px] text-ink-soft">{s.by}</span>
            <span className="tabular text-[12px] text-ink-mute">{brDate(s.date)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- tela ---------- */

export function BibliotecaView() {
  const [tab, setTab] = useState<Tab>("acervo");
  const [sugs, setSugs] = useStored<Sugestao[]>(SUG_KEY, seeds);
  const [book, setBook] = useState<Livro | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [toast, setToast] = useState("");

  const sortedSugs = [...sugs].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const save = (s: Pick<Sugestao, "title" | "author" | "reason">) => {
    setSugs((l) => [...l, { ...s, id: Math.max(0, ...l.map((x) => x.id)) + 1, by: currentUser.name, date: iso(new Date()), status: "Em análise" }]);
    setSuggesting(false);
    setTab("sugestoes");
    setToast("Sugestão enviada. O RH vai analisar.");
    window.setTimeout(() => setToast(""), 3000);
  };
  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "acervo", label: "Acervo", n: BOOKS.length },
    { id: "sugestoes", label: "Sugestões", n: sugs.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "Biblioteca" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <BookOpen className="size-8 text-brand" strokeWidth={1.8} /> Biblioteca
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Encontre um livro para pegar emprestado ou sugira um título para o acervo.</p>
        </div>
        <button type="button" onClick={() => setSuggesting(true)} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Sugerir título
        </button>
      </div>

      <p className="flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-soft px-5 py-3.5 text-[14px] text-navy">
        <Clock className="size-5 shrink-0 text-brand" />
        <span><span className="font-bold">Retirada e devolução:</span> sextas-feiras, das 16h às 17h, na Recepção RH.</span>
      </p>

      <div role="tablist" aria-label="Biblioteca" className="inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="bib-painel" onClick={() => setTab(t.id)} className={cn("flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
            {t.label}
            <span className={cn("tabular rounded-full px-2 py-0.5 text-[12px]", tab === t.id ? "bg-white/15" : "bg-surface")}>{t.n}</span>
          </button>
        ))}
      </div>

      <section id="bib-painel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="rounded-3xl border border-paper bg-paper/90 p-4 shadow-card md:p-8">
        {tab === "acervo" ? <Acervo onOpen={setBook} /> : <Sugestoes list={sortedSugs} onNew={() => setSuggesting(true)} />}
      </section>

      {book && <LivroModal b={book} onClose={() => setBook(null)} />}
      {suggesting && <SugestaoModal onSave={save} onClose={() => setSuggesting(false)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
