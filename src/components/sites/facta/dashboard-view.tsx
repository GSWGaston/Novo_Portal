"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowLeftRight,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderOpen,
  Headset,
  Home,
  Layers,
  ListChecks,
  Monitor,
  Plus,
  Flag,
  ThumbsUp,
  User,
  Users,
  Zap,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { dashboardByScope, idleTickets, urgentTicket, type Scope } from "./data";

const card = "rounded-3xl border border-white bg-white/90 shadow-card";

export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Você está em" className="flex items-center gap-2 text-[14px] text-ink-soft">
      <Home className="size-4" />
      {trail.map((t, i) => (
        <span key={t.label} className="flex items-center gap-2">
          {i > 0 && <ChevronRight className="size-3.5" />}
          {t.href ? (
            <Link href={t.href} className="hover:text-brand">
              {t.label}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function Select({ label, icon, value, options, onChange, disabled }: { label: string; icon: React.ReactNode; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block min-w-[200px] text-[12px] font-semibold">
      {label}
      <span className="mt-1 flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 text-[14px] font-bold shadow-sm">
        {icon}
        <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="h-full w-full appearance-none bg-transparent outline-none disabled:cursor-default">
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {!disabled && <ChevronDown className="size-4 shrink-0" />}
      </span>
    </label>
  );
}

export function DashboardView() {
  const [scope, setScope] = useState<Scope>("individual");
  const d = dashboardByScope[scope];
  const max = Math.max(...d.reasons.map((r) => r.value));

  const kpis = [
    { label: "Em aberto", value: d.open, icon: FolderOpen, tone: "text-brand bg-brand-soft", delta: d.deltas[0], goodWhenUp: false },
    { label: "Pendente", value: d.pending, icon: Flag, tone: "text-brand bg-brand-soft", delta: d.deltas[1], goodWhenUp: false },
    { label: "Em desenvolvimento", value: d.dev, icon: ArrowLeftRight, tone: "text-brand bg-brand-soft", delta: d.deltas[2], goodWhenUp: false },
    { label: "Concluído", value: d.done, icon: ThumbsUp, tone: "text-ok bg-ok-soft", delta: d.deltas[3], goodWhenUp: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações" }]} />
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <Headset className="mt-1 size-9 text-brand" strokeWidth={1.8} />
            <div>
              <h1 className="text-[32px] font-extrabold leading-none tracking-tight">Dashboard</h1>
              <p className="mt-2 text-[16px] text-ink-soft">Acompanhe os chamados do seu setor e gerencie as solicitações.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Select
              label="Área"
              icon={<Layers className="size-4" />}
              value="ti"
              onChange={() => {}}
              disabled
              options={[{ value: "ti", label: "Suporte Informática" }]}
            />
            <Select
              label="Setor"
              icon={scope === "individual" ? <User className="size-4" /> : <Users className="size-4" />}
              value={scope}
              onChange={(v) => setScope(v as Scope)}
              options={[
                { value: "individual", label: "Individual" },
                { value: "setor", label: "Setor" },
              ]}
            />
          </div>
        </div>
      </div>

      <section aria-label="Resumo" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const up = k.delta >= 0;
          const good = up === k.goodWhenUp;
          return (
            <article key={k.label} className={cn(card, "flex items-center gap-4 p-5")}>
              <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", k.tone)}>
                <k.icon className="size-7" strokeWidth={1.7} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold">{k.label}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-[40px] font-extrabold leading-none tracking-tight">{k.value}</p>
                  <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[14px] font-bold", good ? "bg-ok-soft text-ok-ink" : "bg-danger-soft text-danger-ink")}>
                    {up ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
                    {up ? "+" : "−"}
                    {Math.abs(k.delta)}%
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-ink-soft">vs. último mês</p>
              </div>
            </article>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={cn(card, "overflow-hidden")}>
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="flex items-center gap-2.5 text-[20px] font-bold">
              <AlertTriangle className="size-6 text-danger" /> Chamados urgentes
              <span className="rounded-full bg-danger px-2 text-[14px] leading-6 text-white">1</span>
            </h2>
            <Link href="/solicitacoes/setores" className="flex items-center gap-1 text-[14px] font-bold text-brand">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </header>
          <div className="p-5">
            <div className="rounded-2xl border border-danger/25 bg-danger-soft/60 p-5">
              <p className="flex items-center gap-3 text-[20px] font-bold">
                #{urgentTicket.code}
                <span className="rounded-md bg-danger px-2 py-0.5 text-[14px] text-white">{urgentTicket.priority}</span>
              </p>
              <p className="mt-2 text-[16px] leading-relaxed">{urgentTicket.text}</p>
              <p className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-1 text-[14px] text-ink-soft">
                <span className="flex items-center gap-2"><Monitor className="size-4" /> {urgentTicket.sector}</span>
                <span className="flex items-center gap-2"><Calendar className="size-4" /> Aberto em {urgentTicket.opened}</span>
              </p>
            </div>
          </div>
        </section>

        <section className={cn(card, "overflow-hidden")}>
          <header className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="flex items-center gap-2.5 text-[20px] font-bold">
              <Clock className="size-6 text-danger" /> Chamados sem interação
              <span className="rounded-full bg-danger px-2 text-[14px] leading-6 text-white">{idleTickets.length}</span>
            </h2>
            <Link href="/solicitacoes/setores" className="flex items-center gap-1 text-[14px] font-bold text-brand">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          </header>
          <ul className="divide-y divide-line px-5 py-2">
            {idleTickets.map((t) => (
              <li key={t.code} className="flex items-center gap-4 py-3.5">
                <span className="w-[96px] text-[18px] font-bold">#{t.code}</span>
                <span className="flex-1 text-[16px]">{t.text}</span>
                <span className="rounded-lg bg-danger-soft px-3 py-1 text-[16px] font-bold text-danger-ink">{t.days} dias</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section className={card}>
          <h2 className="flex items-center gap-2.5 border-b border-line px-6 py-4 text-[20px] font-bold">
            <BarChart3 className="size-6 text-brand" /> Top 5 motivos em aberto
          </h2>
          <ul className="space-y-1 p-5">
            {d.reasons.map((r) => (
              <li key={r.label} className="grid grid-cols-[minmax(120px,200px)_1fr_40px] items-center gap-4 rounded-lg px-1 py-2 text-[16px]">
                <span>{r.label}</span>
                <span className="h-3 rounded-full bg-[#e7edf6]">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(r.value / max) * 100}%` }} />
                </span>
                <span className="text-right font-bold">{r.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h2 className="flex items-center gap-2.5 border-b border-line px-6 py-4 text-[20px] font-bold">
            <Zap className="size-6 text-brand" /> Acesso rápido
          </h2>
          <ul className="divide-y divide-line px-3 py-2">
            {[
              { label: "Pendentes no setor", icon: ListChecks, href: "/solicitacoes/setores" },
              { label: "Nova solicitação", icon: Plus },
              { label: "Minhas solicitações", icon: User },
            ].map((q) => (
              <li key={q.label}>
                {q.href ? (
                  <Link href={q.href} className="flex min-h-14 items-center gap-4 rounded-xl px-3 text-[16px] font-bold transition-colors hover:bg-brand-soft motion-reduce:transition-none">
                    <q.icon className="size-6 text-brand" strokeWidth={1.7} />
                    {q.label}
                    <ChevronRight className="ml-auto size-5 text-ink-soft" />
                  </Link>
                ) : (
                  <div aria-disabled="true" className="flex min-h-14 items-center gap-4 px-3 text-[16px] font-bold text-ink-soft">
                    <q.icon className="size-6" strokeWidth={1.7} />
                    {q.label}
                    <span className="ml-auto text-[12px] font-semibold">Em breve</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
