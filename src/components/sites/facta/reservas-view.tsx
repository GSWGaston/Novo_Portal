"use client";

import { DoorOpen, Pencil, Plus, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { currentUser } from "./data";
import { DatePicker, iso, parse as parseISO } from "./date-picker";
import { Select } from "./select";

/* ---------- dados ---------- */

type Kind = "Reuniões" | "Treinamentos";
type Reserva = { id: string; kind: Kind; room: string; date: string; start: string; end: string; reason: string; requester: string; active: boolean };
type Draft = Omit<Reserva, "id"> & { id?: string };
type Tab = "cadastro" | "proximas" | "anteriores";

const kinds: Kind[] = ["Reuniões", "Treinamentos"];

const ROOMS: Record<Kind, string[]> = {
  Reuniões: [
    "Facta Financeira (Exclusivo) - 7º andar Andradas",
    "Sala de Entrevistas - 6º ANDAR",
    "Sala de Entrevistas - 7º ANDAR - 1",
    "Sala de Entrevistas - 7º ANDAR - 2",
    "Sala de Reuniões - Loja Vigário - Loja Vigário",
    "Sala de Reuniões 1 - 6º ANDAR - Corretor",
    "Sala de Reuniões 2 - 15º ANDAR",
    "Sala de Reuniões 3 - 15º ANDAR",
    "Sala Gerência - Recursos Humanos",
  ],
  Treinamentos: ["Sala 1007 - Exclusivo RH - 10º ANDAR", "Sala 1112 - 11º ANDAR"],
};

const TIMES = Array.from({ length: 27 }, (_, i) => {
  const m = 7 * 60 + i * 30;
  const t = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { value: t, label: t };
});

const STORAGE = "facta-reservas";
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const br = (s: string) => s.split("-").reverse().join("/");

function seeds(): Reserva[] {
  const t = startOfDay(new Date());
  const at = (n: number) => iso(addDays(t, n));
  const r = (id: string, kind: Kind, ri: number, n: number, start: string, end: string, reason: string, requester: string, active = true): Reserva => ({
    id, kind, room: ROOMS[kind][ri], date: at(n), start, end, reason, requester, active,
  });
  return [
    r("r1", "Reuniões", 6, -12, "09:00", "10:00", "Alinhamento de metas do trimestre", currentUser.name),
    r("r2", "Reuniões", 1, -4, "14:00", "15:30", "Entrevistas — vaga de analista", "Ana Exemplo Alves"),
    r("r3", "Reuniões", 6, 0, "10:00", "11:00", "Reunião de alinhamento do setor", currentUser.name),
    r("r4", "Reuniões", 6, 0, "15:30", "16:30", "Revisão de chamados críticos", "Bruno Exemplo Rocha"),
    r("r5", "Reuniões", 2, 1, "09:30", "10:30", "Entrevista com candidato", "Ana Exemplo Rocha"),
    r("r6", "Reuniões", 0, 3, "13:00", "14:00", "Planejamento financeiro", currentUser.name),
    r("r7", "Reuniões", 8, 6, "11:00", "12:00", "Feedback individual", "Lucas Exemplo Alves", false),
    r("t1", "Treinamentos", 0, -8, "08:30", "12:00", "Onboarding de novos colaboradores", "Ana Exemplo Alves"),
    r("t2", "Treinamentos", 1, 0, "13:30", "17:00", "Treinamento de segurança da informação", currentUser.name),
    r("t3", "Treinamentos", 0, 2, "09:00", "11:00", "Capacitação de atendimento", "Bruno Exemplo Rocha"),
    r("t4", "Treinamentos", 1, 5, "14:00", "16:00", "Workshop de produtos", "Ana Exemplo Rocha"),
  ];
}

const overlap = (a: { start: string; end: string }, b: { start: string; end: string }) => a.start < b.end && b.start < a.end;

/* ---------- modal ---------- */

const control = "h-11 w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

function Err({ m }: { m?: string }) {
  return m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null;
}

function ReservaModal({ draft, all, onSave, onClose }: { draft: Draft; all: Reserva[]; onSave: (d: Draft) => void; onClose: () => void }) {
  const [f, setF] = useState<Draft>(draft);
  const [err, setErr] = useState<{ room?: string; date?: string; time?: string; reason?: string }>({});
  const box = useRef<HTMLFormElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    reasonRef.current?.focus();
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
    const clash = all.find((r) => r.active && r.id !== f.id && r.kind === f.kind && r.room === f.room && r.date === f.date && overlap(r, f));
    const next = {
      room: f.room ? undefined : "Escolha a sala.",
      date: f.date ? undefined : "Escolha a data.",
      reason: f.reason.trim() ? undefined : "Informe o motivo.",
      time: f.end <= f.start ? "O término deve ser depois do início." : clash ? `Sala já reservada das ${clash.start} às ${clash.end}.` : undefined,
    };
    setErr(next);
    if (next.reason) return reasonRef.current?.focus();
    if (next.room || next.date || next.time) return;
    onSave({ ...f, reason: f.reason.trim() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="res-title" noValidate onSubmit={submit} className="max-h-[94vh] w-full max-w-[640px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="res-title" className="text-[20px] font-bold">
            {draft.id ? "Editar reserva" : "Nova reserva"} · {f.kind === "Reuniões" ? "Reunião" : "Treinamento"}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-5 p-6 md:p-8">
          <div>
            <span id="res-room" className="mb-1 block text-[14px] font-semibold">Sala<span aria-hidden className="ml-0.5 text-danger-ink">*</span></span>
            <Select aria-labelledby="res-room" value={f.room} onChange={(v) => setF({ ...f, room: v })} options={ROOMS[f.kind]} placeholder="- Selecione -" searchable={false} />
            <Err m={err.room} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span id="res-date" className="mb-1 block text-[14px] font-semibold">Data</span>
              <DatePicker aria-labelledby="res-date" value={f.date} onChange={(v) => setF({ ...f, date: v })} />
              <Err m={err.date} />
            </div>
            <div>
              <span id="res-start" className="mb-1 block text-[14px] font-semibold">Início</span>
              <Select aria-labelledby="res-start" value={f.start} onChange={(v) => setF({ ...f, start: v })} options={TIMES} searchable={false} />
            </div>
            <div>
              <span id="res-end" className="mb-1 block text-[14px] font-semibold">Término</span>
              <Select aria-labelledby="res-end" value={f.end} onChange={(v) => setF({ ...f, end: v })} options={TIMES} searchable={false} />
            </div>
          </div>
          <Err m={err.time} />
          <div>
            <label htmlFor="res-reason" className="mb-1 block text-[14px] font-semibold">Motivo<span aria-hidden className="ml-0.5 text-danger-ink">*</span></label>
            <input id="res-reason" ref={reasonRef} value={f.reason} maxLength={120} aria-invalid={!!err.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="Ex.: Reunião de alinhamento" className={cn(control, err.reason ? "border-danger" : "border-line")} />
            <Err m={err.reason} />
          </div>
          <p className="text-[14px] text-ink-soft">Solicitante: <strong className="text-ink">{f.requester}</strong></p>
        </div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Salvar</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- tabela ---------- */

function Table({ list, showDate, actions, onEdit, onToggle }: { list: Reserva[]; showDate?: boolean; actions?: boolean; onEdit: (r: Reserva) => void; onToggle: (r: Reserva) => void }) {
  const th = "px-4 py-3 text-left text-[12px] font-bold uppercase tracking-wide text-ink-soft";
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[760px] text-[14px]">
        <thead className="bg-surface/70">
          <tr>
            {showDate && <th className={th}>Data</th>}
            <th className={th}>Horário</th>
            <th className={th}>Sala</th>
            <th className={th}>Motivo</th>
            <th className={th}>Solicitante</th>
            <th className={th}>Ativo</th>
            {actions && <th className={cn(th, "text-right")}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} className={cn("border-t border-line", !r.active && "text-ink-mute")}>
              {showDate && <td className="whitespace-nowrap px-4 py-3 font-semibold">{br(r.date)}</td>}
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{r.start} – {r.end}</td>
              <td className="px-4 py-3">{r.room}</td>
              <td className="px-4 py-3">{r.reason}</td>
              <td className="px-4 py-3">{r.requester}</td>
              <td className="px-4 py-3">
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[12px] font-bold", r.active ? "bg-ok-soft text-ok-ink" : "bg-surface text-ink-soft")}>{r.active ? "Ativa" : "Cancelada"}</span>
              </td>
              {actions && (
                <td className="whitespace-nowrap px-4 py-2 text-right">
                  <button type="button" onClick={() => onEdit(r)} aria-label={`Editar reserva ${r.reason}`} className="inline-flex h-10 coarse:h-11 items-center gap-1.5 rounded-lg px-3 font-bold text-brand hover:bg-brand-soft">
                    <Pencil className="size-4" /> Editar
                  </button>
                  <button type="button" onClick={() => onToggle(r)} className={cn("h-10 coarse:h-11 rounded-lg px-3 font-bold", r.active ? "text-danger-ink hover:bg-danger-soft" : "text-brand hover:bg-brand-soft")}>
                    {r.active ? "Cancelar" : "Reativar"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- tela ---------- */

export function ReservasView() {
  const [list, setList] = useState<Reserva[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [kind, setKind] = useState<Kind>("Reuniões");
  const [tab, setTab] = useState<Tab>("cadastro");
  const [date, setDate] = useState(() => iso(new Date()));
  const [room, setRoom] = useState("");
  const [roomErr, setRoomErr] = useState(false);
  const [query, setQuery] = useState<{ date: string; room: string } | null>(null);
  const [modal, setModal] = useState<Draft | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let data: Reserva[] | null = null;
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) data = JSON.parse(raw) as Reserva[];
    } catch {
      data = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setList(data ?? seeds());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(list));
    } catch {
      /* segue em memória */
    }
  }, [list, loaded]);

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 2200);
  };

  const todayIso = iso(new Date());
  const mine = list.filter((r) => r.kind === kind);
  const sort = (a: Reserva, b: Reserva) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
  const upcoming = mine.filter((r) => r.date >= todayIso).sort(sort);
  const past = mine.filter((r) => r.date < todayIso).sort((a, b) => sort(b, a));
  const results = query ? mine.filter((r) => r.date === query.date && r.room === query.room).sort(sort) : [];

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !parseISO(date)) {
      setRoomErr(!room);
      return;
    }
    setRoomErr(false);
    setQuery({ date, room });
  };

  const openNew = () => setModal({ kind, room: query?.room ?? room, date: query?.date ?? date, start: "09:00", end: "10:00", reason: "", requester: currentUser.name, active: true });
  const save = (d: Draft) => {
    if (d.id) setList((l) => l.map((r) => (r.id === d.id ? ({ ...d, id: d.id } as Reserva) : r)));
    else setList((l) => [...l, { ...d, id: `r${Date.now()}` }]);
    setRoom(d.room);
    setDate(d.date);
    setQuery({ date: d.date, room: d.room });
    setTab("cadastro");
    setModal(null);
    say(d.id ? "Reserva atualizada." : "Reserva salva.");
  };
  const toggle = (r: Reserva) => {
    if (!r.active) {
      const clash = list.find((o) => o.active && o.id !== r.id && o.kind === r.kind && o.room === r.room && o.date === r.date && overlap(o, r));
      if (clash) return say(`Não dá para reativar: sala reservada das ${clash.start} às ${clash.end}.`);
    }
    setList((l) => l.map((o) => (o.id === r.id ? { ...o, active: !o.active } : o)));
    say(r.active ? "Reserva cancelada." : "Reserva reativada.");
  };

  const tabs: [Tab, string][] = [
    ["cadastro", "Cadastro/Atualização"],
    ["proximas", kind === "Reuniões" ? "Próximas reuniões" : "Próximos treinamentos"],
    ["anteriores", kind === "Reuniões" ? "Reuniões anteriores" : "Treinamentos anteriores"],
  ];

  const empty = (t: string) => (
    <div className="rounded-2xl border border-dashed border-line p-10 text-center">
      <DoorOpen className="mx-auto size-8 text-ink-mute" />
      <p className="mt-2 text-[16px] font-bold">{t}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Agenda" }, { label: "Reservas de Salas" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <DoorOpen className="size-8 text-brand" strokeWidth={1.8} /> Reservas de Salas
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Reserve salas de reunião e de treinamento e acompanhe suas reservas.</p>
      </div>

      <section className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-6">
          <div role="radiogroup" aria-label="Tipo de reserva" className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => { setKind(k); setRoom(""); setRoomErr(false); setQuery(null); }}
                className={cn("h-11 rounded-xl px-6 text-[14px] font-bold transition-colors motion-reduce:transition-none", kind === k ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}
              >
                {k}
              </button>
            ))}
          </div>
          <button type="button" onClick={openNew} className="flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
            <Plus className="size-5" /> Nova reserva
          </button>
        </div>

        <div role="tablist" aria-label="Seções" className="mt-5 flex flex-wrap gap-1 border-b border-line px-6">
          {tabs.map(([t, l]) => (
            <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls="res-panel" onClick={() => setTab(t)} className={cn("-mb-px h-12 whitespace-nowrap border-b-2 px-4 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t ? "border-brand text-brand" : "border-transparent text-ink-soft hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>

        <div id="res-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-5 p-6">
          {tab === "cadastro" && (
            <>
              <form onSubmit={search} noValidate className="grid items-end gap-4 md:grid-cols-[220px_minmax(0,1fr)_auto]">
                <div>
                  <span id="f-date" className="mb-1 block text-[14px] font-semibold">Data</span>
                  <DatePicker aria-labelledby="f-date" value={date} onChange={setDate} />
                </div>
                <div>
                  <span id="f-room" className="mb-1 block text-[14px] font-semibold">Sala</span>
                  <Select aria-labelledby="f-room" aria-invalid={roomErr} aria-describedby={roomErr ? "f-room-err" : undefined} value={room} onChange={(v) => { setRoom(v); setRoomErr(false); }} options={ROOMS[kind]} placeholder="- Selecione -" searchable={false} className={cn(roomErr && "border-danger")} />
                  {roomErr && <p id="f-room-err" className="mt-1 text-[14px] font-medium text-danger-ink">Campo obrigatório.</p>}
                </div>
                <button type="submit" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-navy px-6 text-[14px] font-bold text-white hover:bg-ink">
                  <Search className="size-4" /> Pesquisar
                </button>
              </form>

              {!query ? (
                empty("Escolha a data e a sala para ver as reservas.")
              ) : results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line p-10 text-center">
                  <p className="text-[16px] font-bold">Nenhuma reserva nesta sala em {br(query.date)}.</p>
                  <button type="button" onClick={openNew} className="mt-2 h-11 rounded-xl px-4 text-[14px] font-bold text-brand hover:bg-brand-soft">Fazer uma reserva</button>
                </div>
              ) : (
                <Table list={results} actions onEdit={(r) => setModal({ ...r })} onToggle={toggle} />
              )}
            </>
          )}
          {tab === "proximas" && (upcoming.length ? <Table list={upcoming} showDate actions onEdit={(r) => setModal({ ...r })} onToggle={toggle} /> : empty(kind === "Reuniões" ? "Nenhuma reunião marcada." : "Nenhum treinamento marcado."))}
          {tab === "anteriores" && (past.length ? <Table list={past} showDate onEdit={() => {}} onToggle={() => {}} /> : empty(kind === "Reuniões" ? "Nenhuma reunião anterior." : "Nenhum treinamento anterior."))}
        </div>
      </section>

      {modal && <ReservaModal key={modal.id ?? "new"} draft={modal} all={list} onSave={save} onClose={() => setModal(null)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
