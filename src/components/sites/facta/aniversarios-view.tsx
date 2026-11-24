"use client";

import { Building2, ChevronLeft, ChevronRight, Cake, Search, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { ramais } from "./ramais-data";
import { Select } from "./select";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const kinds = ["Todos", "Matriz", "Loja"] as const;

/** Aniversários fictícios, distribuídos de forma estável entre as pessoas de exemplo. */
const people = ramais.map((p, i) => ({
  id: p.id,
  name: p.name,
  sector: p.sector,
  kind: p.kind,
  month: (i * 7 + 3) % 12,
  day: ((i * 11 + 5) % 28) + 1,
}));

export function AniversariosView() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [kind, setKind] = useState<(typeof kinds)[number]>("Todos");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return people
      .filter((p) => p.month === month && (kind === "Todos" || p.kind === kind) && (!term || `${p.name} ${p.sector}`.toLowerCase().includes(term)))
      .sort((a, b) => a.day - b.day || a.name.localeCompare(b.name));
  }, [month, kind, q]);

  const year = today.getFullYear();
  const step = (n: number) => setMonth((m) => (m + n + 12) % 12);
  const navBtn = "flex size-12 coarse:size-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20";

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Diversos" }, { label: "Relação de Aniversários" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <Cake className="size-8 text-brand" strokeWidth={1.8} /> Relação de Aniversários
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Veja quem faz aniversário em cada mês.</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-card">
        <div className="flex flex-wrap items-center gap-3 bg-navy px-6 py-5">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Mês anterior" className={navBtn}>
              <ChevronLeft className="size-5" />
            </button>
            <div className="w-[200px]">
              <Select value={String(month)} onChange={(v) => setMonth(Number(v))} options={MONTHS.map((m, i) => ({ value: String(i), label: m }))} searchable={false} aria-label="Mês" className="h-12 font-bold text-ink" />
            </div>
            <button type="button" onClick={() => step(1)} aria-label="Próximo mês" className={navBtn}>
              <ChevronRight className="size-5" />
            </button>
          </div>
          <label className="flex h-12 min-w-[240px] flex-1 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 text-white focus-within:bg-white/15 md:max-w-[420px]">
            <Search className="size-5 shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou setor" className="w-full bg-transparent text-[16px] outline-none placeholder:text-white/70" />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5">
          <div role="radiogroup" aria-label="Tipo de unidade" className="inline-flex gap-1 rounded-2xl border border-line bg-white p-1">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn("h-11 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", kind === k ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}
              >
                {k}
              </button>
            ))}
          </div>
          <p aria-live="polite" className="text-[16px] font-bold">
            {list.length} {list.length === 1 ? "aniversariante" : "aniversariantes"} em {MONTHS[month].toLowerCase()}
          </p>
        </div>

        <div className="p-6">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center">
              <Cake className="mx-auto size-8 text-ink-mute" />
              <p className="mt-2 text-[16px] font-bold">Ninguém encontrado</p>
              <p className="text-[14px] text-ink-soft">Não há aniversariantes com esses filtros em {MONTHS[month].toLowerCase()}.</p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {list.map((p) => {
                const Icon = p.kind === "Loja" ? Store : Building2;
                const isToday = p.day === today.getDate() && p.month === today.getMonth();
                const wd = WEEKDAYS[new Date(year, p.month, p.day).getDay()];
                return (
                  <li key={p.id} className={cn("flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm", isToday ? "border-brand" : "border-line")}>
                    <span className={cn("flex size-14 shrink-0 flex-col items-center justify-center rounded-xl", isToday ? "bg-brand text-white" : "bg-brand-soft text-brand")} aria-label={`Dia ${p.day}, ${wd}`}>
                      <span className="text-[20px] font-bold leading-none">{p.day}</span>
                      <span className="mt-0.5 text-[12px] font-semibold uppercase leading-none">{wd}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[16px] font-bold leading-tight" title={p.name}>
                        {p.name}
                      </h2>
                      <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-soft">
                        <Icon className="size-4 shrink-0" /> <span className="truncate" title={p.sector}>{p.sector}</span>
                      </p>
                    </div>
                    {isToday && <span className="shrink-0 rounded-md bg-brand-soft px-2 py-0.5 text-[12px] font-bold text-brand">Hoje</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
