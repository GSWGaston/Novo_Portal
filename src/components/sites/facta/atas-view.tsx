"use client";

import { ChevronDown, ClipboardList, Download, FileText, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { Select } from "./select";

type Ata = { id: number; category: string; title: string; date: string; participants: string[] };

const CATEGORIES = ["LOJAS", "COMERCIAIS", "RETENÇÃO", "ADMINISTRATIVO E CONTROLADORIA", "DIVERSOS SETORES"];

const P = ["Ana Exemplo Alves", "Bruno Exemplo Rocha", "Carla Exemplo Dias", "Diego Exemplo Costa", "Elisa Exemplo Souza", "Fábio Exemplo Lima"];
const pick = (...i: number[]) => i.map((n) => P[n]);

const atas: Ata[] = [
  { id: 1, category: "LOJAS", title: "Reunião mensal de resultados das lojas", date: "2026-11-12", participants: pick(0, 1, 2, 3) },
  { id: 2, category: "LOJAS", title: "Alinhamento de metas — lojas da região Sul", date: "2026-10-29", participants: pick(1, 4) },
  { id: 3, category: "LOJAS", title: "Treinamento de atendimento: retorno das lojas", date: "2026-10-08", participants: pick(0, 2, 5) },
  { id: 4, category: "COMERCIAIS", title: "Revisão da campanha comercial do trimestre", date: "2026-11-05", participants: pick(2, 3, 4) },
  { id: 5, category: "COMERCIAIS", title: "Reunião com parceiros comerciais", date: "2026-09-24", participants: pick(1, 3) },
  { id: 6, category: "RETENÇÃO", title: "Plano de retenção de clientes — análise de indicadores", date: "2026-11-17", participants: pick(0, 4, 5) },
  { id: 7, category: "RETENÇÃO", title: "Acompanhamento semanal de retenção", date: "2026-11-03", participants: pick(4, 5) },
  { id: 8, category: "ADMINISTRATIVO E CONTROLADORIA", title: "Fechamento contábil de outubro", date: "2026-11-10", participants: pick(0, 3) },
  { id: 9, category: "ADMINISTRATIVO E CONTROLADORIA", title: "Planejamento orçamentário do próximo ano", date: "2026-10-15", participants: pick(0, 1, 3, 5) },
  { id: 10, category: "ADMINISTRATIVO E CONTROLADORIA", title: "Auditoria interna — pontos de atenção", date: "2026-08-27", participants: pick(3, 2) },
  { id: 11, category: "DIVERSOS SETORES", title: "Comitê de segurança da informação", date: "2026-11-19", participants: pick(0, 1, 2, 3, 4) },
  { id: 12, category: "DIVERSOS SETORES", title: "Alinhamento entre Suporte e Recursos Humanos", date: "2026-10-21", participants: pick(1, 5) },
];

const br = (s: string) => s.split("-").reverse().join("/");
const field = "h-11 w-full rounded-xl border border-line bg-white px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

export function AtasView() {
  const [cat, setCat] = useState("");
  const [title, setTitle] = useState("");
  const [who, setWho] = useState("");
  const [applied, setApplied] = useState({ cat: "", title: "", who: "" });
  const [open, setOpen] = useState<Record<string, boolean>>({ LOJAS: true });
  const [toast, setToast] = useState("");

  const searching = !!(applied.cat || applied.title || applied.who);

  const groups = useMemo(() => {
    const t = applied.title.trim().toLowerCase();
    const w = applied.who.trim().toLowerCase();
    return CATEGORIES.filter((c) => !applied.cat || c === applied.cat).map((c) => ({
      name: c,
      items: atas
        .filter((a) => a.category === c && (!t || a.title.toLowerCase().includes(t)) && (!w || a.participants.some((p) => p.toLowerCase().includes(w))))
        .sort((a, b) => b.date.localeCompare(a.date)),
    }));
  }, [applied]);

  const total = groups.reduce((s, g) => s + g.items.length, 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied({ cat, title, who });
  };
  const clear = () => {
    setCat("");
    setTitle("");
    setWho("");
    setApplied({ cat: "", title: "", who: "" });
  };
  const download = (name: string) => {
    setToast(`Demonstração: o PDF da ata "${name}" ainda não está conectado.`);
    window.setTimeout(() => setToast(""), 3200);
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Diversos" }, { label: "Atas de Reunião" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <ClipboardList className="size-8 text-brand" strokeWidth={1.8} /> Atas de Reunião
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Pesquise atas por categoria, título ou participante.</p>
      </div>

      <form onSubmit={submit} className="rounded-3xl border border-white bg-white/90 p-6 shadow-card">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <span id="a-cat" className="mb-1 block text-[14px] font-semibold">Categoria</span>
            <Select aria-labelledby="a-cat" value={cat} onChange={setCat} options={[{ value: "", label: "Todas as categorias" }, ...CATEGORIES]} placeholder="Todas as categorias" searchable={false} />
          </div>
          <label className="block text-[14px] font-semibold">
            <span className="mb-1 block">Título</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Parte do título da ata" className={field} />
          </label>
          <label className="block text-[14px] font-semibold">
            <span className="mb-1 block">Participante</span>
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Nome" className={field} />
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="flex h-11 items-center gap-2 rounded-xl bg-navy px-6 text-[14px] font-bold text-white hover:bg-ink">
            <Search className="size-4" /> Pesquisar
          </button>
          <button type="button" onClick={clear} className="h-11 rounded-xl border border-line bg-white px-6 text-[14px] font-bold hover:bg-surface">
            Limpar
          </button>
        </div>
      </form>

      <p aria-live="polite" className="text-[16px] font-bold">
        {searching ? `${total} ${total === 1 ? "ata encontrada" : "atas encontradas"}` : `${atas.length} atas em ${CATEGORIES.length} categorias`}
      </p>

      <div className="space-y-4">
        {groups.map((g) => {
          // Com pesquisa ativa, os grupos com resultado ficam abertos.
          const expanded = searching ? g.items.length > 0 : !!open[g.name];
          return (
            <section key={g.name} className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-card">
              <h2>
                <button type="button" aria-expanded={expanded} aria-controls={`atas-${g.name}`} onClick={() => setOpen({ ...open, [g.name]: !expanded })} disabled={searching} className="flex min-h-14 w-full items-center gap-3 px-6 py-3 text-left disabled:cursor-default">
                  <span className="text-[16px] font-bold">{g.name}</span>
                  <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{g.items.length}</span>
                  {!searching && <ChevronDown className={cn("ml-auto size-5 text-ink-soft transition-transform motion-reduce:transition-none", expanded && "rotate-180")} />}
                </button>
              </h2>
              {expanded && (
                <ul id={`atas-${g.name}`} className="grid gap-3 border-t border-line p-6 sm:grid-cols-2 2xl:grid-cols-3">
                  {g.items.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[16px] font-bold leading-snug">{a.title}</h3>
                        <p className="mt-1 text-[14px] text-ink-soft">{br(a.date)}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-soft" title={a.participants.join(", ")}>
                          <Users className="size-4 shrink-0" />
                          <span className="truncate">{a.participants.slice(0, 2).join(", ")}{a.participants.length > 2 && ` +${a.participants.length - 2}`}</span>
                        </p>
                      </div>
                      <button type="button" onClick={() => download(a.title)} aria-label={`Baixar ata: ${a.title}`} title="Baixar PDF" className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-xl text-brand hover:bg-brand-soft">
                        <Download className="size-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
        {searching && total === 0 && (
          <div className="rounded-3xl border border-dashed border-line bg-white/70 p-10 text-center">
            <FileText className="mx-auto size-8 text-ink-mute" />
            <p className="mt-2 text-[16px] font-bold">Nenhuma ata encontrada</p>
            <p className="text-[14px] text-ink-soft">Tente outros termos ou clique em Limpar.</p>
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
