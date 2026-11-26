"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  /** Formato ISO `aaaa-mm-dd` (o mesmo do `<input type="date">`). Vazio = sem data. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

type Pos = { left: number; top?: number; bottom?: number };

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK = [["D", "Domingo"], ["S", "Segunda"], ["T", "Terça"], ["Q", "Quarta"], ["Q", "Quinta"], ["S", "Sexta"], ["S", "Sábado"]];
const W = 288;

const pad = (n: number) => String(n).padStart(2, "0");
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  t.setDate(Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()));
  return t;
};

const nav = "flex size-9 coarse:size-11 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand motion-reduce:transition-none";

/** Calendário no padrão do portal, no lugar do seletor nativo de data. */
export function DatePicker({ id, value, onChange, placeholder = "dd/mm/aaaa", className, ...aria }: Props) {
  const uid = useId();
  const selected = parse(value);
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState<Date>(selected ?? today);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  const place = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const up = window.innerHeight - r.bottom < 380 && r.top > window.innerHeight - r.bottom;
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - W - 8));
    setPos(up ? { left, bottom: window.innerHeight - r.top + 6 } : { left, top: r.bottom + 6 });
  };

  const openMenu = () => {
    place();
    setFocus(selected ?? today);
    moved.current = false;
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const pick = (d: Date | null) => {
    onChange(d ? iso(d) : "");
    close();
  };

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

  // Foco no dia ativo: ao abrir e a cada movimento pelo teclado.
  useEffect(() => {
    if (open && pos) gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus({ preventScroll: true });
  }, [open, pos === null, focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step: Record<string, () => Date> = {
      ArrowLeft: () => addDays(focus, -1),
      ArrowRight: () => addDays(focus, 1),
      ArrowUp: () => addDays(focus, -7),
      ArrowDown: () => addDays(focus, 7),
      PageUp: () => addMonths(focus, -1),
      PageDown: () => addMonths(focus, 1),
      Home: () => addDays(focus, -focus.getDay()),
      End: () => addDays(focus, 6 - focus.getDay()),
    };
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    else if (e.key === "Tab" && !panelRef.current?.contains(document.activeElement)) close(false);
    else if (step[e.key] && gridRef.current?.contains(e.target as Node)) { e.preventDefault(); moved.current = true; setFocus(step[e.key]()); }
  };

  // 6 semanas fixas para a altura não pular entre meses.
  const first = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const start = addDays(first, -first.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const sameDay = (a: Date | null, b: Date) => !!a && iso(a) === iso(b);

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openMenu())}
        className={cn(
          "flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-paper px-3 text-left text-[14px] outline-none transition-colors focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/15 motion-reduce:transition-none",
          !selected && "text-ink-soft",
          className,
        )}
        {...aria}
      >
        <span className="min-w-0 flex-1 truncate">{selected ? `${pad(selected.getDate())}/${pad(selected.getMonth() + 1)}/${selected.getFullYear()}` : placeholder}</span>
        <Calendar className="size-4 shrink-0 text-ink-soft" />
      </button>

      {open && pos &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            data-floating=""
            aria-label="Escolher data"
            onKeyDown={onKeyDown}
            style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: W }}
            className="fixed z-[100] max-w-[calc(100vw-16px)] rounded-2xl border border-line bg-paper p-3 text-[14px] text-ink shadow-[0_12px_32px_-8px_rgba(11,31,77,0.25)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <button type="button" onClick={() => setFocus(addMonths(focus, -1))} aria-label="Mês anterior" className={nav}>
                <ChevronLeft className="size-4" />
              </button>
              <p id={`${uid}-title`} aria-live="polite" className="text-[14px] font-bold uppercase tracking-wide">
                {MONTHS[focus.getMonth()]} de {focus.getFullYear()}
              </p>
              <button type="button" onClick={() => setFocus(addMonths(focus, 1))} aria-label="Próximo mês" className={nav}>
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div role="grid" aria-labelledby={`${uid}-title`} ref={gridRef}>
              <div role="row" className="grid grid-cols-7">
                {WEEK.map(([l, full], i) => (
                  <span key={i} role="columnheader" aria-label={full} className="flex h-8 items-center justify-center text-[12px] font-semibold text-ink-soft">
                    {l}
                  </span>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, w) => (
                <div key={w} role="row" className="grid grid-cols-7">
                  {days.slice(w * 7, w * 7 + 7).map((d) => {
                    const out = d.getMonth() !== focus.getMonth();
                    const sel = sameDay(selected, d);
                    const isToday = sameDay(today, d);
                    return (
                      <button
                        key={iso(d)}
                        type="button"
                        role="gridcell"
                        tabIndex={sameDay(focus, d) ? 0 : -1}
                        aria-selected={sel}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={`${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`}
                        onClick={() => pick(d)}
                        className={cn(
                          "mx-auto my-0.5 flex size-9 coarse:size-10 items-center justify-center rounded-lg text-[14px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none",
                          sel ? "bg-brand font-bold text-white" : out ? "text-ink-mute hover:bg-brand-soft" : "hover:bg-brand-soft",
                          !sel && isToday && "font-bold text-brand ring-1 ring-brand",
                        )}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
              <button type="button" onClick={() => pick(null)} className="h-9 coarse:h-11 rounded-lg px-3 text-[14px] font-bold text-brand hover:bg-brand-soft">
                Limpar
              </button>
              <button type="button" onClick={() => pick(new Date())} className="h-9 coarse:h-11 rounded-lg px-3 text-[14px] font-bold text-brand hover:bg-brand-soft">
                Hoje
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
