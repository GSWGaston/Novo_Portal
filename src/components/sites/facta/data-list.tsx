"use client";

import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, Filter, Layers, Search, X, type LucideIcon, BrushCleaning } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ORIGIN_KEY, readSession, writeSession } from "./use-stored";
import { cn } from "@/lib/utils";
import { DatePicker } from "./date-picker";
import { Select } from "./select";
import { Breadcrumb } from "./dashboard-view";
import { useRouter } from "next/navigation";

/** Clique em qualquer parte da linha abre o chamado (links, botões e seleção de texto seguem normais). */
export function rowClick(go: () => void) {
  return (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input,select,textarea,label")) return;
    if (window.getSelection()?.toString()) return;
    go();
  };
}

/** "dd/mm/aaaa" ou "dd/mm/aaaa hh:mm[:ss]" → milissegundos. */
export const parseBR = (s: string) => {
  const [d, m, rest] = s.split("/");
  const [y, hm = "00:00:00"] = rest.split(" ");
  return new Date(`${y}-${m}-${d}T${hm.length === 5 ? `${hm}:00` : hm}`).getTime();
};

export type Col<T> = { key: string; label: string; sort?: (r: T) => string | number; render: (r: T) => React.ReactNode; className?: string };
export type FilterDef<T> = { key: string; label: string; kind: "select" | "text" | "from" | "to"; options?: string[]; test: (r: T, value: string) => boolean; more?: boolean };

type Props<T> = {
  /** chave para lembrar busca e filtros ao sair e voltar; padrão: o título */
  persistKey?: string;
  title: string;
  icon: LucideIcon;
  trail: { label: string; href?: string }[];
  rows: T[];
  rowKey: (r: T) => string | number;
  /** Se informado, clicar em qualquer parte da linha leva a este endereço. */
  rowHref?: (r: T) => string;
  /** Classe extra por linha (ex.: destaque de urgentes). */
  rowClass?: (r: T) => string | false | undefined;
  columns: Col<T>[];
  search: (r: T) => string;
  placeholder: string;
  filters: FilterDef<T>[];
  /** Esconde certas linhas até a pessoa ligar o botão (ex.: "Mostrar concluídas"). */
  toggle?: { label: string; hidden: (r: T) => boolean };
  /** Conteúdo entre o título e o bloco da lista (ex.: abas). */
  header?: React.ReactNode;
  defaultSort?: { key: string; dir: 1 | -1 };
  noun: [string, string];
};

const input = "h-11 w-full rounded-xl border border-line bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

