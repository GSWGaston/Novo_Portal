"use client";

import { ListChecks } from "lucide-react";
import Link from "next/link";
import { DataList, parseBR, type Col, type FilterDef } from "./data-list";
import { myRequests, type Ticket } from "./data";
import { PriorityPill, StatusPill } from "./tickets-view";

const rank = { Baixa: 0, Média: 1, Alta: 2, Urgente: 3 } as const;
const uniq = (f: (t: Ticket) => string) => [...new Set(myRequests.map(f))].sort();

const columns: Col<Ticket>[] = [
  { key: "priority", label: "Prioridade", sort: (t) => rank[t.priority], render: (t) => <PriorityPill p={t.priority} /> },
  { key: "code", label: "Código", sort: (t) => t.code, render: (t) => <Link href={`/solicitacoes/${t.code}`} className="font-semibold text-brand hover:underline">{t.code}</Link> },
  { key: "reason", label: "Motivo", sort: (t) => t.title, render: (t) => <><span className="block font-bold">{t.title}</span><span className="block text-[12px] text-ink-soft">{t.subtitle}</span></> },
  { key: "area", label: "Área", sort: (t) => t.origin, render: (t) => t.origin },
  { key: "owner", label: "Responsável", sort: (t) => t.owner, render: (t) => t.owner || "—" },
  { key: "opened", label: "Solicitado", sort: (t) => parseBR(t.opened), render: (t) => t.opened },
  { key: "updated", label: "Atualizado", sort: (t) => parseBR(t.updated), render: (t) => t.updated },
  { key: "status", label: "Status", sort: (t) => t.status, render: (t) => <StatusPill s={t.status} /> },
];

const filters: FilterDef<Ticket>[] = [
  { key: "status", label: "Status", kind: "select", options: uniq((t) => t.status), test: (t, v) => t.status === v },
  { key: "priority", label: "Prioridade", kind: "select", options: ["Baixa", "Média", "Alta", "Urgente"], test: (t, v) => t.priority === v },
  { key: "area", label: "Área", kind: "select", options: uniq((t) => t.origin), test: (t, v) => t.origin === v },
  { key: "owner", label: "Responsável", kind: "select", options: uniq((t) => t.owner), test: (t, v) => t.owner === v },
  { key: "from", label: "Alterado de", kind: "from", test: (t, v) => parseBR(t.updated) >= new Date(`${v}T00:00`).getTime() },
  { key: "to", label: "Alterado até", kind: "to", test: (t, v) => parseBR(t.updated) <= new Date(`${v}T23:59`).getTime() },
  { key: "code", label: "Código", kind: "text", more: true, test: (t, v) => String(t.code).includes(v.trim()) },
  { key: "text", label: "Descrição", kind: "text", more: true, test: (t, v) => `${t.title} ${t.subtitle} ${t.firstMessage}`.toLowerCase().includes(v.toLowerCase()) },
  { key: "reason", label: "Motivo", kind: "select", options: uniq((t) => t.title), more: true, test: (t, v) => t.title === v },
];

export function MinhasView() {
  return (
    <DataList
      title="Minhas solicitações"
      icon={ListChecks}
      trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Minhas solicitações" }]}
      rows={myRequests}
      rowKey={(t) => t.code}
      rowHref={(t) => `/solicitacoes/${t.code}`}
      rowClass={(t) => t.priority === "Urgente" && "bg-danger-soft hover:bg-danger-soft"}
      columns={columns}
      search={(t) => `${t.code} ${t.title} ${t.subtitle} ${t.origin} ${t.owner}`}
      placeholder="Buscar código, motivo, área ou responsável"
      filters={filters}
      toggle={{ label: "Mostrar concluídas", hidden: (t) => t.status === "Concluído – confirmação" }}
      defaultSort={{ key: "updated", dir: -1 }}
      noun={["chamado", "chamados"]}
    />
  );
}
