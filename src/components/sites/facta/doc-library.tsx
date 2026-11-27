"use client";

import { BookOpenText, Download, FileImage, FileSpreadsheet, FileText, Presentation, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { PdfReader } from "./pdf-reader";

/** Enquanto os arquivos reais não estão conectados, o leitor abre um PDF de demonstração. */
const DEMO_PDF = "/sites/facta/em-foco/demo.pdf";

export type DocType = "pdf" | "doc" | "xls" | "ppt" | "img";
/** Uma string é um PDF. */
export type DocItem = string | { name: string; type: DocType };
export type DocGroup = { title: string; items: DocItem[] };

const TYPES: Record<DocType, { label: string; icon: typeof FileText; tone: string }> = {
  pdf: { label: "PDF", icon: FileText, tone: "bg-danger-soft text-danger-ink" },
  doc: { label: "Word", icon: FileText, tone: "bg-brand-soft text-brand" },
  xls: { label: "Excel", icon: FileSpreadsheet, tone: "bg-ok-soft text-ok-ink" },
  ppt: { label: "PowerPoint", icon: Presentation, tone: "bg-warn-soft text-warn-ink" },
  img: { label: "imagem", icon: FileImage, tone: "bg-surface text-ink-soft" },
};
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const asDoc = (d: DocItem) => (typeof d === "string" ? { name: d, type: "pdf" as const } : d);

type Props = {
  trail: { label: string; href?: string }[];
  title: string;
  icon: React.ReactNode;
  intro: string;
  searchLabel: string;
  groups: DocGroup[];
  /** Mostra botões para filtrar por categoria. */
  categoryFilter?: boolean;
};

/** Tela de documentos para baixar, agrupados em categorias de cards (Políticas SEGINFO, Documentos Institucionais). */
export function DocLibrary({ trail, title, icon, intro, searchLabel, groups, categoryFilter }: Props) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [toast, setToast] = useState("");
  const [reading, setReading] = useState<string | null>(null);

  const words = norm(q).split(/\s+/).filter(Boolean);
  const shown = groups
    .filter((g) => !cat || g.title === cat)
    .map((g) => ({ ...g, items: g.items.map(asDoc).filter((d) => words.every((w) => norm(d.name).includes(w))) }))
    .filter((g) => g.items.length);
  const total = shown.reduce((s, g) => s + g.items.length, 0);

  const download = (name: string, type: DocType) => {
    setToast(`Demonstração: o arquivo ${TYPES[type].label} de "${name}" ainda não está conectado.`);
    window.setTimeout(() => setToast(""), 3200);
  };
  const chip = (active: boolean) => cn("flex h-10 coarse:h-11 shrink-0 items-center whitespace-nowrap gap-1.5 rounded-full border px-4 text-[14px] font-semibold transition-colors motion-reduce:transition-none", active ? "border-navy bg-navy text-white" : "border-line bg-paper text-ink-soft hover:border-brand hover:text-ink");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={trail} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            {icon} {title}
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">{intro}</p>
        </div>
        <label className="flex h-12 w-full max-w-[420px] items-center gap-3 rounded-xl border border-line bg-paper px-4 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
          <Search className="size-5 shrink-0 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchLabel} aria-label={searchLabel} className="w-full bg-transparent text-[16px] outline-none placeholder:text-ink-soft" />
        </label>
      </div>

      {categoryFilter && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]md:mx-0 md:flex-wrap md:overflow-visible md:px-0" role="group" aria-label="Filtrar por categoria">
          <button type="button" aria-pressed={!cat} onClick={() => setCat("")} className={chip(!cat)}>Todas</button>
          {groups.map((g) => (
            <button key={g.title} type="button" aria-pressed={cat === g.title} onClick={() => setCat(cat === g.title ? "" : g.title)} className={chip(cat === g.title)}>
              {g.title}
              <span className="tabular text-[12px] opacity-70">{g.items.length}</span>
            </button>
          ))}
        </div>
      )}

      <p aria-live="polite" className="sr-only">{total} documentos encontrados</p>

      {shown.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line bg-paper/70 p-10 text-center">
          <FileText className="mx-auto size-8 text-ink-mute" />
          <p className="mt-2 text-[16px] font-bold">Nenhum documento encontrado</p>
          <p className="text-[14px] text-ink-soft">Tente outro termo de busca{categoryFilter ? " ou outra categoria" : ""}.</p>
        </div>
      )}

      {shown.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`} className="rounded-3xl border border-paper bg-paper/90 p-6 shadow-card">
          <h2 id={`g-${g.title}`} className="flex items-center gap-2.5 text-[20px] font-bold">
            {g.title}
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{g.items.length}</span>
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {g.items.map(({ name, type }, i) => {
              const t = TYPES[type];
              const Icon = t.icon;
              return (
                <li key={`${name}-${i}`} className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-paper p-4 shadow-sm transition-colors hover:border-brand/40 motion-reduce:transition-none">
                  <span className="flex items-start gap-3">
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", t.tone)}>
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[16px] font-bold leading-snug">{name}</span>
                  </span>
                  <span className="mt-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReading(name)}
                      className="flex h-10 coarse:h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-dark"
                    >
                      <BookOpenText className="size-4" /> Ler documento
                    </button>
                    <button
                      type="button"
                      onClick={() => download(name, type)}
                      aria-label={`Baixar ${t.label}: ${name}`}
                      title={`Baixar ${t.label}`}
                      className="flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-xl border border-[#c9d5ea] dark:border-line bg-paper text-ink-soft hover:bg-brand-soft hover:text-brand"
                    >
                      <Download className="size-4" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {reading && <PdfReader src={DEMO_PDF} title={reading} onClose={() => setReading(null)} />}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
