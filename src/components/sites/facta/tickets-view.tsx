"use client";

import {
  ArrowUpDown,
  Check,
  GripVertical,
  Pin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Headset,
  Hourglass,
  Info,
  Layers,
  MessageSquare,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { tickets, type Ticket } from "./data";

type Filters = { code: string; title: string; origin: string; requester: string; owner: string; status: string; priority: string; uf: string; from: string; to: string };
const empty: Filters = { code: "", title: "", origin: "", requester: "", owner: "", status: "", priority: "", uf: "", from: "", to: "" };

const labels: Record<keyof Filters, string> = {
  code: "Código", title: "Título", origin: "Origem", requester: "Solicitante", owner: "Responsável",
  status: "Status", priority: "Prioridade", uf: "UF", from: "De", to: "Até",
};

type SortKey = "code" | "title" | "priority" | "status" | "requester" | "owner" | "updated";
const rank = { Baixa: 0, Média: 1, Alta: 2 } as const;
const toTime = (s: string) => {
  const [d, m, rest] = s.split("/");
  const [y, hm = "00:00"] = rest.split(" ");
  return new Date(`${y}-${m}-${d}T${hm}`).getTime();
};
const uniq = (k: keyof Ticket) => [...new Set(tickets.map((t) => String(t[k])).filter(Boolean))].sort();

const input = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[14px] font-semibold">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Pick({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(input, "text-ink-soft")}>
      <option value="">Selecione</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export function StatusPill({ s }: { s: Ticket["status"] }) {
  const dev = s === "Em desenvolvimento";
  const Icon = dev ? RefreshCw : Hourglass;
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[14px] font-bold", dev ? "bg-brand-soft text-brand" : "bg-warn-soft text-warn-ink")}>
      <Icon className="size-3.5" /> {s}
    </span>
  );
}

export function PriorityPill({ p }: { p: Ticket["priority"] }) {
  const c = p === "Alta" ? "bg-danger-soft text-danger-ink" : p === "Média" ? "bg-warn-soft text-warn-ink" : "bg-ok-soft text-ok-ink";
  const dot = p === "Alta" ? "bg-danger" : p === "Média" ? "bg-warn" : "bg-ok";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[14px] font-bold", c)}>
      <span className={cn("size-2.5 rounded-full", dot)} /> {p}
    </span>
  );
}

