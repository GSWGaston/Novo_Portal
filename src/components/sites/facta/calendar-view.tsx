"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Repeat, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { DatePicker, iso, parse as parseISO } from "./date-picker";
import { Select } from "./select";

/* ---------- tipos e dados ---------- */

type Repeat_ = "none" | "weekly" | "biweekly" | "monthly" | "quarterly" | "semiannual" | "annual";
type ColorKey = "brand" | "ok" | "warn" | "danger" | "user";
type Ev = { id: string; title: string; description: string; time: string; date: string; color: ColorKey; repeat: Repeat_ };
type Draft = Omit<Ev, "id"> & { id?: string };
type View = "month" | "week" | "day";

const REPEATS: { value: Repeat_; label: string }[] = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
  { value: "none", label: "Nenhum" },
];

const COLORS: Record<ColorKey, { label: string; chip: string; dot: string }> = {
  brand: { label: "Azul", chip: "bg-brand-soft text-brand", dot: "bg-brand" },
  ok: { label: "Verde", chip: "bg-ok-soft text-ok-ink", dot: "bg-ok" },
  warn: { label: "Laranja", chip: "bg-warn-soft text-warn-ink", dot: "bg-warn" },
  danger: { label: "Vermelho", chip: "bg-danger-soft text-danger-ink", dot: "bg-danger" },
  user: { label: "Roxo", chip: "bg-user/10 text-user", dot: "bg-user" },
};

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const WEEKDAYS_LONG = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];
const HOUR_H = 52;
const STORAGE = "facta-agenda";

