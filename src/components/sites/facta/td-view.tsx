"use client";

import { CalendarX2, Clock, GraduationCap, MapPin, Pencil, Plus, UserRound, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { DatePicker, iso } from "./date-picker";
import { Select } from "./select";
import { useModalFocus } from "./use-modal-focus";
import { useStored } from "./use-stored";

/* ---------- dados (demonstração, ficam no localStorage) ---------- */

type Treino = { id: number; date: string; start: string; end: string; title: string; teacher: string; audience: string; place: string; enrolled: number };
type Draft = Omit<Treino, "id"> & { id?: number };
type Tab = "proximos" | "anteriores";

const AUDIENCES = ["Todos os colaboradores", "Matriz", "Lojas", "Lideranças", "Novos colaboradores"];
const PLACES = ["Sala 3 - Recepção RH", "Sala 1007 - Exclusivo RH - 10º andar", "Sala 1112 - 11º andar", "Federasul", "Online (Teams)"];
const TIMES = Array.from({ length: 27 }, (_, i) => {
  const m = 8 * 60 + i * 30; // 08:00 às 21:00, como no portal original
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
});
const STORAGE = "facta-td";
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const WEEKDAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const shift = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const asDate = (s: string) => new Date(`${s}T12:00:00`);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function seeds(): Treino[] {
  const t = (id: number, n: number, start: string, end: string, title: string, teacher: string, audience: string, place: string, enrolled: number): Treino => ({
    id, date: shift(n), start, end, title, teacher, audience, place, enrolled,
  });
  return [
    t(1, -30, "08:30", "13:00", "Integração institucional", "Ana Exemplo Alves", "Novos colaboradores", PLACES[0], 14),
    t(2, -9, "14:00", "16:00", "Atendimento ao cliente nas lojas", "Bruno Exemplo Rocha", "Lojas", PLACES[3], 22),
    t(3, 0, "10:30", "11:30", "Segurança da informação no dia a dia", "Lucas Exemplo Alves", "Todos os colaboradores", PLACES[4], 48),
    t(4, 6, "09:00", "12:00", "Integração institucional", "Ana Exemplo Alves", "Novos colaboradores", PLACES[0], 9),
    t(5, 6, "14:00", "17:00", "Liderança e feedback", "Carla Exemplo Souza", "Lideranças", PLACES[1], 12),
    t(6, 21, "10:30", "11:00", "Novidades em produtos de crédito", "Bruno Exemplo Rocha", "Matriz", PLACES[2], 0),
  ];
}

/* ---------- modal ---------- */

const control = "h-11 w-full rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const label = "mb-1 block text-[14px] font-semibold";
const Req = () => <span aria-hidden className="ml-0.5 text-danger-ink">*</span>;
type Errors = Partial<Record<"date" | "time" | "title" | "teacher" | "audience" | "place", string>>;
const Err = ({ m }: { m?: string }) => (m ? <p className="mt-1 text-[14px] font-medium text-danger-ink">{m}</p> : null);

function TreinoModal({ draft, onSave, onClose }: { draft: Draft; onSave: (d: Draft) => void; onClose: () => void }) {
  const [f, setF] = useState<Draft>(draft);
  const [err, setErr] = useState<Errors>({});
  const box = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const teacherRef = useRef<HTMLInputElement>(null);
  useModalFocus(box, titleRef, onClose);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setF((o) => ({ ...o, [k]: v }));
    setErr((e) => ({ ...e, [k === "start" || k === "end" ? "time" : k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {
      title: f.title.trim() ? undefined : "Informe o tema do treinamento.",
      teacher: f.teacher.trim() ? undefined : "Informe quem vai conduzir.",
      date: f.date ? undefined : "Escolha a data.",
      time: f.end <= f.start ? "O término deve ser depois do início." : undefined,
      audience: f.audience ? undefined : "Escolha o público-alvo.",
      place: f.place ? undefined : "Escolha o local.",
    };
    setErr(next);
    if (next.title) return titleRef.current?.focus();
    if (next.teacher) return teacherRef.current?.focus();
    if (Object.values(next).some(Boolean)) return;
    onSave({ ...f, title: f.title.trim(), teacher: f.teacher.trim() });
  };
  const errCount = Object.values(err).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form ref={box} role="dialog" aria-modal="true" aria-labelledby="td-title" noValidate onSubmit={submit} className="max-h-[94vh] w-full max-w-[720px] overflow-y-auto rounded-[28px] bg-paper shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 md:px-8">
          <h2 id="td-title" className="text-[20px] font-bold">{draft.id ? "Editar treinamento" : "Novo treinamento"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-10 coarse:size-11 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 p-6 md:p-8">
          <p className="text-[14px] text-ink-soft">Os campos com * são obrigatórios.</p>
          {errCount > 0 && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-[14px] font-semibold text-danger-ink">
              {errCount === 1 ? "Há 1 campo para corrigir." : `Há ${errCount} campos para corrigir.`}
            </p>
          )}

          <div>
            <label htmlFor="td-tema" className={label}>Tema<Req /></label>
            <input id="td-tema" ref={titleRef} value={f.title} maxLength={120} aria-invalid={!!err.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex.: Integração institucional" className={cn(control, err.title ? "border-danger" : "border-line")} />
            <Err m={err.title} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="td-resp" className={label}>Responsável pela aula<Req /></label>
              <input id="td-resp" ref={teacherRef} value={f.teacher} maxLength={80} aria-invalid={!!err.teacher} onChange={(e) => set("teacher", e.target.value)} placeholder="Nome de quem conduz" className={cn(control, err.teacher ? "border-danger" : "border-line")} />
              <Err m={err.teacher} />
            </div>
            <div>
              <span id="td-pub" className={label}>Público-alvo<Req /></span>
              <Select aria-labelledby="td-pub" aria-invalid={!!err.audience} value={f.audience} onChange={(v) => set("audience", v)} options={AUDIENCES} placeholder="- Selecione o público -" searchable={false} className={cn(err.audience && "border-danger")} />
              <Err m={err.audience} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <span id="td-data" className={label}>Data<Req /></span>
              <DatePicker aria-labelledby="td-data" aria-invalid={!!err.date} value={f.date} onChange={(v) => set("date", v)} />
              <Err m={err.date} />
            </div>
            <div>
              <span id="td-ini" className={label}>Início</span>
              <Select aria-labelledby="td-ini" value={f.start} onChange={(v) => set("start", v)} options={TIMES} searchable={false} />
            </div>
            <div>
              <span id="td-fim" className={label}>Término</span>
              <Select aria-labelledby="td-fim" value={f.end} onChange={(v) => set("end", v)} options={TIMES} searchable={false} />
            </div>
          </div>
          <Err m={err.time} />

          <div>
            <span id="td-local" className={label}>Local<Req /></span>
            <Select aria-labelledby="td-local" aria-invalid={!!err.place} value={f.place} onChange={(v) => set("place", v)} options={PLACES} placeholder="- Selecione o local -" searchable={false} className={cn(err.place && "border-danger")} />
            <Err m={err.place} />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4 md:px-8">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-line bg-paper px-5 text-[16px] font-bold hover:bg-surface">Fechar</button>
          <button type="submit" className="h-11 rounded-xl bg-brand px-6 text-[16px] font-bold text-white transition hover:bg-brand-dark">Salvar</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- linha do tempo ---------- */

function DateNode({ date, today }: { date: string; today: string }) {
  const d = asDate(date);
  const isToday = date === today;
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "relative z-10 flex size-12 md:size-16 shrink-0 flex-col items-center justify-center rounded-full border-2 leading-none",
          isToday ? "border-brand bg-brand text-white" : "border-brand/30 bg-paper text-ink",
        )}
      >
        <span className="tabular text-[18px] md:text-[20px] font-bold">{String(d.getDate()).padStart(2, "0")}</span>
        <span className={cn("mt-0.5 text-[12px] font-bold uppercase", isToday ? "text-white/85" : "text-ink-soft")}>{MONTHS[d.getMonth()]}</span>
      </div>
      <h3 className="text-[16px] font-bold">
        {isToday ? "Hoje" : WEEKDAYS[d.getDay()]}
        <span className="ml-2 text-[14px] font-medium text-ink-soft">{d.getFullYear()}</span>
      </h3>
    </div>
  );
}

function TreinoCard({ t, past, onEdit }: { t: Treino; past: boolean; onEdit: () => void }) {
  return (
    <article className={cn("rounded-2xl border border-line bg-paper p-4 md:p-5 shadow-sm", past && "bg-paper/70")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-[18px] font-bold">{t.title}</h4>
          <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-soft">
            <UserRound className="size-4 shrink-0" /> {t.teacher}
          </p>
        </div>
        {!past && (
          <button type="button" onClick={onEdit} aria-label={`Editar treinamento ${t.title}`} className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-lg text-brand hover:bg-brand-soft">
            <Pencil className="size-4" />
          </button>
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-[14px] text-ink-soft">
        <li className="flex items-center gap-1.5"><Clock className="size-4 shrink-0" /><span className="tabular">{t.start} às {t.end}</span></li>
        <li className="flex items-center gap-1.5"><MapPin className="size-4 shrink-0" />{t.place}</li>
        <li className="flex items-center gap-1.5"><Users className="size-4 shrink-0" />{t.audience}</li>
        <li className="flex items-center gap-1.5 font-semibold text-ink">{plural(t.enrolled, "inscrito", "inscritos")}</li>
      </ul>
    </article>
  );
}

function Timeline({ list, past, today, onEdit }: { list: Treino[]; past: boolean; today: string; onEdit: (t: Treino) => void }) {
  const days = [...new Set(list.map((t) => t.date))];
  return (
    <ol className="relative">
      {/* trilho vertical que liga as datas */}
      <span aria-hidden className="absolute bottom-6 left-6 top-6 md:bottom-8 md:left-8 md:top-8 w-0.5 -translate-x-1/2 bg-brand/20" />
      {days.map((day) => (
        <li key={day} className="relative pb-8 last:pb-0">
          <DateNode date={day} today={today} />
          <div className="mt-3 grid gap-3 pl-14 md:pl-[88px] xl:grid-cols-2">
            {list.filter((t) => t.date === day).map((t) => (
              <TreinoCard key={t.id} t={t} past={past} onEdit={() => onEdit(t)} />
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- tela ---------- */

export function TdView() {
  const [list, setList] = useStored<Treino[]>(STORAGE, seeds);
  const [tab, setTab] = useState<Tab>("proximos");
  const [modal, setModal] = useState<Draft | null>(null);
  const [toast, setToast] = useState("");

  const today = iso(new Date());
  const byTime = (a: Treino, b: Treino) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
  const upcoming = list.filter((t) => t.date >= today).sort(byTime);
  const past = list.filter((t) => t.date < today).sort((a, b) => byTime(b, a));
  const shown = tab === "proximos" ? upcoming : past;

  const say = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 3000);
  };
  const openNew = () => setModal({ date: "", start: "08:00", end: "09:00", title: "", teacher: "", audience: "", place: "", enrolled: 0 });
  const save = (d: Draft) => {
    if (d.id) setList((l) => l.map((t) => (t.id === d.id ? ({ ...d, id: d.id } as Treino) : t)));
    else setList((l) => [...l, { ...d, id: Math.max(0, ...l.map((t) => t.id)) + 1 }]);
    setTab(d.date >= today ? "proximos" : "anteriores");
    setModal(null);
    say(d.id ? "Treinamento atualizado." : "Treinamento cadastrado.");
  };

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "proximos", label: "Próximos treinamentos", n: upcoming.length },
    { id: "anteriores", label: "Treinamentos anteriores", n: past.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "T&D" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <GraduationCap className="size-8 text-brand" strokeWidth={1.8} /> Treinamento e Desenvolvimento
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Veja os próximos treinamentos do RH e quem pode participar.</p>
        </div>
        <button type="button" onClick={openNew} className="flex h-12 items-center gap-2 rounded-xl bg-brand px-5 text-[16px] font-bold text-white shadow-sm transition hover:bg-brand-dark">
          <Plus className="size-5" /> Novo treinamento
        </button>
      </div>

      <div role="tablist" aria-label="Período" className="inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
        {tabs.map((t) => (
          <button key={t.id} role="tab" type="button" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="td-painel" onClick={() => setTab(t.id)} className={cn("flex h-11 items-center gap-2 rounded-xl px-5 text-[14px] font-bold transition-colors motion-reduce:transition-none", tab === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
            {t.label}
            <span className={cn("tabular rounded-full px-2 py-0.5 text-[12px]", tab === t.id ? "bg-white/15" : "bg-surface")}>{t.n}</span>
          </button>
        ))}
      </div>

      <section id="td-painel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="rounded-3xl border border-paper bg-paper/90 p-4 shadow-card md:p-8">
        {shown.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarX2 className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-[16px] font-bold">{tab === "proximos" ? "Nenhum treinamento marcado." : "Nenhum treinamento anterior."}</p>
            {tab === "proximos" && (
              <button type="button" onClick={openNew} className="mt-3 h-11 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">Novo treinamento</button>
            )}
          </div>
        ) : (
          <Timeline list={shown} past={tab === "anteriores"} today={today} onEdit={(t) => setModal({ ...t })} />
        )}
      </section>

      {modal && <TreinoModal key={modal.id ?? "new"} draft={modal} onSave={save} onClose={() => setModal(null)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
