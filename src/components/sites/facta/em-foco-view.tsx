"use client";

import { BookOpenText, Download, Newspaper, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { PdfReader } from "./pdf-reader";
import { cn } from "@/lib/utils";
import { FactaLogo } from "./brand";
import { Breadcrumb } from "./dashboard-view";
import { useStored } from "./use-stored";

type Edicao = { id: string; month: string; year: number; headline?: string; bg: string; pdf?: string };

// shortcut: todas as edições abrem o mesmo PDF de demonstração; troque por `pdf` de cada edição quando os arquivos existirem.
const DEMO_PDF = "/sites/facta/em-foco/demo.pdf";

// Edições do portal original (mais recente primeiro). As capas são geradas com as cores de cada edição;
// as três mais antigas não têm imagem no original, então ficam sem manchete.
const EDICOES: Edicao[] = [
  { id: "2026-10", month: "Outubro", year: 2026, headline: "Especial Facta Kids", bg: "from-[#ff2e8a] via-[#b04bd6] to-[#1fa3ff]" },
  { id: "2026-09", month: "Setembro", year: 2026, headline: "Setembro celebra a vida do Sr. Ivaldo!", bg: "from-[#6b5321] via-[#2a2418] to-[#0e0d0b]" },
  { id: "2026-08", month: "Agosto", year: 2026, headline: "30 anos, que história!", bg: "from-[#2b3fd1] via-[#13207a] to-[#070b2e]" },
  { id: "2026-07", month: "Julho", year: 2026, headline: "Pessoas que fazem a diferença", bg: "from-[#3446b8] via-[#1a2466] to-[#f08a00]" },
  { id: "2026-06", month: "Junho", year: 2026, headline: "Entre bandeirinhas, torcida e muita integração", bg: "from-[#1d8a3a] via-[#13307a] to-[#0a1640]" },
  { id: "2026-05", month: "Maio", year: 2026, headline: "Dia do Trabalhador", bg: "from-[#1f6fe0] via-[#0f2f80] to-[#071a4a]" },
  { id: "2026-04", month: "Abril", year: 2026, headline: "Novas coordenações", bg: "from-[#0f2266] via-[#13307a] to-[#ff7a00]" },
  { id: "2026-03", month: "Março", year: 2026, headline: "A expansão da nossa rede não para!", bg: "from-[#ff8a1f] via-[#ff7400] to-[#d65a00]" },
  { id: "2026-02", month: "Fevereiro", year: 2026, headline: "Formatura: rumo ao sucesso", bg: "from-[#8a6a2a] via-[#2a2116] to-[#0b0a08]" },
  { id: "2026-01", month: "Janeiro", year: 2026, bg: "from-[#0b5fe0] to-[#052a66]" },
  { id: "2025-12", month: "Dezembro", year: 2025, bg: "from-[#0b5fe0] to-[#052a66]" },
  { id: "2025-11", month: "Novembro", year: 2025, bg: "from-[#0b5fe0] to-[#052a66]" },
];

function Cover({ e, big }: { e: Edicao; big?: boolean }) {
  return (
    <div aria-hidden className={cn("relative flex aspect-[3/4] flex-col overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-[0_20px_40px_-20px_rgba(5,42,102,0.7)]", e.bg, big ? "p-7" : "p-4")}>
      <span className="absolute -right-10 -top-10 size-40 rounded-full bg-white/10" />
      <p className={cn("font-extrabold italic leading-none tracking-tight", big ? "text-[34px]" : "text-[20px]")}>
        <FactaLogo variant="nominativa" title="facta" className={cn("inline align-baseline", big ? "h-[30px]" : "h-[17px]")} /> <span className={cn("font-semibold", big ? "text-[18px]" : "text-[12px]")}>em</span> foco
      </p>
      <p className={cn("mt-1 font-semibold uppercase tracking-wider text-white/75", big ? "text-[13px]" : "text-[10px]")}>
        Edição {e.month} {e.year}
      </p>
      <p className={cn("mt-auto font-serif font-bold italic leading-tight [text-wrap:balance]", big ? "text-[30px]" : "text-[17px]")}>
        {e.headline ?? `${e.month} de ${e.year}`}
      </p>
      <span className={cn("mt-3 h-1 rounded-full bg-paper/60", big ? "w-16" : "w-10")} />
    </div>
  );
}

function Like({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" aria-pressed={on} aria-label={`Curtir ${label}`} onClick={onToggle} className={cn("flex size-10 coarse:size-11 items-center justify-center rounded-full transition-colors motion-reduce:transition-none", on ? "bg-brand text-white" : "text-ink-soft hover:bg-brand-soft hover:text-brand")}>
      <ThumbsUp className={cn("size-[18px]", on && "fill-current")} />
    </button>
  );
}

export function EmFocoView() {
  const [likes, setLikes] = useStored<string[]>("facta-em-foco-curtidas", () => []);
  const [reading, setReading] = useState<Edicao | null>(null);
  const [latest, ...older] = EDICOES;
  const years = [...new Set(older.map((e) => e.year))];

  const toggle = (id: string) => setLikes((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const open = (e: Edicao) => setReading(e);
  const pdfOf = (e: Edicao) => e.pdf ?? DEMO_PDF;

  return (
    <div className="space-y-8">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "Programas Institucionais" }, { label: "Facta em Foco" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <Newspaper className="size-8 text-brand" strokeWidth={1.8} /> Facta em Foco
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">A revista interna da Facta. Todo mês, uma edição nova com as histórias de quem faz a empresa.</p>
      </div>

      {/* edição mais recente em destaque */}
      <section aria-labelledby="foco-atual" className="relative overflow-hidden rounded-[32px] bg-navy p-6 text-white shadow-card md:p-10">
        <span aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-brand/40 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr] lg:gap-14">
          <button type="button" onClick={() => open(latest)} aria-label={`Ler a edição de ${latest.month} ${latest.year}`} className="mx-auto w-full max-w-[220px] md:max-w-[300px] rotate-[-3deg] rounded-2xl outline-none transition-transform duration-300 hover:rotate-0 focus-visible:ring-4 focus-visible:ring-white/40 motion-reduce:rotate-0 motion-reduce:transition-none">
            <Cover e={latest} big />
          </button>
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold uppercase tracking-wider">Edição mais recente</span>
            <h2 id="foco-atual" className="mt-4 text-[16px] font-semibold text-white/75">
              {latest.month} {latest.year}
            </h2>
            <p className="mt-1 text-[36px] font-extrabold leading-tight tracking-tight md:text-[44px]">{latest.headline}</p>
            <p className="mt-3 max-w-[520px] text-[16px] text-white/80">A edição de {latest.month} do Facta em Foco já está disponível para você.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => open(latest)} className="flex h-12 items-center gap-2 rounded-xl bg-paper px-5 text-[16px] font-bold text-navy hover:bg-brand-soft">
                <BookOpenText className="size-5" /> Ler edição
              </button>
              <button type="button" aria-pressed={likes.includes(latest.id)} onClick={() => toggle(latest.id)} className={cn("flex h-12 items-center gap-2 rounded-xl px-4 text-[16px] font-bold", likes.includes(latest.id) ? "bg-brand text-white" : "text-white/85 hover:bg-white/10")}>
                <ThumbsUp className={cn("size-5", likes.includes(latest.id) && "fill-current")} /> {likes.includes(latest.id) ? "Curtiu" : "Curtir"}
              </button>
              <a href={pdfOf(latest)} download aria-label={`Baixar PDF da edição de ${latest.month} ${latest.year}`} title="Baixar PDF" className="flex size-12 items-center justify-center rounded-xl text-white/85 hover:bg-white/10">
                <Download className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* edições anteriores, por ano */}
      <div className="space-y-8">
        <h2 className="text-[24px] font-extrabold tracking-tight">Edições anteriores</h2>
        {years.map((y) => (
          <section key={y} aria-labelledby={`foco-${y}`}>
            <h3 id={`foco-${y}`} className="mb-4 flex items-center gap-2.5 text-[20px] font-bold">
              {y}
              <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{older.filter((e) => e.year === y).length}</span>
            </h3>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {older.filter((e) => e.year === y).map((e) => (
                <li key={e.id}>
                  <button type="button" onClick={() => open(e)} aria-label={`Ler a edição de ${e.month} ${e.year}`} className="group block w-full rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-brand/30">
                    <div className="transition-transform duration-200 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
                      <Cover e={e} />
                    </div>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold">{e.month}</p>
                      {e.headline && <p className="truncate text-[14px] text-ink-soft">{e.headline}</p>}
                    </div>
                    <Like on={likes.includes(e.id)} onToggle={() => toggle(e.id)} label={`a edição de ${e.month} ${e.year}`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {reading && <PdfReader src={pdfOf(reading)} title={`Facta em Foco · ${reading.month} ${reading.year}`} onClose={() => setReading(null)} />}
    </div>
  );
}