const pad = (n: number) => String(n).padStart(2, "0");
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const dowMon = (d: Date) => (d.getDay() + 6) % 7;
const sameDay = (a: Date, b: Date) => iso(a) === iso(b);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (d: Date) => `${WEEKDAYS_LONG[dowMon(d)]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;

const TIMES = [
  { value: "", label: "Dia todo" },
  ...Array.from({ length: 96 }, (_, i) => {
    const t = `${pad(Math.floor(i / 4))}:${pad((i % 4) * 15)}`;
    return { value: t, label: t };
  }),
];

const repeatLabel = (r: Repeat_) => REPEATS.find((x) => x.value === r)?.label ?? "";

/** O compromisso acontece neste dia? (considera a repetição) */
function occursOn(ev: Ev, d: Date) {
  const b = parseISO(ev.date);
  if (!b) return false;
  const day = startOfDay(d);
  if (day < b) return false;
  if (ev.repeat === "none") return iso(day) === ev.date;
  const days = Math.round((day.getTime() - b.getTime()) / 864e5);
  if (ev.repeat === "weekly") return days % 7 === 0;
  if (ev.repeat === "biweekly") return days % 14 === 0;
  const months = (day.getFullYear() - b.getFullYear()) * 12 + day.getMonth() - b.getMonth();
  const dim = new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate();
  if (day.getDate() !== Math.min(b.getDate(), dim)) return false;
  if (ev.repeat === "monthly") return true;
  if (ev.repeat === "quarterly") return months % 3 === 0;
  if (ev.repeat === "semiannual") return months % 6 === 0;
  return months % 12 === 0;
}

const byTime = (a: Ev, b: Ev) => a.time.localeCompare(b.time);

function seeds(): Ev[] {
  const t = startOfDay(new Date());
  const at = (n: number) => iso(addDays(t, n));
  return [
    { id: "s1", title: "Alinhamento semanal do setor", description: "Pauta: chamados em aberto e prioridades da semana.", time: "15:30", date: at(0), color: "brand", repeat: "weekly" },
    { id: "s2", title: "Treinamento de segurança da informação", description: "Sala 2, com a equipe de Suporte.", time: "10:00", date: at(1), color: "warn", repeat: "none" },
    { id: "s3", title: "Entrega do relatório mensal", description: "Enviar o consolidado de chamados para a gerência.", time: "09:00", date: at(2), color: "danger", repeat: "monthly" },
    { id: "s4", title: "Almoço com a equipe", description: "", time: "12:00", date: at(3), color: "ok", repeat: "none" },
    { id: "s5", title: "Feedback com a gestão", description: "Revisar metas do trimestre.", time: "16:00", date: at(5), color: "user", repeat: "biweekly" },
    { id: "s6", title: "Renovação de certificados", description: "", time: "", date: at(8), color: "warn", repeat: "annual" },
  ];
}

/* ---------- formulário (modal) ---------- */

const control = "h-11 w-full rounded-xl border bg-white px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

function EventModal({ draft, onSave, onDelete, onClose }: { draft: Draft; onSave: (d: Draft) => void; onDelete?: () => void; onClose: () => void }) {
  const [f, setF] = useState<Draft>(draft);
  const [err, setErr] = useState<{ title?: string; date?: string }>({});
  const box = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("[data-floating]")) return;
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const items = box.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), textarea, [tabindex]:not([tabindex='-1'])");
      const first = items[0];
      const last = items[items.length - 1];
      const outside = !box.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = { title: f.title.trim() ? undefined : "Informe um título.", date: f.date ? undefined : "Escolha uma data." };
    setErr(next);
    if (next.title) return titleRef.current?.focus();
    if (next.date) return;
    onSave({ ...f, title: f.title.trim(), description: f.description.trim() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-modal-title"
        noValidate
        onSubmit={submit}
        className="max-h-[94vh] w-full max-w-[860px] overflow-y-auto rounded-[28px] bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="cal-modal-title" className="text-[20px] font-bold">
            {draft.id ? "Editar compromisso" : "Cadastrar compromisso"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_300px] md:p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="cal-title" className="mb-1 block text-[14px] font-semibold">
                Título<span aria-hidden className="ml-0.5 text-danger-ink">*</span>
              </label>
              <input
                id="cal-title"
                ref={titleRef}
                value={f.title}
                maxLength={120}
                aria-invalid={!!err.title}
                aria-describedby={err.title ? "cal-title-err" : undefined}
                onChange={(e) => setF({ ...f, title: e.target.value })}
                placeholder="Ex.: Reunião com o time"
                className={cn(control, err.title ? "border-danger" : "border-line")}
              />
              {err.title && <p id="cal-title-err" className="mt-1 text-[14px] font-medium text-danger-ink">{err.title}</p>}
            </div>
            <div>
              <label htmlFor="cal-desc" className="mb-1 block text-[14px] font-semibold">Descrição</label>
              <textarea id="cal-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} rows={4} placeholder="Detalhes, local, link da reunião…" className="w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span id="cal-time-l" className="mb-1 block text-[14px] font-semibold">Horário</span>
                <Select aria-labelledby="cal-time-l" value={f.time} onChange={(v) => setF({ ...f, time: v })} options={TIMES} placeholder="Dia todo" />
              </div>
              <div>
                <span id="cal-date-l" className="mb-1 block text-[14px] font-semibold">Data</span>
                <DatePicker aria-labelledby="cal-date-l" value={f.date} onChange={(v) => setF({ ...f, date: v })} />
                {err.date && <p className="mt-1 text-[14px] font-medium text-danger-ink">{err.date}</p>}
              </div>
            </div>
            <fieldset>
              <legend className="mb-1.5 text-[14px] font-semibold">Cor</legend>
              <div className="flex gap-3">
                {(Object.keys(COLORS) as ColorKey[]).map((k) => (
                  <label key={k} className="cursor-pointer" title={COLORS[k].label}>
                    <input type="radio" name="cal-color" value={k} checked={f.color === k} onChange={() => setF({ ...f, color: k })} className="peer sr-only" aria-label={COLORS[k].label} />
                    <span className={cn("block size-9 coarse:size-11 rounded-full ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-ink peer-focus-visible:ring-2 peer-focus-visible:ring-brand", COLORS[k].dot)} />
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <fieldset className="h-fit rounded-2xl border border-line bg-surface/60 p-4">
            <legend className="px-1 text-[16px] font-bold">Período</legend>
            <p className="mb-3 text-[14px] text-ink-soft">Com que frequência se repete.</p>
            <div className="grid grid-cols-2 gap-2">
              {REPEATS.map((r) => (
                <label key={r.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-[14px] has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:font-bold has-[:checked]:text-brand has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand">
                  <input type="radio" name="cal-repeat" value={r.value} checked={f.repeat === r.value} onChange={() => setF({ ...f, repeat: r.value })} className="sr-only" />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4 md:px-8">
          {onDelete ? (
            <button type="button" onClick={onDelete} className="h-11 rounded-xl px-4 text-[14px] font-bold text-danger-ink hover:bg-danger-soft">
              Excluir
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-white px-5 text-[16px] font-bold hover:bg-surface">
              Fechar
            </button>
            <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">
              Salvar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ---------- tela ---------- */

const card = "rounded-3xl border border-white bg-white/90 shadow-card";

export function CalendarView() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [sel, setSel] = useState(() => startOfDay(new Date()));
  const [now, setNow] = useState(() => new Date());
  const [modal, setModal] = useState<Draft | null>(null);
  const [toast, setToast] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  // Carrega a agenda salva neste navegador (ou os exemplos).
  useEffect(() => {
    let list: Ev[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) list = JSON.parse(raw) as Ev[];
    } catch {
      list = null;
    }
    setEvents(list ?? seeds());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(events));
    } catch {
      /* sem armazenamento: segue só em memória */
    }
  }, [events, loaded]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (view !== "month" && scroller.current) scroller.current.scrollTop = 7 * HOUR_H;
  }, [view]);

  const today = startOfDay(now);
  const eventsOn = (d: Date) => events.filter((e) => occursOn(e, d)).sort(byTime);

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 2200);
  };

  const openNew = (d: Date, hour?: number) =>
    setModal({ title: "", description: "", time: hour === undefined ? "" : `${pad(hour)}:00`, date: iso(d), color: "brand", repeat: "none" });
  const openEdit = (e: Ev) => setModal({ ...e });

  const save = (d: Draft) => {
    if (d.id) setEvents((l) => l.map((e) => (e.id === d.id ? ({ ...d, id: d.id } as Ev) : e)));
    else setEvents((l) => [...l, { ...d, id: `e${Date.now()}` }]);
    const day = parseISO(d.date);
    if (day) setSel(day);
    setModal(null);
    say(d.id ? "Compromisso atualizado." : "Compromisso salvo.");
  };
  const remove = () => {
    const id = modal?.id;
    if (!id) return;
    setEvents((l) => l.filter((e) => e.id !== id));
    setModal(null);
    say("Compromisso excluído.");
  };

  /* navegação */
  const shift = (dir: 1 | -1) =>
    setCursor((c) => (view === "month" ? new Date(c.getFullYear(), c.getMonth() + dir, 1) : addDays(c, dir * (view === "week" ? 7 : 1))));
  const goToday = () => {
    setCursor(today);
    setSel(today);
  };
  const pickDay = (d: Date) => {
    setSel(d);
    if (view === "day") setCursor(d);
  };

  const title =
    view === "month"
      ? `${cap(MONTHS[cursor.getMonth()])} de ${cursor.getFullYear()}`
      : view === "week"
        ? (() => {
            const a = mondayOf(cursor);
            const b = addDays(a, 6);
            return a.getMonth() === b.getMonth()
              ? `${a.getDate()} – ${b.getDate()} de ${MONTHS[b.getMonth()]} de ${b.getFullYear()}`
              : `${a.getDate()} de ${MONTHS[a.getMonth()].slice(0, 3)} – ${b.getDate()} de ${MONTHS[b.getMonth()].slice(0, 3)} de ${b.getFullYear()}`;
          })()
        : cap(`${longDate(cursor)} de ${cursor.getFullYear()}`);

  /* próximo compromisso */
  const next = useMemo(() => {
    const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    for (let i = 0; i < 400; i++) {
      const d = addDays(startOfDay(now), i);
      const hit = events.filter((e) => occursOn(e, d)).sort(byTime).find((e) => i > 0 || e.time === "" || e.time >= hhmm);
      if (hit) return { ev: hit, date: d, offset: i };
    }
    return null;
  }, [events, now]);

  const nextWhen = () => {
    if (!next) return "";
    const day = next.offset === 0 ? "Hoje" : next.offset === 1 ? "Amanhã" : cap(`${WEEKDAYS_LONG[dowMon(next.date)]}, ${next.date.getDate()} de ${MONTHS[next.date.getMonth()].slice(0, 3)}`);
    return `${day}${next.ev.time ? `, ${next.ev.time}` : " · dia todo"}`;
  };
  const countdown = () => {
    if (!next || next.offset !== 0 || !next.ev.time) return "";
    const [h, m] = next.ev.time.split(":").map(Number);
    const mins = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
    if (mins <= 0) return "agora";
    return mins >= 60 ? `em ${Math.floor(mins / 60)} h${mins % 60 ? ` ${mins % 60} min` : ""}` : `em ${mins} min`;
  };

  /* grade */
  const monthDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = mondayOf(first);
    const total = Math.ceil((dowMon(first) + new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()) / 7) * 7;
    return Array.from({ length: total }, (_, i) => addDays(start, i));
  }, [cursor]);

  const cols = view === "week" ? Array.from({ length: 7 }, (_, i) => addDays(mondayOf(cursor), i)) : [cursor];
  const tpl = { gridTemplateColumns: `56px repeat(${cols.length}, minmax(0, 1fr))` };

  const seg = "h-9 coarse:h-11 rounded-lg px-4 text-[14px] font-bold transition-colors motion-reduce:transition-none";
  const navBtn = "flex size-10 coarse:size-11 items-center justify-center rounded-xl border border-line bg-white text-ink-soft hover:bg-brand-soft hover:text-brand";

  const selEvents = eventsOn(sel);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Diversos" }, { label: "Calendário de Compromissos" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <CalendarDays className="size-8 text-brand" strokeWidth={1.8} /> Calendário de Compromissos
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Organize seus compromissos e veja o que vem pela frente.</p>
        </div>
        <button type="button" onClick={() => openNew(sel)} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Novo compromisso
        </button>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className={cn(card, "overflow-hidden")} aria-label="Calendário">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => shift(-1)} aria-label="Anterior" className={navBtn}>
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => shift(1)} aria-label="Próximo" className={navBtn}>
                <ChevronRight className="size-5" />
              </button>
              <button type="button" onClick={goToday} className="h-10 coarse:h-11 rounded-xl border border-line bg-white px-4 text-[14px] font-bold text-brand hover:bg-brand-soft">
                Hoje
              </button>
            </div>
            <h2 aria-live="polite" className="min-w-0 flex-1 text-[20px] font-bold">{title}</h2>
            <div role="group" aria-label="Visualização" className="flex gap-1 rounded-xl border border-line bg-surface p-1">
              {([["month", "Mês"], ["week", "Semana"], ["day", "Dia"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={cn(seg, view === v ? "bg-brand text-white shadow-sm" : "text-ink-soft hover:bg-white")}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {view === "month" ? (
            <div>
              <div className="grid grid-cols-7 border-b border-line bg-surface/60">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-2.5 text-center text-[12px] font-bold uppercase tracking-wide text-ink-soft">{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((d) => {
                  const out = d.getMonth() !== cursor.getMonth();
                  const isToday = sameDay(d, today);
                  const isSel = sameDay(d, sel);
                  const list = eventsOn(d);
                  return (
                    <button
                      key={iso(d)}
                      type="button"
                      onClick={() => setSel(d)}
                      onDoubleClick={() => openNew(d)}
                      aria-current={isToday ? "date" : undefined}
                      aria-pressed={isSel}
                      aria-label={`${d.getDate()} de ${MONTHS[d.getMonth()]}${list.length ? `, ${list.length} compromisso${list.length > 1 ? "s" : ""}` : ""}`}
                      className={cn(
                        "flex min-h-[64px] flex-col items-stretch gap-1 border-b border-r border-line p-1.5 text-left transition-colors hover:bg-brand-soft/60 motion-reduce:transition-none sm:min-h-[80px] [&:nth-child(7n)]:border-r-0",
                        out && "bg-surface/50",
                        isSel && "bg-brand-soft ring-2 ring-inset ring-brand",
                      )}
                    >
                      <span className={cn("flex size-7 items-center justify-center rounded-full text-[14px] font-semibold", isToday ? "bg-brand text-white" : out ? "text-ink-mute" : "text-ink")}>
                        {d.getDate()}
                      </span>
                      <span className="hidden flex-col gap-0.5 sm:flex">
                        {list.slice(0, 2).map((e) => (
                          <span key={e.id} className={cn("truncate rounded-md px-1.5 py-0.5 text-[12px] font-semibold", COLORS[e.color].chip)}>
                            {e.time && `${e.time} `}
                            {e.title}
                          </span>
                        ))}
                        {list.length > 2 && <span className="px-1.5 text-[12px] font-semibold text-ink-soft">+{list.length - 2} mais</span>}
                      </span>
                      <span className="flex flex-wrap gap-1 px-0.5 sm:hidden">
                        {list.slice(0, 4).map((e) => (
                          <span key={e.id} className={cn("size-1.5 rounded-full", COLORS[e.color].dot)} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className={cn(view === "week" && "min-w-[760px]")}>
                <div className="grid border-b border-line bg-surface/60" style={tpl}>
                  <span />
                  {cols.map((d) => {
                    const isToday = sameDay(d, today);
                    return (
                      <button key={iso(d)} type="button" onClick={() => pickDay(d)} aria-pressed={sameDay(d, sel)} className={cn("flex flex-col items-center gap-0.5 border-l border-line py-2 hover:bg-brand-soft/60", sameDay(d, sel) && "bg-brand-soft")}>
                        <span className="text-[12px] font-bold uppercase tracking-wide text-ink-soft">{WEEKDAYS[dowMon(d)]}</span>
                        <span className={cn("flex size-8 items-center justify-center rounded-full text-[16px] font-bold", isToday && "bg-brand text-white")}>{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid border-b border-line" style={tpl}>
                  <span className="px-2 py-2 text-right text-[12px] text-ink-soft">Dia todo</span>
                  {cols.map((d) => (
                    <div key={iso(d)} className="min-h-10 space-y-0.5 border-l border-line p-0.5">
                      {eventsOn(d).filter((e) => !e.time).map((e) => (
                        <button key={e.id} type="button" onClick={() => openEdit(e)} className={cn("block w-full truncate rounded-md px-1.5 py-1 text-left text-[12px] font-semibold", COLORS[e.color].chip)}>
                          {e.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <div ref={scroller} className="max-h-[calc(100vh-520px)] min-h-[280px] overflow-y-auto">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="grid" style={tpl}>
                      <span className="-mt-2 pr-2 pt-2 text-right text-[12px] text-ink-soft">{pad(h)}:00</span>
                      {cols.map((d) => {
                        const list = eventsOn(d).filter((e) => e.time && Number(e.time.slice(0, 2)) === h);
                        return (
                          <div key={iso(d)} className={cn("relative min-h-[52px] space-y-0.5 border-l border-t border-line p-0.5", sameDay(d, today) && "bg-brand-soft/30")}>
                            <button type="button" onClick={() => openNew(d, h)} aria-label={`Novo compromisso em ${d.getDate()} de ${MONTHS[d.getMonth()]} às ${pad(h)}:00`} className="absolute inset-0 hover:bg-brand-soft/50" />
                            {list.map((e) => (
                              <button key={e.id} type="button" onClick={() => openEdit(e)} className={cn("relative z-10 block w-full rounded-md px-1.5 py-1 text-left text-[12px] font-semibold", COLORS[e.color].chip)}>
                                <span className="block truncate">{e.time} {e.title}</span>
                                {view === "day" && e.description && <span className="block truncate font-normal opacity-80">{e.description}</span>}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className={cn(card, "p-5")} aria-labelledby="next-title">
            <h2 id="next-title" className="text-[12px] font-bold uppercase tracking-wider text-ink-soft">Próximo compromisso</h2>
            {next ? (
              <button type="button" onClick={() => openEdit(next.ev)} className="mt-3 block w-full rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-brand/40">
                <span className={cn("mb-3 block h-1.5 rounded-full", COLORS[next.ev.color].dot)} />
                <span className="block text-[20px] font-bold leading-tight">{next.ev.title}</span>
                <span className="mt-2 flex items-center gap-2 text-[14px] text-ink-soft">
                  <Clock className="size-4 shrink-0" /> {nextWhen()}
                  {countdown() && <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[12px] font-bold text-brand">{countdown()}</span>}
                </span>
                {next.ev.repeat !== "none" && (
                  <span className="mt-1 flex items-center gap-2 text-[14px] text-ink-soft">
                    <Repeat className="size-4 shrink-0" /> {repeatLabel(next.ev.repeat)}
                  </span>
                )}
                {next.ev.description && <span className="mt-3 block text-[14px] text-ink-soft">{next.ev.description}</span>}
              </button>
            ) : (
              <p className="mt-3 text-[14px] text-ink-soft">Nenhum compromisso à vista.</p>
            )}
          </section>

          <section className={cn(card, "p-5")} aria-labelledby="day-title">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="day-title" className="text-[20px] font-bold">Compromissos</h2>
                <p className="text-[14px] text-ink-soft">{cap(longDate(sel))}</p>
              </div>
              <button type="button" onClick={() => openNew(sel)} aria-label="Adicionar compromisso neste dia" className="flex size-10 coarse:size-11 items-center justify-center rounded-full border border-line bg-white text-brand hover:bg-brand-soft">
                <Plus className="size-5" />
              </button>
            </div>
            {selEvents.length ? (
              <ul className="mt-4 space-y-2.5">
                {selEvents.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => openEdit(e)} className="flex w-full gap-3 rounded-2xl border border-line bg-white p-3 text-left transition-colors hover:border-brand/40">
                      <span className={cn("w-1 shrink-0 rounded-full", COLORS[e.color].dot)} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-bold text-ink-soft">{e.time || "Dia todo"}{e.repeat !== "none" && ` · ${repeatLabel(e.repeat)}`}</span>
                        <span className="block truncate text-[16px] font-bold">{e.title}</span>
                        {e.description && <span className="block truncate text-[14px] text-ink-soft">{e.description}</span>}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-line p-5 text-center">
                <p className="text-[14px] text-ink-soft">Nada marcado para este dia.</p>
                <button type="button" onClick={() => openNew(sel)} className="mt-2 h-10 coarse:h-11 rounded-xl px-4 text-[14px] font-bold text-brand hover:bg-brand-soft">
                  Adicionar compromisso
                </button>
              </div>
            )}
          </section>
        </aside>
      </div>

      {modal && <EventModal key={modal.id ?? "new"} draft={modal} onSave={save} onDelete={modal.id ? remove : undefined} onClose={() => setModal(null)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
