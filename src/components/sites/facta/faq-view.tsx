"use client";

import { ArrowRight, ChevronDown, CircleHelp, Lightbulb, MessageSquarePlus, Pencil, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { Select } from "./select";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

/* ---------- dados (exemplos baseados nas telas do portal; ficam no localStorage) ---------- */

type Faq = { id: number; cat: string; q: string; a: string; link?: { href: string; label: string } };

const CATS = ["Solicitações", "Acesso ao portal", "Reservas e agenda", "Recursos Humanos", "Sugestões"];
const seeds = (): Faq[] => [
  { id: 1, cat: "Solicitações", q: "Como abro uma solicitação para outro setor?", a: "Vá em Solicitações > Nova solicitação, escolha o setor responsável e o assunto, descreva o que precisa e anexe arquivos se houver. Você recebe um código para acompanhar.", link: { href: "/solicitacoes/nova", label: "Abrir solicitação" } },
  { id: 2, cat: "Solicitações", q: "Onde acompanho as solicitações que abri?", a: "Em Solicitações > Minhas solicitações. Clique em uma linha para ver o histórico, as respostas do setor e anexar novas informações.", link: { href: "/solicitacoes/minhas", label: "Minhas solicitações" } },
  { id: 3, cat: "Solicitações", q: "O que significa cada status da solicitação?", a: "Em desenvolvimento: o setor está trabalhando nela. Aguardando solicitante: o setor precisa de uma resposta sua para continuar. Pendente validação: o atendimento terminou e espera a sua confirmação. Concluído: encerrada." },
  { id: 4, cat: "Acesso ao portal", q: "Esqueci minha senha. O que faço?", a: "Peça a troca de senha ao setor de Informática por uma solicitação. Se você não conseguir entrar no portal, peça a um colega ou ao seu gestor para abrir a solicitação por você." },
  { id: 5, cat: "Acesso ao portal", q: "Onde encontro o ramal de um colega?", a: "Em Pessoas > Buscar Colaborador. Dá para pesquisar pelo nome, setor ou número do ramal.", link: { href: "/diversos/colaboradores", label: "Ver ramais" } },
  { id: 6, cat: "Reservas e agenda", q: "Como reservo uma sala de reunião?", a: "Em Agenda > Reservas de Salas, escolha a sala, o dia e o horário livre. A reserva aparece na agenda da sala para todos.", link: { href: "/diversos/reservas", label: "Fazer reserva" } },
  { id: 7, cat: "Reservas e agenda", q: "Onde vejo os aniversariantes e os eventos do mês?", a: "Os aniversariantes ficam em Pessoas > Relação de Aniversários e os eventos da empresa em Agenda > Calendário.", link: { href: "/diversos/calendario", label: "Ver calendário" } },
  { id: 8, cat: "Recursos Humanos", q: "Como pego um livro da biblioteca?", a: "Escolha o livro em Recursos Humanos > Biblioteca. A retirada e a devolução são às sextas-feiras, das 16h às 17h, na Recepção RH.", link: { href: "/rh/biblioteca", label: "Ver acervo" } },
  { id: 9, cat: "Recursos Humanos", q: "Onde vejo os próximos treinamentos?", a: "Em Recursos Humanos > T&D ficam os próximos treinamentos, com data, horário, local e público-alvo.", link: { href: "/rh/td", label: "Ver treinamentos" } },
  { id: 10, cat: "Recursos Humanos", q: "Onde baixo formulários e termos do RH?", a: "Em Documentos > Documentos Institucionais, separados por categoria: avaliações, admissão, planos de saúde e outros.", link: { href: "/rh/documentos", label: "Ver documentos" } },
  { id: 11, cat: "Recursos Humanos", q: "Como uso o desconto nas universidades conveniadas?", a: "Veja a instituição em Programas Institucionais > Convênios. Cada uma informa o desconto e como comprovar o vínculo com a Facta.", link: { href: "/rh/convenios", label: "Ver convênios" } },
  { id: 12, cat: "Sugestões", q: "Tenho uma ideia para melhorar um sistema. Onde envio?", a: "No Banco de Ideias. A equipe de programação lê todas as sugestões, e você acompanha o status da sua ideia por lá.", link: { href: "/ajuda/ideias", label: "Ir para o Banco de Ideias" } },
];

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/* ---------- cadastro ---------- */

const control = "w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);

function FaqModal({ draft, onSave, onClose }: { draft: Faq; onSave: (f: Faq) => void; onClose: () => void }) {
  const [f, setF] = useState(draft);
  const [err, setErr] = useState<{ q?: string; a?: string }>({});
  const box = useRef<HTMLFormElement>(null);
  const qRef = useRef<HTMLInputElement>(null);
  const aRef = useRef<HTMLTextAreaElement>(null);
  useModalFocus(box, qRef, onClose);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { q: f.q.trim() ? undefined : "Escreva a pergunta.", a: f.a.trim() ? undefined : "Escreva a resposta." };
    setErr(next);
    if (next.q) return qRef.current?.focus();
    if (next.a) return aRef.current?.focus();
    onSave({ ...f, q: f.q.trim(), a: f.a.trim() });
  };
  const errCount = Object.values(err).filter(Boolean).length;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="faq-title" noValidate onSubmit={submit} className="max-h-[94vh] w-full max-w-[640px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="faq-title" className="text-[20px] font-bold">{draft.id ? "Editar pergunta" : "Nova pergunta"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft"><X className="size-5" /></button>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          {errCount > 0 && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">{errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}</p>
          )}
          <div>
            <span id="faq-cat" className={label}>Categoria</span>
            <Select aria-labelledby="faq-cat" value={f.cat} onChange={(v) => setF({ ...f, cat: v })} options={CATS} searchable={false} />
          </div>
          <div>
            <label htmlFor="faq-q" className={label}>Pergunta<Req /></label>
            <input id="faq-q" ref={qRef} value={f.q} maxLength={160} aria-invalid={!!err.q} onChange={(e) => (setF({ ...f, q: e.target.value }), setErr({ ...err, q: undefined }))} className={cn(control, "h-11", err.q ? "border-danger" : "border-line")} />
            <Err m={err.q} />
          </div>
          <div>
            <label htmlFor="faq-a" className={label}>Resposta<Req /></label>
            <textarea id="faq-a" ref={aRef} rows={5} value={f.a} maxLength={1500} aria-invalid={!!err.a} onChange={(e) => (setF({ ...f, a: e.target.value }), setErr({ ...err, a: undefined }))} className={cn(control, "resize-y py-2.5", err.a ? "border-danger" : "border-line")} />
            <Err m={err.a} />
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