export function DataList<T>({ persistKey, title, icon: Icon, trail, rows: all, rowKey, rowHref, rowClass, columns, search, placeholder, filters, toggle, header, defaultSort, noun }: Props<T>) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState(defaultSort ?? { key: "", dir: 1 as 1 | -1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [ready, setReady] = useState(false);

  const storeKey = `facta-lista:${persistKey ?? title}`;
  // volta com a busca e os filtros aplicados (voltar do navegador, trilha ou botão Voltar)
  useEffect(() => {
    const s = readSession<{ q: string; applied: Record<string, string>; showAll: boolean; sort: { key: string; dir: 1 | -1 }; page: number; size: number }>(storeKey);
    if (s) {
       
      setQ(s.q); setApplied(s.applied); setDraft(s.applied); setShowAll(s.showAll); setSort(s.sort); setPage(s.page); setSize(s.size);
       
    }
    setReady(true);
    // o chamado aberto a partir daqui sabe para qual lista voltar
    writeSession(ORIGIN_KEY, { label: trail[trail.length - 1].label, href: window.location.pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeKey]);
  useEffect(() => {
    if (ready) writeSession(storeKey, { q, applied, showAll, sort, page, size });
  }, [ready, storeKey, q, applied, showAll, sort, page, size]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = all.filter((r) => {
      if (toggle && !showAll && toggle.hidden(r)) return false;
      if (term && !search(r).toLowerCase().includes(term)) return false;
      return filters.every((f) => !applied[f.key] || f.test(r, applied[f.key]));
    });
    const col = columns.find((c) => c.key === sort.key);
    if (col?.sort) {
      const val = col.sort;
      list.sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
    }
    return list;
  }, [all, q, showAll, applied, sort, columns, filters, search, toggle]);

  const pages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, pages);
  const view = rows.slice((cur - 1) * size, cur * size);
  const chips = filters.filter((f) => applied[f.key]);
  const primary = filters.filter((f) => !f.more);
  const extra = filters.filter((f) => f.more);

  const apply = (v: Record<string, string>) => {
    setApplied(v);
    setPage(1);
  };
  const clearAll = () => {
    setDraft({});
    apply({});
  };
  const hasFilters = chips.length > 0 || q.trim() !== "";
  const clearEverything = () => { setQ(""); clearAll(); };

  const router = useRouter();
  const field = (f: FilterDef<T>) => (
    <label key={f.key} className="block text-[14px] font-semibold">
      <span className="mb-1 block">{f.label}</span>
      {f.kind === "select" ? (
        <Select value={draft[f.key] ?? ""} onChange={(v) => setDraft({ ...draft, [f.key]: v })} options={[{ value: "", label: "Selecione" }, ...(f.options ?? [])]} aria-label={f.label} />
      ) : (
        f.kind === "text" ? (
          <input type="text" value={draft[f.key] ?? ""} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} placeholder={f.label} className={input} />
        ) : (
          <DatePicker value={draft[f.key] ?? ""} onChange={(v) => setDraft({ ...draft, [f.key]: v })} aria-label={f.label} />
        )
      )}
    </label>
  );

  const th = (c: Col<T>) => (
    <th key={c.key} scope="col" className={cn("px-2.5 py-4 text-left text-[14px] font-extrabold", c.className)} aria-sort={c.sort ? (sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : "none") : undefined}>
      {c.sort ? (
        <button type="button" className="inline-flex items-center gap-1 hover:text-brand coarse:min-h-11" onClick={() => setSort((s) => ({ key: c.key, dir: s.key === c.key ? (-s.dir as 1 | -1) : 1 }))}>
          {c.label} <ArrowUpDown className={cn("size-3.5", sort.key === c.key ? "text-brand" : "opacity-50")} />
        </button>
      ) : (
        c.label
      )}
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={trail} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <Icon className="size-8 text-brand" strokeWidth={1.8} /> {title}
        </h1>
        {header}
      </div>

      <section className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
        <div className="flex flex-wrap items-center gap-4 bg-navy px-6 py-5">
          <label className="flex h-12 w-full min-w-[240px] flex-1 sm:w-auto max-w-[520px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 text-white focus-within:bg-white/15">
            <Search className="size-5 shrink-0" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={placeholder} className="w-full bg-transparent text-[16px] outline-none placeholder:text-white/70" />
          </label>
          <div className="ml-auto flex flex-wrap items-center gap-4">
          {toggle && (
            <button
              type="button"
              aria-pressed={showAll}
              onClick={() => { setShowAll((v) => !v); setPage(1); }}
              className={cn("flex h-12 items-center gap-2 rounded-xl border px-5 text-[16px] font-bold transition-colors motion-reduce:transition-none", showAll ? "border-paper bg-paper text-navy" : "border-white/25 bg-white/10 text-white hover:bg-white/20")}
            >
              {toggle.label}
            </button>
          )}
          {hasFilters && (
            <button type="button" onClick={clearEverything} aria-label="Limpar busca e filtros" title="Limpar busca e filtros" className="flex size-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white hover:bg-white/20">
              <BrushCleaning className="size-5" />
            </button>
          )}
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white hover:bg-brand-dark">
            <Filter className="size-4" /> Filtros <ChevronDown className={cn("size-4 transition motion-reduce:transition-none", open && "rotate-180")} />
          </button>
          </div>
        </div>

        {open && (
          <div className="border-b border-line bg-brand-soft/50 p-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">{primary.map(field)}</div>
            {more && extra.length > 0 && <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">{extra.map(field)}</div>}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              {extra.length > 0 ? (
                <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="flex h-11 items-center gap-2 rounded-xl border border-[#c9d5ea] dark:border-line bg-paper px-5 text-[14px] font-bold hover:bg-surface">
                  {more ? "Menos filtros" : "Mais filtros"} <ChevronDown className={cn("size-4 transition motion-reduce:transition-none", more && "rotate-180")} />
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-3">
                <button type="button" onClick={clearAll} className="flex h-11 items-center gap-2 rounded-xl border border-[#c9d5ea] dark:border-line bg-paper px-5 text-[14px] font-bold hover:bg-surface">
                  <X className="size-4" /> Limpar filtros
                </button>
                <button type="button" onClick={() => apply(draft)} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-6 text-[14px] font-bold text-white hover:bg-brand-dark">
                  <Search className="size-4" /> Pesquisar
                </button>
              </div>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-6 py-4 text-[14px]">
            <span className="font-bold">Filtros aplicados:</span>
            {chips.map((f) => (
              <span key={f.key} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 font-semibold">
                {f.label}: {applied[f.key]}
                <button type="button" aria-label={`Remover filtro ${f.label}`} onClick={() => { const n = { ...applied, [f.key]: "" }; setDraft(n); apply(n); }}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <button type="button" className="font-bold text-brand underline underline-offset-2" onClick={clearAll}>
              Limpar todos
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-[14px] [&_td]:whitespace-nowrap [&_td]:px-2.5 [&_td]:py-4">
            <thead className="border-y border-line bg-surface">
              <tr>{columns.map(th)}</tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr key={rowKey(r)} onClick={rowHref ? rowClick(() => router.push(rowHref(r))) : undefined} className={cn("border-b border-line hover:bg-brand-soft/40", rowHref && "cursor-pointer", rowClass?.(r))}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.className}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              ))}
              {view.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="!whitespace-normal py-12 text-center">
                    <p className="text-[16px] font-bold">Nenhum registro encontrado</p>
                    <p className="mt-1 text-[14px] text-ink-soft">Tente outros termos ou remova a busca e os filtros.</p>
                    <button type="button" onClick={() => { setQ(""); clearAll(); }} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-5 text-[14px] font-bold hover:bg-brand-soft">
                      Limpar busca e filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-5">
          <p className="flex items-center gap-2 text-[16px] font-bold">
            <Layers className="size-5 text-brand" /> {rows.length === 0 ? `Nenhum ${noun[0]}` : rows.length === 1 ? `1 ${noun[0]} encontrado` : `${rows.length} ${noun[1]} encontrados`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="flex h-10 coarse:h-11 items-center gap-1 rounded-xl border border-line bg-paper px-3 text-[14px] disabled:opacity-40">
              <ChevronLeft className="size-4" /> Página anterior
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-current={n === cur} onClick={() => setPage(n)} className={cn("size-10 coarse:size-11 rounded-xl border text-[14px] font-bold", n === cur ? "border-brand bg-brand text-white" : "border-line bg-paper")}>
                {n}
              </button>
            ))}
            <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="flex h-10 coarse:h-11 items-center gap-1 rounded-xl border border-line bg-paper px-3 text-[14px] disabled:opacity-40">
              Próxima página <ChevronRight className="size-4" />
            </button>
            <label className="ml-3 flex items-center gap-2 text-[14px]">
              Exibir
              <Select value={String(size)} onChange={(v) => { setSize(Number(v)); setPage(1); }} options={[10, 30, 50].map((n) => ({ value: String(n), label: `${n} por página` }))} aria-label="Itens por página" className="h-10 coarse:h-11 w-auto min-w-[9.5rem] px-3 font-semibold" />
            </label>
          </div>
        </footer>
      </section>
    </div>
  );
}
