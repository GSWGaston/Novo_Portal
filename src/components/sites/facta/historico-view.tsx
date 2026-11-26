"use client";

import { History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DataList, parseBR, type Col, type FilterDef } from "./data-list";
import { closedByMe, currentUser, historyFor, loginOf, tickets, type Ticket } from "./data";
import { PriorityPill, StatusPill } from "./tickets-view";

const attended: Ticket[] = [...tickets.filter((t) => t.owner === currentUser.name), ...closedByMe];

type Interaction = { id: string; date: string; time: string; ticket: Ticket; text: string };
const interactions: Interaction[] = attended
  .flatMap((t) => historyFor(t).filter((e) => e.user === loginOf(currentUser.name)).map((e) => ({ id: `${t.code}-${e.id}`, date: e.date, time: e.time, ticket: t, text: e.text })))
  .sort((a, b) => parseBR(`${b.date} ${b.time}`) - parseBR(`${a.date} ${a.time}`));

const rank = { Baixa: 0, Média: 1, Alta: 2, Urgente: 3 } as const;
const uniq = (vals: string[]) => [...new Set(vals)].sort();
const link = (t: Ticket) => <Link href={`/solicitacoes/${t.code}`} className="font-semibold text-brand hover:underline">{t.code}</Link>;
const reason = (t: Ticket) => (
  <>
    <span className="block font-bold">{t.title}</span>
    <span className="block text-[12px] text-ink-soft">{t.subtitle}</span>
  </>
);
const whoWhere = (t: Ticket) => (
  <>
    <span className="block">{t.requester}</span>
    <span className="block text-[12px] text-ink-soft">{t.origin}</span>
  </>
);

const attendedCols: Col<Ticket>[] = [
  { key: "priority", label: "Prioridade", sort: (t) => rank[t.priority], render: (t) => <PriorityPill p={t.priority} /> },
  { key: "code", label: "Código", sort: (t) => t.code, render: link },
  { key: "reason", label: "Motivo", sort: (t) => t.title, render: reason },
  { key: "requester", label: "Solicitante / Origem", sort: (t) => t.requester, render: whoWhere },
  { key: "opened", label: "Solicitado", sort: (t) => parseBR(t.opened), render: (t) => t.opened },
  {
    key: "updated",
    label: "Alterado",
    sort: (t) => parseBR(t.updated),
    render: (t) => (
      <>
        <span className="block">{t.updated}</span>
        <span className="block text-[12px] text-ink-soft">{t.days} dias</span>
      </>
    ),
  },
  { key: "status", label: "Status", sort: (t) => t.status, render: (t) => <StatusPill s={t.status} /> },
];

const attendedFilters: FilterDef<Ticket>[] = [
  { key: "status", label: "Status", kind: "select", options: uniq(attended.map((t) => t.status)), test: (t, v) => t.status === v },
  { key: "priority", label: "Prioridade", kind: "select", options: ["Baixa", "Média", "Alta", "Urgente"], test: (t, v) => t.priority === v },
  { key: "from", label: "Alterado de", kind: "from", test: (t, v) => parseBR(t.updated) >= new Date(`${v}T00:00`).getTime() },
  { key: "to", label: "Alterado até", kind: "to", test: (t, v) => parseBR(t.updated) <= new Date(`${v}T23:59`).getTime() },
  { key: "code", label: "Código", kind: "text", more: true, test: (t, v) => String(t.code).includes(v.trim()) },
  { key: "reason", label: "Motivo", kind: "select", options: uniq(attended.map((t) => t.title)), more: true, test: (t, v) => t.title === v },
  { key: "origin", label: "Origem", kind: "select", options: uniq(attended.map((t) => t.origin)), more: true, test: (t, v) => t.origin === v },
  { key: "requester", label: "Solicitante", kind: "select", options: uniq(attended.map((t) => t.requester)), more: true, test: (t, v) => t.requester === v },
];