export function FaqView() {
  const [list, setList] = useStored<Faq[]>("facta-faq", seeds);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [modal, setModal] = useState<Faq | null>(null);

  const words = norm(q).split(/\s+/).filter(Boolean);
  const shown = list.filter((f) => (!cat || f.cat === cat) && words.every((w) => norm(`${f.q} ${f.a}`).includes(w)));
  const groups = CATS.map((c) => ({ cat: c, items: shown.filter((f) => f.cat === c) })).filter((g) => g.items.length);
  const chip = (active: boolean) => cn("flex h-10 coarse:h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[14px] font-semibold transition-colors motion-reduce:transition-none", active ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink");

  const save = (f: Faq) => {
    setList((l) => (f.id ? l.map((x) => (x.id === f.id ? f : x)) : [...l, { ...f, id: Math.max(0, ...l.map((x) => x.id)) + 1 }]));
    setModal(null);
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Ajuda" }, { label: "FAQ" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <CircleHelp className="size-8 text-brand" strokeWidth={1.8} /> Perguntas frequentes
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">As dúvidas mais comuns sobre o portal e os processos da Facta.</p>
        </div>
        <button type="button" onClick={() => setModal({ id: 0, cat: CATS[0], q: "", a: "" })} className="flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-[14px] font-bold shadow-sm hover:border-brand hover:text-brand">
          <Plus className="size-4" /> Nova pergunta
        </button>
      </div>

      <label className="flex h-14 items-center gap-3 rounded-2xl border border-line bg-paper px-5 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
        <Search className="size-5 shrink-0 text-ink-soft" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite sua dúvida. Ex.: senha, reserva, livro" aria-label="Buscar nas perguntas frequentes" className="w-full bg-transparent text-[16px] outline-none placeholder:text-ink-soft" />
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filtrar por categoria">
        <button type="button" aria-pressed={!cat} onClick={() => setCat("")} className={chip(!cat)}>Todas</button>
        {CATS.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(cat === c ? "" : c)} className={chip(cat === c)}>
            {c}
            <span className="tabular text-[12px] opacity-70">{list.filter((f) => f.cat === c).length}</span>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">{shown.length} perguntas encontradas</p>

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-paper/70 p-10 text-center">
          <CircleHelp className="mx-auto size-8 text-ink-mute" />
          <p className="mt-2 text-[16px] font-bold">Nenhuma pergunta encontrada</p>
          <p className="text-[14px] text-ink-soft">Tente outras palavras ou fale com o setor responsável.</p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.cat} aria-labelledby={`faq-${g.cat}`}>
            <h2 id={`faq-${g.cat}`} className="mb-3 text-[14px] font-bold uppercase tracking-wide text-ink-soft">{g.cat}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
              {g.items.map((f) => (
                <details key={f.id} className="group" open={words.length > 0 || undefined}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[16px] font-bold hover:bg-brand-soft/40 md:px-6 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <ChevronDown aria-hidden className="size-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                  </summary>
                  <div className="px-5 pb-5 md:px-6">
                    <p className="max-w-[720px] text-[16px] leading-relaxed text-ink-soft">{f.a}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {f.link && (
                        <Link href={f.link.href} className="flex h-10 coarse:h-11 items-center gap-1.5 rounded-xl bg-brand-soft px-4 text-[14px] font-bold text-brand hover:bg-brand hover:text-white">
                          {f.link.label} <ArrowRight className="size-4" />
                        </Link>
                      )}
                      <button type="button" onClick={() => setModal(f)} aria-label={`Editar pergunta: ${f.q}`} className="ml-auto flex size-10 coarse:size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-brand-soft hover:text-brand">
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/solicitacoes/nova" className="flex items-center gap-4 rounded-3xl border border-paper bg-paper/90 p-5 shadow-card hover:border-brand/40">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><MessageSquarePlus className="size-6" /></span>
          <span>
            <span className="block text-[16px] font-bold">Não encontrou sua dúvida?</span>
            <span className="text-[14px] text-ink-soft">Abra uma solicitação para o setor responsável.</span>
          </span>
        </Link>
        <Link href="/ajuda/ideias" className="flex items-center gap-4 rounded-3xl border border-paper bg-paper/90 p-5 shadow-card hover:border-brand/40">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-warn-soft text-warn-ink"><Lightbulb className="size-6" /></span>
          <span>
            <span className="block text-[16px] font-bold">Tem uma ideia para os sistemas?</span>
            <span className="text-[14px] text-ink-soft">Mande para o Banco de Ideias.</span>
          </span>
        </Link>
      </div>

      {modal && <FaqModal key={modal.id} draft={modal} onSave={save} onClose={() => setModal(null)} />}
    </div>
  );
}
