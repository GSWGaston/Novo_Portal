"use client";

import { ORIGIN_KEY, readSession } from "./use-stored";
import {
  Calendar,
  Check,
  Cog,
  Headset,
  Mail,
  MessageSquare,
  Monitor,
  Paperclip,
  Phone,
  Reply,
  Search,
  Network,
  Copy,
  X,
  Tag,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Select } from "./select";
import { Breadcrumb } from "./dashboard-view";
import { currentUser, historyFor, initials, loginOf, type HistoryEntry, type Priority, type Status, type Ticket } from "./data";
import { PriorityPill, StatusPill } from "./tickets-view";
import { TicketRelated } from "./ticket-related";

const STATUSES: Status[] = ["Em desenvolvimento", "Pendente validação", "Aguardando solicitante", "Concluído – confirmação"];
const PRIORITIES: Priority[] = ["Baixa", "Média", "Alta", "Urgente"];
const CLASSES = ["Erro", "Dúvida", "Solicitação", "Melhoria"];
const CONTACTS = ["Portal", "Telefone", "E-mail", "Presencial"];

const card = "rounded-3xl border border-paper bg-paper/90 shadow-card";

function Side({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <section className={cn(card, "overflow-hidden")}>
      <h2 className="flex items-center gap-2.5 bg-navy px-5 py-3.5 text-[16px] font-bold text-white">
        <Icon className="size-5" /> {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Row({ k, v, onCopy }: { k: string; v: string; onCopy?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-[14px] last:border-0">
      <span className="text-ink-soft">{k}</span>
      <span className="flex items-center gap-1 font-bold tabular">
        {v}
        {onCopy && (
          <button type="button" onClick={onCopy} aria-label={`Copiar ${k}`} title={`Copiar ${k}`} className="-my-2 -mr-2 flex size-9 coarse:size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-brand-soft hover:text-brand">
            <Copy className="size-4" />
          </button>
        )}
      </span>
    </div>
  );
}

// dados fictícios do solicitante, estáveis por chamado
const CARGOS = ["Supervisor(a) de vendas", "Consultor(a) comercial", "Analista administrativo", "Assistente financeiro", "Coordenador(a) de loja", "Analista de RH"];
const tvId = (n: number) => String(n * 7919).slice(-9).replace(/(\d{1})(\d{3})(\d{3})(\d{2})/, "$1 $2 $3 $4");

export function TicketDetail({ ticket }: { ticket: Ticket }) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => historyFor(ticket));
  const [fresh, setFresh] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState({ label: "Setores", href: "/solicitacoes/setores" });
  useEffect(() => {
    const o = readSession<{ label: string; href: string }>(ORIGIN_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (o) setOrigin(o);
  }, []);
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [owner, setOwner] = useState(ticket.owner || currentUser.name);
  const [draft, setDraft] = useState({
    status: ticket.status,
    priority: ticket.priority,
    owner: ticket.owner || currentUser.name,
    area: "Suporte Informática",
    kind: "Erro",
    reason: ticket.title,
    sub: "",
    contact: "Portal",
  });
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [replyErr, setReplyErr] = useState(false);
  const replyRef = useRef<HTMLTextAreaElement>(null);
  const [toast, setToast] = useState("");

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 3000);
  };
  const add = (e: Omit<HistoryEntry, "id" | "date" | "time" | "status">) => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    setFresh(String(entries.length + 1));
    setEntries((l) => [...l, { ...e, id: String(l.length + 1), date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`, time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`, status: status.toUpperCase() }]);
  };

  const shown = entries.filter((e) => `${e.user} ${e.text}`.toLowerCase().includes(search.trim().toLowerCase()));

  const gravar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) {
      setReplyErr(true);
      replyRef.current?.focus();
      return;
    }
    setReplyErr(false);
    const me = loginOf(currentUser.name);
    if (draft.status !== status) add({ user: me, text: `ALTERAÇÃO DE STATUS\nStatus do chamado alterado para: ${draft.status}.`, auto: true });
    add({ user: me, text: (internal ? "ACOMPANHAMENTO INTERNO\n" : "") + reply.trim() + (files.length ? `\nAnexos: ${files.join(", ")}` : "") });
    setStatus(draft.status);
    setPriority(draft.priority);
    setOwner(draft.owner);
    setReply("");
    setFiles([]);
    setInternal(false);
    notify(internal ? "Acompanhamento interno registrado." : "Chamado atualizado.");
  };

  return (
    <div className="space-y-6">
      <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: origin.label, href: origin.href }, { label: `Chamado #${ticket.code}` }]} />

      <header className={cn(card, "p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Headset className="size-7" strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[32px] font-extrabold leading-none tracking-tight">Chamado #{ticket.code}</h1>
              <p className="mt-2 text-[16px] text-ink-soft">
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
              <h2 className="flex items-center gap-2.5 text-[20px] font-bold">
                <MessageSquare className="size-6 text-brand" /> Histórico do chamado
              </h2>
              <span className="rounded-full bg-surface px-3 py-1 text-[14px] font-bold text-ink-soft">{entries.length} registros</span>
            </div>

            <div className="mt-5 flex">
              <label className="relative block w-full sm:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar no histórico..." className="h-10 w-full rounded-xl border border-line bg-paper pl-9 pr-3 text-[14px] outline-none focus:border-brand" />
              </label>
            </div>


            <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[720px] border-collapse text-[14px]">
                <thead className="bg-surface text-[12px] font-bold uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th className="px-5 py-4 text-left">Usuário</th>
                    <th className="px-4 py-4 text-left">Data</th>
                    <th className="px-4 py-4 text-left">Hora</th>
                    <th className="px-4 py-4 text-left">Descrição</th>
                    <th className="px-5 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((e) => (
                    <tr key={e.id} className={cn("border-t border-line even:bg-surface/60", e.id === fresh && "[animation:facta-flash_1.6s_ease-out]")}>
                      <td className="whitespace-nowrap px-5 py-4 align-middle">
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold", e.auto ? "bg-navy text-white" : "bg-warn-soft text-warn-ink ring-1 ring-warn/25")}>
                          {e.auto ? <Cog className="size-3.5" /> : <User className="size-3.5" />}
                          {e.auto ? "SISTEMA" : e.user}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 align-middle">{e.date}</td>
                      <td className="whitespace-nowrap px-4 py-4 align-middle">{e.time}</td>
                      <td className="px-4 py-4 align-middle">
                        {e.text.split("\n").map((line, i) => (
                          <p key={i} className={cn("min-h-[1.4em] leading-relaxed", i === 0 && e.text.includes("\n") && /^[A-ZÀ-Ú ]+$/.test(line) && "font-bold")}>
                            {line}
                          </p>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-center align-middle text-[12px] font-bold uppercase text-ink-soft">{e.status}</td>
                    </tr>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-ink-soft">{search.trim() ? `Nenhum registro encontrado para “${search.trim()}”.` : "Este chamado ainda não tem registros."}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <form onSubmit={gravar} noValidate className={cn(card, "p-6")}>
            <h2 className="flex items-center gap-2.5 text-[20px] font-bold">
              <Reply className="size-6 text-brand" /> Responder chamado
            </h2>

            <div className="mt-5">
              <span className="mb-1 block text-[14px] font-semibold">Anexos</span>
              <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 text-[14px] text-ink-soft transition-colors hover:border-brand hover:bg-brand-soft/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand motion-reduce:transition-none">
                <Paperclip className="size-4 shrink-0" /> Arraste ou clique para anexar arquivos
                <input
                  type="file"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    const names = Array.from(e.target.files ?? []).map((f) => f.name);
                    setFiles((l) => [...l, ...names]);
                    e.target.value = "";
                  }}
                />
              </label>
              {files.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <li key={f + i} className="flex items-center gap-1.5 rounded-lg bg-brand-soft py-1 pl-2.5 pr-1 text-[14px] text-brand">
                      <span className="max-w-[220px] truncate">{f}</span>
                      <button type="button" aria-label={`Remover ${f}`} onClick={() => setFiles((l) => l.filter((_, j) => j !== i))} className="flex size-6 coarse:size-8 items-center justify-center rounded-md hover:bg-brand/15">
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="t-reply" className="mb-1 block text-[14px] font-semibold">
                Comentário<span aria-hidden className="ml-0.5 text-danger-ink">*</span>
              </label>
              <textarea
                id="t-reply"
                ref={replyRef}
                value={reply}
                onChange={(e) => {
                  setReply(e.target.value);
                  if (e.target.value.trim()) setReplyErr(false);
                }}
                rows={5}
                aria-invalid={replyErr}
                aria-describedby={replyErr ? "t-reply-err" : undefined}
                placeholder="Informe o comentário aqui"
                className={cn("w-full resize-y rounded-2xl border bg-paper p-4 text-[16px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15", replyErr ? "border-danger" : "border-line")}
              />
              {replyErr && <p id="t-reply-err" className="mt-1 text-[14px] font-medium text-danger-ink">Informe o comentário.</p>}
            </div>

            <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { id: "prioridade", label: "Prioridade", value: draft.priority, key: "priority", options: PRIORITIES },
                { id: "status", label: "Status", value: draft.status, key: "status", options: STATUSES },
                { id: "area", label: "Área", value: draft.area, key: "area", options: ["Suporte Informática"] },
                { id: "responsavel", label: "Responsável", value: draft.owner, key: "owner", options: [...new Set([ticket.owner, currentUser.name, "Atendente Exemplo"].filter(Boolean))] },
                { id: "classificacao", label: "Classificação", value: draft.kind, key: "kind", options: CLASSES },
                { id: "motivo", label: "Motivo", value: draft.reason, key: "reason", options: [...new Set([ticket.title, "Computador – Manutenção", "Computador – Lentidão", "Impressora", "Acesso a sistemas"])] },
                { id: "submotivo", label: "Submotivo", value: draft.sub, key: "sub", options: [{ value: "", label: "- Selecione -" }, "Formatação", "Instalação de software", "Lentidão no sistema"] },
                { id: "contato", label: "Tipo de contato", value: draft.contact, key: "contact", options: CONTACTS },
              ].map((f) => (
                <div key={f.id}>
                  <span id={`t-${f.id}`} className="mb-1 block text-[14px] font-semibold">{f.label}</span>
                  <Select aria-labelledby={`t-${f.id}`} value={f.value} onChange={(v) => setDraft({ ...draft, [f.key]: v })} options={f.options} placeholder="- Selecione -" searchable={false} />
                </div>
              ))}
            </div>

            <label className="mt-5 flex min-h-11 w-fit cursor-pointer items-center gap-2.5 text-[14px] font-semibold">
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="size-5 accent-[var(--color-brand)]" />
              Acompanhamento interno <span className="font-normal text-ink-soft">(o solicitante não vê)</span>
            </label>

            <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-5">
              <button type="submit" className="h-11 rounded-xl bg-brand px-8 text-[16px] font-bold text-white transition hover:bg-brand-dark">
                Gravar
              </button>
              <Link href={origin.href} className="flex h-11 items-center rounded-xl border border-line bg-paper px-8 text-[16px] font-bold hover:bg-surface">
                Voltar
              </Link>
            </div>
          </form>
        </div>

        <aside className="space-y-6">
          <Side icon={User} title="Solicitante">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[18px] font-bold text-brand">{initials(ticket.requester)}</span>
              <div>
                <p className="text-[16px] font-bold">{ticket.requester}</p>
                <p className="text-[14px] font-semibold text-brand">{CARGOS[ticket.code % CARGOS.length]}</p>
                <p className="text-[14px] text-ink-soft">{ticket.origin}</p>
                <p className="text-[14px] text-ink-soft">{ticket.uf}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[14px]">
              <p className="flex items-center gap-3"><Mail className="size-4 text-ink-soft" /> solicitante@exemplo.com.br</p>
              <p className="flex items-center gap-3"><Phone className="size-4 text-ink-soft" /> Ramal 0000</p>
            </div>
          </Side>

          <Side icon={Monitor} title="Informações técnicas">
            <Row k={ticket.code % 4 === 0 ? "Usuário / aberto por" : "Usuário e abertura"} v={ticket.code % 4 === 0 ? `${loginOf(ticket.requester)} / ${loginOf(ticket.owner || currentUser.name)}` : loginOf(ticket.requester)} />
            <Row k="Código" v={String(22000 + (ticket.code % 1000) * 7)} />
            <Row k="IP" v="10.0.0.00" />
            <Row k="TeamViewer" v={tvId(ticket.code)} onCopy={() => (navigator.clipboard?.writeText(tvId(ticket.code).replace(/\s/g, "")), notify("ID do TeamViewer copiado."))} />
            <Row k="Computador" v={`PFC-${String(ticket.code).slice(-4)}`} />
            <Row k="Sistema operacional" v="Windows 10 Pro" />
          </Side>

          <Side icon={Network} title="Chamados relacionados">
            <TicketRelated code={ticket.code} onLog={(text) => add({ user: loginOf(currentUser.name), text, auto: true })} />
          </Side>
        </aside>
      </div>

      <div role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-card transition motion-reduce:transition-none", toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
        <Check className="size-4" /> {toast}
      </div>
    </div>
  );
}
