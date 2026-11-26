"use client";

import { BookUser, Building2, Check, ChevronDown, Filter, Mail, Phone, PhoneOff, Search, Store, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "./date-picker";
import { Select } from "./select";
import { parseBR } from "./data-list";
import { Breadcrumb } from "./dashboard-view";
import { lojaSectors, matrizSectors, ramais, type Ramal } from "./ramais-data";

const kinds = ["Todos", "Matriz", "Loja"] as const;
const STEP = 12;

/** Primeira letra do primeiro e do último nome. */
const initialsOf = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};


function Card({ p, onCopy, copied }: { p: Ramal; onCopy: (text: string, what: string) => void; copied: string }) {
  const Icon = p.kind === "Loja" ? Store : Building2;
  return (
    <li className="rounded-2xl border border-line bg-paper p-4 shadow-sm transition-colors hover:border-brand/40 motion-reduce:transition-none">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] font-bold text-brand">{initialsOf(p.name)}</span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-bold leading-tight" title={p.name}>{p.name}</h2>
          <p className="truncate text-[14px] text-ink-soft" title={p.role}>{p.role}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1" title={p.updated ? `Atualizado em ${p.updated}` : undefined}>
          {p.ramal ? (
            <button
              type="button"
              onClick={() => onCopy(p.ramal, `Ramal ${p.ramal}`)}
              aria-label={`Copiar ramal ${p.ramal} de ${p.name}`}
              title={`Copiar ramal ${p.ramal}`}
              className="flex min-h-9 coarse:min-h-11 items-center gap-2 rounded-lg bg-brand-soft px-3 py-1 text-brand transition-colors hover:bg-brand/15 motion-reduce:transition-none"
            >
              {copied === `Ramal ${p.ramal}` ? <Check className="size-4" /> : <Phone className="size-4" />}
              <span className="text-[20px] font-bold leading-none text-ink">{p.ramal}</span>
            </button>
          ) : (
            <span className="flex min-h-9 coarse:min-h-11 items-center gap-2 rounded-lg bg-surface px-3 py-1 text-[14px] font-semibold text-ink-soft ring-1 ring-line"><PhoneOff className="size-4" /> Sem ramal</span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col items-start gap-2.5 border-t border-line pt-4 text-[14px]">
        <p className="flex min-h-8 max-w-full items-center gap-2 rounded-lg bg-surface px-2.5 py-1 text-ink-soft ring-1 ring-line" title={p.sector}>
          <Icon className="size-4 shrink-0" /> <span className="min-w-0 truncate">{p.sector}</span>
        </p>
        <button
          type="button"
          onClick={() => onCopy(p.email, "E-mail")}
          aria-label={`Copiar e-mail de ${p.name}`}
          title={`Copiar ${p.email}`}
          className="flex min-h-8 coarse:min-h-11 max-w-full items-center gap-2 rounded-lg bg-brand-soft px-2.5 py-1 text-left text-brand transition-colors hover:bg-brand/15 motion-reduce:transition-none"
        >
          {copied === "E-mail" + p.email ? <Check className="size-4 shrink-0" /> : <Mail className="size-4 shrink-0" />}
          <span className="min-w-0 truncate">{copied === "E-mail" + p.email ? "E-mail copiado" : p.email}</span>
        </button>
      </div>
    </li>
  );
}

export function RamaisView() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof kinds)[number]>("Todos");
  const [sector, setSector] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(STEP);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState("");

  const sectors = kind === "Matriz" ? matrizSectors : kind === "Loja" ? lojaSectors : [...matrizSectors, ...lojaSectors];

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ramais.filter((p) => {
      if (kind !== "Todos" && p.kind !== kind) return false;
      if (sector && p.sector !== sector) return false;
      if (term && !`${p.name} ${p.role} ${p.sector} ${p.email} ${p.ramal}`.toLowerCase().includes(term)) return false;
      if (from && (!p.updated || parseBR(p.updated) < new Date(`${from}T00:00`).getTime())) return false;
      if (to && (!p.updated || parseBR(p.updated) > new Date(`${to}T23:59`).getTime())) return false;
      return true;
    });
  }, [q, kind, sector, from, to]);

  const active = [sector && `Setor: ${sector}`, from && `De: ${from.split("-").reverse().join("/")}`, to && `Até: ${to.split("-").reverse().join("/")}`].filter(Boolean) as string[];
  const reset = () => { setSector(""); setFrom(""); setTo(""); setShown(STEP); };

  const copy = (text: string, what: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(what === "E-mail" ? `E-mail${text}` : what);
    setToast(`${what} copiado.`);
    window.setTimeout(() => { setToast(""); setCopied(""); }, 2200);
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Pessoas" }, { label: "Buscar Colaborador" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <BookUser className="size-8 text-brand" strokeWidth={1.8} /> Buscar Colaborador
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Encontre o ramal e o e-mail de qualquer pessoa da empresa.</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
        <div className="flex flex-wrap items-center gap-4 bg-navy px-6 py-5">
          <label className="flex h-12 w-full max-w-[520px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 text-white focus-within:bg-white/15">
            <Search className="size-5 shrink-0" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setShown(STEP); }} placeholder="Buscar por nome, ramal, cargo ou e-mail" className="w-full bg-transparent text-[16px] outline-none placeholder:text-white/70" />
          </label>
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="ml-auto flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white hover:bg-brand-dark">
            <Filter className="size-4" /> Filtros <ChevronDown className={cn("size-4 transition motion-reduce:transition-none", open && "rotate-180")} />
          </button>
        </div>

        {open && (
          <div className="border-b border-line bg-brand-soft/50 p-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block text-[14px] font-semibold lg:col-span-2">
                <span className="mb-1 block">Setor</span>
                <Select value={sector} onChange={(v) => { setSector(v); setShown(STEP); }} options={[{ value: "", label: "Todos os setores" }, ...sectors]} aria-label="Setor" />
              </label>
              <label className="block text-[14px] font-semibold">
                <span className="mb-1 block">Atualizado de</span>
                <DatePicker value={from} onChange={(v) => { setFrom(v); setShown(STEP); }} aria-label="Atualizado de" />
              </label>
              <label className="block text-[14px] font-semibold">
                <span className="mb-1 block">Atualizado até</span>
                <DatePicker value={to} onChange={(v) => { setTo(v); setShown(STEP); }} aria-label="Atualizado até" />
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-5">
          <div role="radiogroup" aria-label="Tipo de unidade" className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => { setKind(k); setSector(""); setShown(STEP); }}
                className={cn("h-11 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", kind === k ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}
              >
                {k}
              </button>
            ))}
          </div>
          <p className="text-[16px] font-bold" aria-live="polite">
            {rows.length === 0 ? "Nenhuma pessoa" : rows.length === 1 ? "1 pessoa encontrada" : `${rows.length} pessoas encontradas`}
          </p>
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-6 pt-4 text-[14px]">
            <span className="font-bold">Filtros aplicados:</span>
            {active.map((a) => (
              <span key={a} className="rounded-full bg-brand-soft px-3 py-1 font-semibold">{a}</span>
            ))}
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 font-bold text-brand underline underline-offset-2">
              <X className="size-3.5" /> Limpar todos
            </button>
          </div>
        )}

        <div className="p-6">
          {rows.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[16px] font-bold">Ninguém encontrado</p>
              <p className="mt-1 text-[14px] text-ink-soft">Confira a grafia do nome ou remova a busca e os filtros.</p>
              <button type="button" onClick={() => { setQ(""); setKind("Todos"); reset(); }} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-5 text-[14px] font-bold hover:bg-brand-soft">
                Limpar busca e filtros
              </button>
            </div>
          ) : (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {rows.slice(0, shown).map((p) => (
                  <Card key={p.id} p={p} onCopy={copy} copied={copied} />
                ))}
              </ul>
              {shown < rows.length && (
                <div className="mt-6 flex justify-center">
                  <button type="button" onClick={() => setShown((n) => n + STEP)} className="flex h-12 items-center gap-2 rounded-xl border border-line bg-paper px-6 text-[16px] font-bold hover:bg-brand-soft">
                    Mostrar mais ({rows.length - shown} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-navy px-5 py-3 text-[14px] font-bold text-white shadow-card transition motion-reduce:transition-none", toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0")}>
        <Check className="size-4" /> {toast}
      </div>
    </div>
  );
}
