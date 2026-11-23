"use client";

import {
  Calendar,
  Check,
  ChevronDown,
  Cog,
  Headset,
  Mail,
  MessageSquare,
  Monitor,
  Paperclip,
  Phone,
  Reply,
  Save,
  Search,
  Send,
  Tag,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser, historyFor, initials, type HistoryEntry, type Priority, type Status, type Ticket } from "./data";
import { PriorityPill, StatusPill } from "./tickets-view";

const card = "rounded-3xl border border-white bg-white/90 shadow-card";
const field = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] font-semibold outline-none focus:border-brand";

type Filter = "all" | "message" | "note" | "system";

function Side({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className={cn(card, "overflow-hidden")}>
      <h2 className="flex items-center gap-2.5 bg-navy px-5 py-3.5 text-[16px] font-extrabold text-white">
        <Icon className="size-5" /> {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-[14px] last:border-0">
      <span className="text-ink-soft">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}

function Entry({ e }: { e: HistoryEntry }) {
  if (e.kind === "system") {
    return (
      <li className="flex gap-4">
        <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft ring-1 ring-line">
          <Cog className="size-5" />
        </span>
        <div className="flex-1 rounded-2xl border border-line bg-surface/70 px-5 py-4">
          <p className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
            <span className="font-extrabold">Atividade do sistema</span>
            <span className="text-[13px] text-ink-soft">{e.when}</span>
          </p>
          <p className="mt-1 text-[14px] text-ink-soft">{e.text}</p>
        </div>
      </li>
    );
  }
  const note = e.kind === "note";
  const mine = e.role === "Suporte";
  return (
    <li className="flex gap-4">
      <span className={cn("mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold", note ? "bg-warn-soft text-warn" : mine ? "bg-navy text-white" : "bg-brand-soft text-brand")}>
        {initials(e.author)}
      </span>
      <div className={cn("flex-1 rounded-2xl border px-5 py-4", note ? "border-warn/30 bg-warn-soft/60" : "border-line bg-white")}>
        <p className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
          <span className="flex items-center gap-2">
            <span className="font-extrabold">{e.author}</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-bold", note ? "bg-warn text-white" : mine ? "bg-brand-soft text-brand" : "bg-ok-soft text-ok")}>
              {note ? "Nota interna" : e.role}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-ink-soft">
            <Calendar className="size-3.5" /> {e.when}
          </span>
        </p>
        <p className="mt-2 text-[15px] leading-relaxed">{e.text}</p>
      </div>
    </li>
  );
}

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => historyFor(ticket));
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [owner, setOwner] = useState(ticket.owner || currentUser.name);
  const [draft, setDraft] = useState({ status: ticket.status, priority: ticket.priority, owner: ticket.owner || currentUser.name });
  const [reply, setReply] = useState("");
  const [replyAs, setReplyAs] = useState<"message" | "note">("message");
  const [toast, setToast] = useState("");

  const now = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} às ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };
  const add = (e: Omit<HistoryEntry, "id" | "when">) => setEntries((l) => [...l, { ...e, id: String(l.length + 1), when: now() }]);

  const counts = useMemo(() => ({ all: entries.length, message: entries.filter((e) => e.kind === "message").length, note: entries.filter((e) => e.kind === "note").length, system: entries.filter((e) => e.kind === "system").length }), [entries]);
  const shown = entries.filter((e) => (filter === "all" || e.kind === filter) && `${e.author} ${e.text}`.toLowerCase().includes(search.trim().toLowerCase()));

  const send = () => {
    if (!reply.trim()) return;
    add({ kind: replyAs, author: currentUser.name, role: "Suporte", text: reply.trim() });
    setReply("");
    notify(replyAs === "note" ? "Nota interna registrada." : "Resposta enviada ao solicitante.");
  };

  const save = () => {
    if (draft.status !== status) add({ kind: "system", author: "Sistema", role: "Sistema", text: `Status do chamado alterado para: ${draft.status}.` });
    setStatus(draft.status);
    setPriority(draft.priority);
    setOwner(draft.owner);
    notify("Alterações salvas.");
  };

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "message", label: "Mensagens" },
    { id: "note", label: "Notas internas" },
    { id: "system", label: "Atividades do sistema" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Setores", href: "/solicitacoes/setores" }, { label: `Chamado #${ticket.code}` }]} />

      <header className={cn(card, "p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Headset className="size-7" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[30px] font-extrabold leading-none tracking-tight">Chamado #{ticket.code}</h1>
              <p className="mt-2 text-[15px] text-ink-soft">
                {ticket.title} — {ticket.subtitle}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill s={status} />
            <PriorityPill p={priority} />
          </div>
        </div>
        <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-5 text-[14px] sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Monitor, k: "Área", v: "Suporte Informática" },
            { icon: Tag, k: "Categoria", v: ticket.title },
            { icon: User, k: "Responsável", v: owner },
            { icon: Calendar, k: "Aberto em", v: ticket.opened.replace(" ", " às ") },
          ].map((m) => (
            <div key={m.k} className="flex items-center gap-3">
              <m.icon className="size-5 shrink-0 text-ink-soft" />
              <div>
                <dt className="text-[12px] font-semibold text-ink-soft">{m.k}</dt>
                <dd className="font-bold">{m.v}</dd>
              </div>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className={cn(card, "p-6")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2.5 text-[22px] font-extrabold">
                <MessageSquare className="size-6 text-brand" /> Histórico do chamado
              </h2>
              <span className="rounded-full bg-surface px-3 py-1 text-[13px] font-bold text-ink-soft">{entries.length} registros</span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {filters.map((f) => (
                <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn("rounded-full border px-4 py-2 text-[13px] font-bold transition", filter === f.id ? "border-navy bg-navy text-white" : "border-line bg-white text-ink hover:bg-brand-soft")}>
                  {f.label} ({counts[f.id]})
                </button>
              ))}
              <label className="relative ml-auto block w-full sm:w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no histórico..." className="h-10 w-full rounded-xl border border-line bg-white pl-9 pr-3 text-[14px] outline-none focus:border-brand" />
              </label>
            </div>

            <ol className="relative mt-6 space-y-5">
              {shown.map((e) => (
                <Entry key={e.id} e={e} />
              ))}
              {shown.length === 0 && <li className="rounded-2xl border border-dashed border-line py-10 text-center text-[14px] text-ink-soft">Nenhum registro encontrado.</li>}
            </ol>
          </section>

          <section className={cn(card, "p-6")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2.5 text-[20px] font-extrabold">
                <Reply className="size-6 text-brand" /> Responder chamado
              </h2>
              <label className="relative block">
                <select value={replyAs} onChange={(e) => setReplyAs(e.target.value as "message" | "note")} className={cn(field, "appearance-none pr-9")}>
                  <option value="message">Resposta ao solicitante</option>
                  <option value="note">Nota interna</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
              </label>
            </div>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={5} placeholder="Digite sua resposta aqui..." className="mt-4 w-full resize-y rounded-2xl border border-line bg-white p-4 text-[15px] outline-none focus:border-brand" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-line px-4 text-[14px] font-bold text-ink-soft hover:bg-brand-soft">
                <Paperclip className="size-4" /> Anexar arquivos
              </button>
              <button type="button" onClick={send} disabled={!reply.trim()} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-bold text-white transition hover:bg-brand-dark disabled:opacity-50">
                <Send className="size-4" /> {replyAs === "note" ? "Salvar nota" : "Enviar resposta"}
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Side icon={User} title="Solicitante">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[17px] font-extrabold text-brand">{initials(ticket.requester)}</span>
              <div>
                <p className="text-[16px] font-extrabold">{ticket.requester}</p>
                <p className="text-[13px] text-ink-soft">{ticket.origin}</p>
                <p className="text-[13px] text-ink-soft">{ticket.uf}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[14px]">
              <p className="flex items-center gap-3"><Mail className="size-4 text-ink-soft" /> solicitante@exemplo.com.br</p>
              <p className="flex items-center gap-3"><Phone className="size-4 text-ink-soft" /> (00) 0000-0000</p>
            </div>
          </Side>

          <Side icon={Monitor} title="Informações técnicas">
            <Row k="Código" v={String(ticket.code)} />
            <Row k="Ramal" v="0000" />
            <Row k="IP" v="10.0.0.00" />
            <Row k="Computador" v={`PFC-${String(ticket.code).slice(-4)}`} />
            <Row k="Sistema operacional" v="Windows 10 Pro" />
          </Side>

          <Side icon={Cog} title="Gerenciar chamado">
            <div className="space-y-4 text-[13px] font-bold">
              <label className="block">
                Status
                <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Status })} className={cn(field, "mt-1")}>
                  <option>Em desenvolvimento</option>
                  <option>Pendente validação</option>
                </select>
              </label>
              <label className="block">
                Responsável
                <select value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })} className={cn(field, "mt-1")}>
                  <option>{currentUser.name}</option>
                  <option>Atendente Exemplo</option>
                </select>
              </label>
              <label className="block">
                Prioridade
                <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })} className={cn(field, "mt-1")}>
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
              </label>
              <button type="button" onClick={save} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[15px] font-bold text-white transition hover:bg-brand-dark">
                <Save className="size-4" /> Salvar alterações
              </button>
            </div>
          </Side>
        </aside>
      </div>

      <div role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-card transition", toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
        <Check className="size-4" /> {toast}
      </div>
    </div>
  );
}