function Description({ text }: { text: string }) {
  const lines = text.split("\n");
  const titled = lines.length > 1 && /^[A-ZÀ-Ú ]+$/.test(lines[0]);
  return (
    <>
      {lines.map((l, i) => (
        <p key={i} className={cn("min-h-[1.4em] leading-relaxed", titled && i === 0 && "font-bold")}>
          {l}
        </p>
      ))}
    </>
  );
}

const interactionCols: Col<Interaction>[] = [
  {
    key: "when",
    label: "Data e hora",
    sort: (i) => parseBR(`${i.date} ${i.time}`),
    render: (i) => (
      <>
        <span className="block">{i.date}</span>
        <span className="block text-[12px] text-ink-soft">{i.time}</span>
      </>
    ),
  },
  { key: "code", label: "Código", sort: (i) => i.ticket.code, render: (i) => link(i.ticket) },
  { key: "requester", label: "Solicitante / Origem", sort: (i) => i.ticket.requester, render: (i) => whoWhere(i.ticket) },
  { key: "reason", label: "Motivo", sort: (i) => i.ticket.title, render: (i) => i.ticket.title },
  { key: "status", label: "Status", sort: (i) => i.ticket.status, render: (i) => <StatusPill s={i.ticket.status} /> },
  { key: "text", label: "Descrição", className: "!whitespace-normal min-w-[280px] max-w-[420px]", render: (i) => <Description text={i.text} /> },
];

const interactionFilters: FilterDef<Interaction>[] = [
  { key: "from", label: "Data início", kind: "from", test: (i, v) => parseBR(i.date) >= new Date(`${v}T00:00`).getTime() },
  { key: "to", label: "Data fim", kind: "to", test: (i, v) => parseBR(i.date) <= new Date(`${v}T23:59`).getTime() },
  { key: "reason", label: "Motivo", kind: "select", options: uniq(interactions.map((i) => i.ticket.title)), test: (i, v) => i.ticket.title === v },
  { key: "status", label: "Status", kind: "select", options: uniq(interactions.map((i) => i.ticket.status)), test: (i, v) => i.ticket.status === v },
];

const tabs = [
  { id: "chamados", label: "Chamados atendidos", hint: "Chamados em que você foi o responsável." },
  { id: "interacoes", label: "Minhas interações", hint: "Cada resposta ou acompanhamento que você registrou." },
] as const;

const trail = [{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Histórico" }];

export function HistoricoView() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("chamados");
  const current = tabs.find((t) => t.id === tab)!;

  const header = (
    <div className="mt-5">
      <div role="tablist" aria-label="Tipo de histórico" className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="historico-painel"
            onClick={() => setTab(t.id)}
            className={cn("h-11 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[16px] text-ink-soft">{current.hint}</p>
    </div>
  );

  return (
    <div id="historico-painel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
      {tab === "chamados" ? (
        <DataList
          key="chamados"
          title="Histórico"
          icon={History}
          trail={trail}
          rows={attended}
          rowKey={(t) => t.code}
          rowHref={(t) => `/solicitacoes/${t.code}`}
          rowClass={(t) => t.priority === "Urgente" && "bg-danger-soft hover:bg-danger-soft"}
          columns={attendedCols}
          search={(t) => `${t.code} ${t.title} ${t.subtitle} ${t.requester} ${t.origin}`}
          placeholder="Buscar código, motivo, solicitante ou origem"
          filters={attendedFilters}
          defaultSort={{ key: "updated", dir: -1 }}
          noun={["chamado", "chamados"]}
          header={header}
        />
      ) : (
        <DataList
          key="interacoes"
          title="Histórico"
          icon={History}
          trail={trail}
          rows={interactions}
          rowKey={(i) => i.id}
          rowHref={(i) => `/solicitacoes/${i.ticket.code}`}
          columns={interactionCols}
          search={(i) => `${i.ticket.code} ${i.ticket.title} ${i.ticket.requester} ${i.text}`}
          placeholder="Buscar código, solicitante ou descrição"
          filters={interactionFilters}
          defaultSort={{ key: "when", dir: -1 }}
          noun={["registro", "registros"]}
          header={header}
        />
      )}
    </div>
  );
}
