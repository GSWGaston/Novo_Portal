"use client";

import { Check, FolderKanban, Paperclip, Pencil, Plus, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";
import { DatePicker, iso } from "./date-picker";
import { Select } from "./select";
import { PriorityPill } from "./tickets-view";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

/* ---------- dados (demonstração, ficam no localStorage) ---------- */

type Priority = "Baixa" | "Média" | "Alta";
type Projeto = {
  id: number;
  title: string;
  category: string;
  priority: Priority;
  description: string;
  start: string;
  forecast: string;
  end: string;
  owner: string;
  files: string[];
};
type Draft = Omit<Projeto, "id"> & { id?: number };
type Tab = "projetos" | "demandas";

const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta"];
const BASE_CATEGORIES = ["Melhoria de processo", "Sistema interno", "Infraestrutura", "Treinamento"];
const STORAGE = "facta-projetos";
const STORAGE_CAT = "facta-projetos-categorias";
const br = (s: string) => (s ? s.split("-").reverse().join("/") : "—");
const shift = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

function seeds(): Projeto[] {
  const p = (id: number, title: string, category: string, priority: Priority, start: number, forecast: number, end?: number): Projeto => ({
    id, title, category, priority, description: "", start: shift(start), forecast: shift(forecast), end: end === undefined ? "" : shift(end), owner: currentUser.name, files: [],
  });
  return [
    p(1, "Padronizar abertura de chamados das lojas", "Melhoria de processo", "Alta", -20, 10),
    p(2, "Migrar planilha de ramais para o portal", "Sistema interno", "Média", -45, -5, -3),
    p(3, "Troca dos switches do 7º andar", "Infraestrutura", "Baixa", 7, 30),
  ];
}

/** Status calculado pelas datas: não há campo de status no cadastro. */
function statusOf(p: Projeto, today: string) {
  if (p.end) return { label: "Concluído", tone: "bg-ok-soft text-ok-ink" };
  if (p.start > today) return { label: "Planejado", tone: "bg-surface text-ink-soft ring-1 ring-line" };
  if (p.forecast && p.forecast < today) return { label: "Atrasado", tone: "bg-danger-soft text-danger-ink" };
  return { label: "Em andamento", tone: "bg-brand-soft text-brand" };
}


/* ---------- modal ---------- */

const control = "h-11 w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
type Errors = Partial<Record<"title" | "category" | "priority" | "start" | "forecast" | "end", string>>;

function Err({ id, m }: { id?: string; m?: string }) {
  return m ? <p id={id} className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null;
}

function ProjetoModal({ draft, categories, onAddCategory, onSave, onClose }: { draft: Draft; categories: string[]; onAddCategory: (c: string) => void; onSave: (d: Draft) => void; onClose: () => void }) {
  const [f, setF] = useState<Draft>(draft);
  const [err, setErr] = useState<Errors>({});
  const [newCat, setNewCat] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const box = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setF((o) => ({ ...o, [k]: v }));

  useModalFocus(box, titleRef, onClose);

  const addCategory = () => {
    const c = (newCat ?? "").trim();
    if (!c) return setNewCat(null);
    const existing = categories.find((o) => o.toLowerCase() === c.toLowerCase());
    if (!existing) onAddCategory(c);
    set("category", existing ?? c);
    setErr((e) => ({ ...e, category: undefined }));
    setNewCat(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {
      category: f.category ? undefined : "Escolha a categoria.",
      priority: f.priority ? undefined : "Escolha a prioridade.",
      title: f.title.trim() ? undefined : "Informe o título.",
      start: f.start ? undefined : "Informe a data inicial.",
      forecast: f.forecast && f.start && f.forecast < f.start ? "A previsão não pode ser antes da data inicial." : undefined,
      end: f.end && f.start && f.end < f.start ? "A data final não pode ser antes da data inicial." : undefined,
    };
    setErr(next);
    if (Object.values(next).some(Boolean)) {
      if (next.title) titleRef.current?.focus();
      return;
    }
    onSave({ ...f, title: f.title.trim(), description: f.description.trim() });
  };

  const errCount = Object.values(err).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="proj-title" noValidate onSubmit={submit} className="max-h-[94vh] w-full max-w-[760px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="proj-title" className="text-[20px] font-bold">{draft.id ? "Editar projeto" : "Cadastrar projeto"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-6 md:p-8">
          <p className="text-[14px] text-ink-soft">Os campos com * são obrigatórios.</p>
          {errCount > 0 && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">
              {errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1 flex h-8 coarse:h-11 items-center justify-between">
                <span id="proj-cat" className="text-[14px] font-semibold">Categoria<Req /></span>
                {newCat === null && (
                  <button type="button" onClick={() => setNewCat("")} className="flex h-8 coarse:h-11 items-center gap-1 rounded-lg px-2 text-[14px] font-bold text-brand hover:bg-brand-soft">
                    <Plus className="size-4" /> Nova categoria
                  </button>
                )}
              </div>
              {newCat === null ? (
                <Select aria-labelledby="proj-cat" aria-invalid={!!err.category} value={f.category} onChange={(v) => { set("category", v); setErr((e) => ({ ...e, category: undefined })); }} options={categories} placeholder="- Selecione -" className={cn(err.category && "border-danger")} />
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    aria-label="Nome da nova categoria"
                    value={newCat}
                    maxLength={40}
                    onChange={(e) => setNewCat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addCategory(); }
                      if (e.key === "Escape") { e.stopPropagation(); setNewCat(null); }
                    }}
                    placeholder="Ex.: Marketing"
                    className={cn(control, "border-line")}
                  />
                  <button type="button" onClick={addCategory} aria-label="Adicionar categoria" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-dark">
                    <Check className="size-5" />
                  </button>
                  <button type="button" onClick={() => setNewCat(null)} aria-label="Cancelar nova categoria" className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-paper hover:bg-surface">
                    <X className="size-5" />
                  </button>
                </div>
              )}
              <Err m={err.category} />
            </div>
            <div>
              {/* mesma altura da linha "Categoria + Nova categoria", para alinhar os campos */}
              <div className="mb-1 flex h-8 coarse:h-11 items-center">
                <span id="proj-pri" className="text-[14px] font-semibold">Prioridade<Req /></span>
              </div>
              <Select aria-labelledby="proj-pri" aria-invalid={!!err.priority} value={f.priority} onChange={(v) => { set("priority", v as Priority); setErr((e) => ({ ...e, priority: undefined })); }} options={PRIORITIES} placeholder="- Selecione -" searchable={false} className={cn(err.priority && "border-danger")} />
              <Err m={err.priority} />
            </div>
          </div>

          <div>
            <label htmlFor="proj-titulo" className={label}>Título<Req /></label>
            <input id="proj-titulo" ref={titleRef} value={f.title} maxLength={120} aria-invalid={!!err.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Padronizar abertura de chamados" className={cn(control, err.title ? "border-danger" : "border-line")} />
            <Err m={err.title} />
          </div>

          <div>
            <label htmlFor="proj-desc" className={label}>Descrição</label>
            <textarea id="proj-desc" value={f.description} rows={4} onChange={(e) => set("description", e.target.value)} placeholder="Objetivo, escopo e quem participa." className="w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span id="proj-ini" className={label}>Data inicial<Req /></span>
              <DatePicker aria-labelledby="proj-ini" aria-invalid={!!err.start} value={f.start} onChange={(v) => set("start", v)} />
              <Err m={err.start} />
            </div>
            <div>
              <span id="proj-prev" className={label}>Data prevista</span>
              <DatePicker aria-labelledby="proj-prev" aria-invalid={!!err.forecast} value={f.forecast} onChange={(v) => set("forecast", v)} />
              <Err m={err.forecast} />
            </div>
            <div>
              <span id="proj-fim" className={label}>Data final</span>
              <DatePicker aria-labelledby="proj-fim" aria-invalid={!!err.end} value={f.end} onChange={(v) => set("end", v)} />
              <Err m={err.end} />
              <p className="mt-1 text-[12px] text-ink-soft">Preencha ao concluir o projeto.</p>
            </div>
          </div>

          <div>
            <p className={label}>Anexos</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); set("files", [...f.files, ...Array.from(e.dataTransfer.files, (x) => x.name)]); }}
              className={cn("flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-5 text-center transition-colors motion-reduce:transition-none", dragOver ? "border-brand bg-brand-soft" : "border-line bg-surface/60")}
            >
              <Upload className="size-5 text-ink-soft" />
              <p className="text-[14px] text-ink-soft">Arraste arquivos aqui ou</p>
              <button type="button" onClick={() => fileInput.current?.click()} className="flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-[14px] font-bold hover:bg-brand-soft">
                <Paperclip className="size-4" /> Selecionar arquivos
              </button>
              <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Selecionar arquivos" onChange={(e) => { const names = Array.from(e.target.files ?? [], (x) => x.name); set("files", [...f.files, ...names]); e.target.value = ""; }} />
            </div>
            {f.files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {f.files.map((name, i) => (
                  <li key={`${name}-${i}`} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2 text-[14px]">
                    <Paperclip className="size-4 shrink-0 text-ink-soft" />
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    <button type="button" aria-label={`Remover ${name}`} onClick={() => set("files", f.files.filter((_, j) => j !== i))} className="flex size-8 coarse:size-11 items-center justify-center rounded-lg hover:bg-brand-soft">
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Salvar</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- tela ---------- */

export function ProjetosView() {
  const [list, setList] = useStored<Projeto[]>(STORAGE, seeds);
  const [extraCats, setExtraCats] = useStored<string[]>(STORAGE_CAT, () => []);
  const [tab, setTab] = useState<Tab>("projetos");
  const [modal, setModal] = useState<Draft | null>(null);
  const [picked, setPicked] = useState("");
  const [toast, setToast] = useState("");

  const today = iso(new Date());
  const categories = [...BASE_CATEGORIES, ...extraCats];
  const sorted = [...list].sort((a, b) => b.id - a.id);

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  };
  const openNew = () => setModal({ title: "", category: "", priority: "" as Priority, description: "", start: today, forecast: "", end: "", owner: currentUser.name, files: [] });
  const save = (d: Draft) => {
    if (d.id) setList((l) => l.map((p) => (p.id === d.id ? ({ ...d, id: d.id } as Projeto) : p)));
    else setList((l) => [...l, { ...d, id: Math.max(0, ...l.map((p) => p.id)) + 1 }]);
    setModal(null);
    say(d.id ? "Projeto atualizado." : "Projeto cadastrado.");
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "projetos", label: "Meus projetos" },
    { id: "demandas", label: "Minhas demandas" },
  ];
  const th = "whitespace-nowrap px-2.5 py-3 text-left text-[12px] font-bold uppercase tracking-wider text-ink-soft";
  const project = list.find((p) => String(p.id) === picked);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Agenda" }, { label: "Projetos" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <FolderKanban className="size-8 text-brand" strokeWidth={1.8} /> Projetos
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Cadastre seus projetos e acompanhe as demandas de cada um.</p>
        </div>
        <button type="button" onClick={openNew} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Cadastrar projeto
        </button>
      </div>

      <div role="tablist" aria-label="Seções de projetos" className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="projetos-painel" onClick={() => setTab(t.id)} className={cn("h-11 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
            {t.label}
          </button>
        ))}
      </div>

      <section id="projetos-painel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
        {tab === "projetos" ? (
          <>
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[20px] font-bold">Meus projetos</h2>
              <p aria-live="polite" className="text-[14px] text-ink-soft">{list.length === 1 ? "1 projeto" : `${list.length} projetos`}</p>
            </div>
            {list.length === 0 ? (
              <div className="p-10 text-center">
                <FolderKanban className="mx-auto size-8 text-ink-mute" />
                <p className="mt-2 text-[16px] font-bold">Você ainda não tem projetos.</p>
                <p className="text-[14px] text-ink-soft">Cadastre o primeiro para acompanhar prazos e demandas.</p>
                <button type="button" onClick={openNew} className="mt-3 h-11 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">Cadastrar projeto</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1080px] text-[14px]">
                  <thead className="bg-surface">
                    <tr>
                      <th scope="col" className={th}><span className="sr-only">Ações</span></th>
                      <th scope="col" className={th}>#</th>
                      <th scope="col" className={th}>Título</th>
                      <th scope="col" className={th}>Categoria</th>
                      <th scope="col" className={th}>Prioridade</th>
                      <th scope="col" className={th}>Status</th>
                      <th scope="col" className={th}>Início</th>
                      <th scope="col" className={th}>Previsão</th>
                      <th scope="col" className={th}>Fim</th>
                      <th scope="col" className={th}>Responsável</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p) => {
                      const s = statusOf(p, today);
                      return (
                        <tr key={p.id} className="border-t border-line">
                          <td className="px-2.5 py-2">
                            <button type="button" onClick={() => setModal({ ...p })} aria-label={`Editar projeto ${p.title}`} className="flex size-10 coarse:size-11 items-center justify-center rounded-lg text-brand hover:bg-brand-soft">
                              <Pencil className="size-4" />
                            </button>
                          </td>
                          <td className="tabular whitespace-nowrap px-2.5 py-3 font-semibold text-ink-soft">{p.id}</td>
                          <td className="min-w-[260px] px-2.5 py-3 font-semibold">
                            {p.title}
                            {p.files.length > 0 && (
                              <span className="ml-2 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-soft">
                                <Paperclip className="size-3.5" /> {p.files.length}
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-3">{p.category}</td>
                          <td className="px-2.5 py-3"><PriorityPill p={p.priority} /></td>
                          <td className="px-2.5 py-3">
                            <span className={cn("inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[14px] font-bold", s.tone)}>{s.label}</span>
                          </td>
                          <td className="tabular whitespace-nowrap px-2.5 py-3">{br(p.start)}</td>
                          <td className="tabular whitespace-nowrap px-2.5 py-3">{br(p.forecast)}</td>
                          <td className="tabular whitespace-nowrap px-2.5 py-3">{br(p.end)}</td>
                          <td className="whitespace-nowrap px-2.5 py-3">{p.owner}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-5 p-6">
            <div className="max-w-[480px]">
              <span id="dem-proj" className={label}>Projeto</span>
              <Select aria-labelledby="dem-proj" value={picked} onChange={setPicked} options={[{ value: "", label: "- Selecione o projeto -" }, ...sorted.map((p) => ({ value: String(p.id), label: p.title }))]} placeholder="- Selecione o projeto -" />
            </div>
            <div className="rounded-2xl border border-dashed border-line p-10 text-center">
              <FolderKanban className="mx-auto size-8 text-ink-mute" />
              {project ? (
                <>
                  <p className="mt-2 text-[16px] font-bold">Nenhuma demanda sua em “{project.title}”.</p>
                  <p className="text-[14px] text-ink-soft">Quando alguém atribuir uma demanda deste projeto a você, ela aparece aqui.</p>
                </>
              ) : (
                <p className="mt-2 text-[16px] font-bold">Escolha um projeto para ver suas demandas.</p>
              )}
            </div>
          </div>
        )}
      </section>

      {modal && <ProjetoModal key={modal.id ?? "new"} draft={modal} categories={categories} onAddCategory={(c) => setExtraCats((l) => [...l, c])} onSave={save} onClose={() => setModal(null)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
