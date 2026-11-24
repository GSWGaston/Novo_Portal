"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Strings viram `{ value: s, label: s }`. Uma opção com `value: ""` funciona como "limpar". */
  options: (Option | string)[];
  placeholder?: string;
  disabled?: boolean;
  /** Padrão: barra de pesquisa aparece quando há mais de 6 opções. */
  searchable?: boolean;
  icon?: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type Pos = { left: number; width: number; top?: number; bottom?: number; maxH: number };

const triggerBase =
  "flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-white px-3 text-left text-[14px] outline-none transition-colors focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-default motion-reduce:transition-none";

/** Dropdown no padrão do portal: painel claro, pesquisa opcional, teclado completo. */
export function Select({ id, value, onChange, options, placeholder = "Selecione", disabled, searchable, icon, className, ...aria }: Props) {
  const uid = useId();
  const opts = useMemo<Option[]>(() => options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)), [options]);
  const withSearch = searchable ?? opts.length > 6;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
  }, [opts, query]);

  const selected = opts.find((o) => o.value === value);
  const label = selected && selected.value !== "" ? selected.label : placeholder;
  const muted = !selected || selected.value === "";

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    const up = below < 260 && above > below;
    const width = Math.max(r.width, 200);
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8));
    setPos(up ? { left, width, bottom: window.innerHeight - r.top + 6, maxH: Math.min(360, above) } : { left, width, top: r.bottom + 6, maxH: Math.min(360, below) });
  };

  const openMenu = () => {
    if (disabled) return;
    place();
    setQuery("");
    setActive(Math.max(0, opts.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (o: Option) => {
    onChange(o.value);
    close();
  };

  // Foco no campo de pesquisa (ou na lista) ao abrir.
  useEffect(() => {
    if (!open || !pos) return;
    (withSearch ? inputRef.current : listRef.current)?.focus({ preventScroll: true });
  }, [open, pos === null, withSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fecha ao clicar fora; reposiciona ao rolar/redimensionar.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    const move = () => place();
    document.addEventListener("pointerdown", down);
    window.addEventListener("resize", move);
    window.addEventListener("scroll", move, true);
    return () => {
      document.removeEventListener("pointerdown", down);
      window.removeEventListener("resize", move);
      window.removeEventListener("scroll", move, true);
    };
  }, [open]);

  // Mantém a opção ativa visível.
  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, uid]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = filtered.length - 1;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(last, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(Math.max(0, last)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) choose(filtered[active]); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "Tab") close(false);
  };

  const activeId = filtered[active] ? `${uid}-opt-${active}` : undefined;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${uid}-list` : undefined}
        disabled={disabled}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) { e.preventDefault(); openMenu(); }
        }}
        className={cn(triggerBase, muted && "text-ink-soft", className)}
        {...aria}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {!disabled && <ChevronDown className={cn("size-4 shrink-0 text-ink-soft transition-transform motion-reduce:transition-none", open && "rotate-180")} />}
      </button>

      {open && pos &&
        createPortal(
          <div
            ref={panelRef}
            data-floating=""
            onKeyDown={onKeyDown}
            style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH }}
            className="fixed z-[100] flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-1.5 text-[14px] text-ink shadow-[0_12px_32px_-8px_rgba(11,31,77,0.25)]"
          >
            {withSearch && (
              <div className="relative mb-1.5 shrink-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActive(0); }}
                  placeholder="Pesquisar"
                  aria-label="Pesquisar opções"
                  aria-controls={`${uid}-list`}
                  aria-activedescendant={activeId}
                  autoComplete="off"
                  className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
                />
              </div>
            )}
            <ul ref={listRef} id={`${uid}-list`} role="listbox" tabIndex={withSearch ? -1 : 0} aria-activedescendant={withSearch ? undefined : activeId} className="min-h-0 flex-1 overflow-y-auto outline-none">
              {filtered.length === 0 && <li className="px-3 py-3 text-ink-soft">Nenhuma opção encontrada</li>}
              {filtered.map((o, i) => {
                const isSel = o.value === value;
                return (
                  <li
                    key={o.value + i}
                    id={`${uid}-opt-${i}`}
                    role="option"
                    aria-selected={isSel}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(o)}
                    className={cn(
                      "flex min-h-10 coarse:min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2",
                      i === active && "bg-brand-soft",
                      isSel ? "font-bold text-brand" : o.value === "" && "text-ink-soft",
                    )}
                  >
                    <span className="min-w-0 flex-1">{o.label}</span>
                    {isSel && <Check className="size-4 shrink-0" />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </>
  );
}