export function TicketsView() {
  const [q, setQ] = useState(useSearchParams().get("q") ?? "");
  const [exact, setExact] = useState(false);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [draft, setDraft] = useState<Filters>(empty);
  const [applied, setApplied] = useState<Filters>(empty);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "updated", dir: -1 });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const [announce, setAnnounce] = useState("");
  const touching = useRef(false);
  const body = useRef<HTMLTableSectionElement>(null);
  const tops = useRef(new Map<string, number>());

  const reorder = (from: number, target: number) => {
    if (from === target) return;
    const rest = picked.filter((c) => c !== from);
    rest.splice(rest.indexOf(target) + (picked.indexOf(from) < picked.indexOf(target) ? 1 : 0), 0, from);
    setPicked(rest);
  };
  const finger = useRef({ x: 0, y: 0 });
  const edgeTimer = useRef<number | undefined>(undefined);
  const hitRow = () => document.elementFromPoint(finger.current.x, finger.current.y)?.closest<HTMLElement>("tr[data-pin]");
  const endDrag = () => {
    touching.current = false;
    window.clearInterval(edgeTimer.current);
    setDragging(null);
    setOver(null);
  };
  // janela sem foco no meio do arrasto: solta o chamado em vez de deixá-lo preso
  useEffect(() => {
    window.addEventListener("blur", endDrag);
    return () => window.removeEventListener("blur", endDrag);
  }, []);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const f = applied;
    const list = tickets.filter((t) => {
      const hay = [t.code, t.title, t.subtitle, t.requester, t.owner].join(" ").toLowerCase();
      if (term && !(exact ? hay.split(/\s+/).includes(term) || String(t.code) === term : hay.includes(term))) return false;
      if (f.code && !String(t.code).includes(f.code.trim())) return false;
      if (f.title && !`${t.title} ${t.subtitle}`.toLowerCase().includes(f.title.toLowerCase())) return false;
      if (f.origin && t.origin !== f.origin) return false;
      if (f.requester && t.requester !== f.requester) return false;
      if (f.owner && t.owner !== f.owner) return false;
      if (f.status && t.status !== f.status) return false;
      if (f.priority && t.priority !== f.priority) return false;
      if (f.uf && t.uf !== f.uf) return false;
      const u = toTime(t.updated);
      if (f.from && u < new Date(`${f.from}T00:00`).getTime()) return false;
      if (f.to && u > new Date(`${f.to}T23:59`).getTime()) return false;
      return true;
    });
    const val = (t: Ticket) => (sort.key === "updated" ? toTime(t.updated) : sort.key === "priority" ? rank[t.priority] : t[sort.key]);
    // fixados primeiro, na ordem em que o usuário os arrumou
    const pin = (t: Ticket) => (picked.includes(t.code) ? picked.indexOf(t.code) : Infinity);
    return list.sort((a, b) => (pin(a) === pin(b) ? 0 : pin(a) < pin(b) ? -1 : 1) || (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [q, exact, applied, sort, picked]);

  const pinnedCodes = rows.filter((t) => picked.includes(t.code)).map((t) => t.code);
  const move = (code: number, dir: -1 | 1) => {
    const i = pinnedCodes.indexOf(code);
    const neighbor = pinnedCodes[i + dir];
    if (neighbor === undefined) {
      setAnnounce(`Chamado ${code} já está ${dir < 0 ? "no topo" : "por último"} entre os fixados.`);
      return;
    }
    reorder(code, neighbor);
    setAnnounce(`Chamado ${code} movido para a posição ${i + dir + 1} de ${pinnedCodes.length}.`);
  };

  // Quando uma linha muda de posição (fixar, arrastar, ordenar), ela desliza da posição antiga até a nova.
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next = new Map<string, number>();
    body.current?.querySelectorAll<HTMLElement>("tr[data-row]").forEach((tr) => {
      const key = tr.dataset.row!;
      next.set(key, tr.offsetTop);
      const before = tops.current.get(key);
      if (!reduce && expanded === null && before !== undefined && Math.abs(before - tr.offsetTop) > 1) {
        tr.animate([{ transform: `translateY(${before - tr.offsetTop}px)` }, { transform: "none" }], { duration: 260, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
      }
    });
    tops.current = next;
  });

  const pages = Math.max(1, Math.ceil(rows.length / size));
  const cur = Math.min(page, pages);
  const view = rows.slice((cur - 1) * size, cur * size);
  const chips = (Object.keys(applied) as (keyof Filters)[]).filter((k) => applied[k]);

  const apply = (f: Filters) => {
    setApplied(f);
    setPage(1);
  };
  const clearAll = () => {
    setDraft(empty);
    apply(empty);
  };
  const th = (key: SortKey, label: string, cls = "") => (
    <th scope="col" className={cn("px-2.5 py-4 text-left text-[14px] font-bold", cls)} aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"}>
      <button type="button" className="inline-flex items-center gap-1 hover:text-brand coarse:min-h-11" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : 1 }))}>
        {label} <ArrowUpDown className={cn("size-3.5", sort.key === key ? "text-brand" : "opacity-50")} />
      </button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Solicitações", href: "/solicitacoes" }, { label: "Setores" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold tracking-tight">
          <Headset className="size-8 text-brand" strokeWidth={1.8} /> Solicitações dos Setores
        </h1>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-card">
        <div className="flex flex-wrap items-center gap-4 bg-navy px-6 py-5">
          <label className="flex h-12 w-full max-w-[520px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 text-white focus-within:bg-white/15">
            <Search className="size-5 shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar chamado, título, solicitante ou responsável"
              className="w-full bg-transparent text-[16px] outline-none placeholder:text-white/70"
            />
          </label>
          <button
            type="button"
            aria-pressed={exact}
            onClick={() => setExact((e) => !e)}
            className={cn(
              "ml-auto flex h-12 items-center gap-2 rounded-xl border px-5 text-[16px] font-bold transition",
              exact ? "border-white bg-white text-navy" : "border-white/25 bg-white/10 text-white hover:bg-white/20",
            )}
          >
            <Check className={cn("size-4", !exact && "opacity-0")} /> Busca exata
          </button>
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white hover:bg-brand-dark">
            <Filter className="size-4" /> Filtros <ChevronDown className={cn("size-4 transition motion-reduce:transition-none", open && "rotate-180")} />
          </button>
        </div>

        {open && (
          <div className="border-b border-line bg-brand-soft/50 p-6">
            <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Status"><Pick value={draft.status} onChange={(v) => setDraft({ ...draft, status: v })} options={uniq("status")} /></Field>
              <Field label="Prioridade"><Pick value={draft.priority} onChange={(v) => setDraft({ ...draft, priority: v })} options={["Baixa", "Média", "Alta"]} /></Field>
              <Field label="Responsável"><Pick value={draft.owner} onChange={(v) => setDraft({ ...draft, owner: v })} options={uniq("owner")} /></Field>
              <Field label="Alterado de"><input type="date" className={input} value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} /></Field>
              <Field label="Alterado até"><input type="date" className={input} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} /></Field>
            </div>
            {more && (
              <div className="mt-5 grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
                <Field label="Código"><input className={input} placeholder="Digite o código" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></Field>
                <Field label="Título"><input className={input} placeholder="Parte do título" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
                <Field label="Origem"><Pick value={draft.origin} onChange={(v) => setDraft({ ...draft, origin: v })} options={uniq("origin")} /></Field>
                <Field label="Solicitante"><Pick value={draft.requester} onChange={(v) => setDraft({ ...draft, requester: v })} options={uniq("requester")} /></Field>
                <Field label="UF"><Pick value={draft.uf} onChange={(v) => setDraft({ ...draft, uf: v })} options={uniq("uf")} /></Field>
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="flex h-11 items-center gap-1.5 text-[14px] font-bold text-brand">
                {more ? "Menos filtros" : "Mais filtros"} <ChevronDown className={cn("size-4 transition motion-reduce:transition-none", more && "rotate-180")} />
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={clearAll} className="flex h-11 items-center gap-2 rounded-xl border border-[#c9d5ea] bg-white px-5 text-[14px] font-bold hover:bg-surface">
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
            {chips.map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 font-semibold">
                {labels[k]}: {applied[k]}
                <button type="button" aria-label={`Remover filtro ${labels[k]}`} onClick={() => { const n = { ...applied, [k]: "" }; setDraft(n); apply(n); }}>
                  <X className="size-3.5" />
                </button>
              </span>
            ))}
            <button type="button" className="font-bold text-brand underline underline-offset-2" onClick={clearAll}>
              Limpar todos
            </button>
          </div>
        )}

        <div role="status" aria-live="polite" className="sr-only">{announce}</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-[14px] [&_td]:whitespace-nowrap [&_td]:px-2.5 [&_td]:py-4">
            <thead className="border-y border-line bg-surface">
              <tr>
                <th className="w-28 px-2" aria-label="Detalhes e fixar" />
                {th("code", "Código")}
                {th("title", "Título / Chamado")}
                {th("priority", "Prioridade")}
                {th("status", "Status")}
                {th("requester", "Solicitante / Origem")}
                {th("owner", "Responsável")}
                {th("updated", "Atualizado")}
              </tr>
            </thead>
            <tbody ref={body}>
              {view.map((t) => {
                const isOpen = expanded === t.code;
                const pinned = picked.includes(t.code);
                return (
                  <Fragment key={t.code}>
                    <tr
                      data-row={t.code}
                      data-pin={pinned ? t.code : undefined}
                      onDragOver={(e) => {
                        if (!pinned || dragging === null) return;
                        e.preventDefault();
                        setOver(t.code);
                      }}
                      onDrop={() => pinned && dragging !== null && reorder(dragging, t.code)}
                      className={cn("border-b border-line hover:bg-brand-soft/40", pinned && "group/row bg-warn-soft/50 shadow-[inset_3px_0_0_var(--color-warn)]", dragging === t.code && "bg-brand-soft opacity-45 outline-2 -outline-offset-2 outline-dashed outline-brand/50", dragging !== null && dragging !== t.code && over === t.code && pinned && (pinnedCodes.indexOf(dragging) < pinnedCodes.indexOf(t.code) ? "shadow-[inset_0_-3px_0_var(--color-brand)]" : "shadow-[inset_0_3px_0_var(--color-brand)]"), isOpen && "bg-brand-soft/40")}
                    >
                      <td className="relative !pl-8 !pr-1 coarse:!pl-12">
                        {pinned && (
                          <button
                            type="button"
                            draggable
                            aria-label={`Reordenar chamado ${t.code}: arraste, ou use as setas para cima e para baixo`}
                            title="Arraste ou use ↑ ↓ para reordenar"
                            onKeyDown={(e) => {
                              if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                              e.preventDefault();
                              move(t.code, e.key === "ArrowUp" ? -1 : 1);
                            }}
                            onDragStart={(e) => {
                              if (touching.current) {
                                e.preventDefault();
                                return;
                              }
                              setDragging(t.code);
                              e.dataTransfer.setDragImage(e.currentTarget.closest("tr")!, 0, 0);
                            }}
                            onDragEnd={endDrag}
                            onPointerDown={(e) => {
                              if (e.pointerType === "mouse") return;
                              e.currentTarget.setPointerCapture(e.pointerId);
                              touching.current = true;
                              finger.current = { x: e.clientX, y: e.clientY };
                              navigator.vibrate?.(10);
                              setDragging(t.code);
                              // dedo perto da borda da tela: rola a página enquanto segura, e reavalia a linha sob o dedo
                              edgeTimer.current = window.setInterval(() => {
                                const { y } = finger.current;
                                if (y < 96) window.scrollBy(0, -16);
                                else if (y > window.innerHeight - 96) window.scrollBy(0, 16);
                                const row = hitRow();
                                setOver(row ? Number(row.dataset.pin) : null);
                              }, 16);
                            }}
                            onPointerMove={(e) => {
                              if (!touching.current) return;
                              finger.current = { x: e.clientX, y: e.clientY };
                              const row = hitRow();
                              setOver(row ? Number(row.dataset.pin) : null);
                            }}
                            onPointerUp={() => {
                              if (touching.current && over !== null) reorder(t.code, over);
                              endDrag();
                            }}
                            onPointerCancel={endDrag}
                            onLostPointerCapture={endDrag}
                            className={cn("absolute left-1 top-1/2 flex h-10 w-6 coarse:left-0 coarse:h-12 coarse:w-11 -translate-y-1/2 cursor-grab touch-none items-center justify-center rounded-md border border-line bg-white text-ink-soft shadow-md transition active:cursor-grabbing focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-brand group-hover/row:opacity-100 [@media(hover:none)]:opacity-100 motion-reduce:transition-none", dragging === t.code ? "scale-110 opacity-100 ring-2 ring-brand" : "opacity-0")}
                          >
                            <GripVertical className="size-4" />
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                        <button type="button" aria-expanded={isOpen} aria-label={`Detalhes do chamado ${t.code}`} onClick={() => setExpanded(isOpen ? null : t.code)} className={cn("flex size-8 coarse:size-11 items-center justify-center rounded-lg", isOpen ? "bg-brand-soft text-brand" : "hover:bg-brand-soft")}>
                          {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                        <button type="button" aria-pressed={pinned} aria-label={pinned ? `Desafixar ${t.code}` : `Fixar ${t.code} no topo`} title={pinned ? "Desafixar" : "Fixar no topo"} onClick={() => setPicked(pinned ? picked.filter((c) => c !== t.code) : [...picked, t.code])} className={cn("flex size-8 coarse:size-11 items-center justify-center rounded-lg transition active:scale-90 motion-reduce:active:scale-100", pinned ? "text-warn-ink hover:bg-warn-soft" : "text-ink-mute hover:bg-brand-soft hover:text-brand")}>
                          <Pin className={cn("size-4", pinned && "fill-current")} />
                        </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold"><Link href={`/solicitacoes/${t.code}`} className="text-brand hover:underline">{t.code}</Link></td>
                      <td className="px-3"><Link href={`/solicitacoes/${t.code}`} className="block font-bold hover:text-brand">{t.title}</Link><span className="block text-[12px] text-ink-soft">{t.subtitle}</span></td>
                      <td className="whitespace-nowrap px-3"><PriorityPill p={t.priority} /></td>
                      <td className="whitespace-nowrap px-3"><StatusPill s={t.status} /></td>
                      <td className="px-2.5"><span className="block">{t.requester}</span><span className="block text-[12px] text-ink-soft">{t.origin}</span></td>
                      <td className="px-3">{t.owner || "—"}</td>
                      <td className="px-3"><span className="block">{t.updated}</span><span className="block text-[12px] text-ink-soft">{t.days} dias</span></td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-line bg-surface/60">
                        <td colSpan={8} className="p-4">
                          <div className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-2xl border border-line bg-white p-4">
                              <p className="flex items-center gap-2 font-bold"><MessageSquare className="size-4 text-brand" /> Primeira interação <span className="text-[12px] font-normal text-ink-soft">{t.opened}</span></p>
                              <p className="mt-3 rounded-xl bg-surface p-3">{t.firstMessage}</p>
                            </div>
                            <div className="rounded-2xl border border-line bg-white p-4">
                              <p className="flex items-center gap-2 font-bold"><RefreshCw className="size-4 text-brand" /> Última interação <span className="text-[12px] font-normal text-ink-soft">{t.updated}</span></p>
                              <p className="mt-3 rounded-xl bg-surface p-3">{t.lastMessage}</p>
                            </div>
                            <div className="rounded-2xl border border-line bg-white p-4">
                              <p className="flex items-center gap-2 font-bold"><Info className="size-4 text-brand" /> Informações do chamado</p>
                              <dl className="mt-3 space-y-1 text-[14px]">
                                {[["Solicitante", t.requester], ["Setor", t.origin], ["Responsável", t.owner || "—"], ["Abertura", t.opened], ["Última atualização", t.updated]].map(([k, v]) => (
                                  <div key={k} className="flex gap-2"><dt className="w-[120px] text-ink-soft">{k}:</dt><dd className="font-semibold">{v}</dd></div>
                                ))}
                              </dl>
                              <Link href={`/solicitacoes/${t.code}`} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[14px] font-bold text-white hover:bg-brand-dark">
                                <ExternalLink className="size-4" /> Abrir chamado completo
                              </Link>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {view.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <p className="text-[16px] font-bold">Nenhum chamado encontrado</p>
                    <p className="mt-1 text-[14px] text-ink-soft">Tente outros termos ou remova a busca e os filtros.</p>
                    <button type="button" onClick={() => { setQ(""); clearAll(); }} className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-5 text-[14px] font-bold hover:bg-brand-soft">
                      Limpar busca e filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-5">
          <p className="flex items-center gap-2 text-[16px] font-bold"><Layers className="size-5 text-brand" /> {rows.length === 0 ? "Nenhum chamado" : rows.length === 1 ? "1 chamado encontrado" : `${rows.length} chamados encontrados`}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="flex h-10 coarse:h-11 items-center gap-1 rounded-xl border border-line bg-white px-3 text-[14px] disabled:opacity-40"><ChevronLeft className="size-4" /> Página anterior</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" aria-current={n === cur} onClick={() => setPage(n)} className={cn("size-10 coarse:size-11 rounded-xl border text-[14px] font-bold", n === cur ? "border-brand bg-brand text-white" : "border-line bg-white")}>{n}</button>
            ))}
            <button type="button" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="flex h-10 coarse:h-11 items-center gap-1 rounded-xl border border-line bg-white px-3 text-[14px] disabled:opacity-40">Próxima página <ChevronRight className="size-4" /></button>
            <label className="ml-3 flex items-center gap-2 text-[14px]">Exibir
              <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }} className="h-10 coarse:h-11 rounded-xl border border-line bg-white px-2 font-semibold">
                {[10, 30, 50].map((n) => <option key={n} value={n}>{n} por página</option>)}
              </select>
            </label>
          </div>
        </footer>
      </section>
    </div>
  );
}
