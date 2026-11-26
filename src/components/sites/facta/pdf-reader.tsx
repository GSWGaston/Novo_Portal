"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, LoaderCircle, Maximize, X, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useModalFocus } from "./use-modal-focus";

const ZOOMS = [1, 1.25, 1.5, 2, 2.5, 3];

async function openPdf(src: string) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs.getDocument(src).promise;
}

/** Desenha a página `n` no canvas com a largura/altura CSS pedidas, nítida em telas de alta densidade. */
async function draw(doc: PDFDocumentProxy, n: number, canvas: HTMLCanvasElement, fit: (w: number, h: number) => number, signal: { cancelled: boolean }) {
  const page = await doc.getPage(n);
  const base = page.getViewport({ scale: 1 });
  const scale = fit(base.width, base.height);
  const dpr = window.devicePixelRatio || 1;
  const vp = page.getViewport({ scale: scale * dpr });
  if (signal.cancelled) return;
  // desenha num canvas fora da tela e só copia no final: duas renderizações no mesmo canvas
  // (ex.: o tamanho muda logo ao abrir) embaralham a transformação e a página aparecia de cabeça para baixo
  const off = document.createElement("canvas");
  off.width = Math.floor(vp.width);
  off.height = Math.floor(vp.height);
  await page.render({ canvas: off, viewport: vp }).promise;
  if (signal.cancelled) return;
  canvas.width = off.width;
  canvas.height = off.height;
  canvas.style.width = `${Math.floor(vp.width / dpr)}px`;
  canvas.style.height = `${Math.floor(vp.height / dpr)}px`;
  canvas.getContext("2d")?.drawImage(off, 0, 0);
}

function Thumb({ doc, n, active, onPick }: { doc: PDFDocumentProxy; n: number; active: boolean; onPick: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const signal = { cancelled: false };
    if (ref.current) draw(doc, n, ref.current, (w) => 72 / w, signal).catch(() => {});
    return () => void (signal.cancelled = true);
  }, [doc, n]);
  useEffect(() => {
    if (active) btn.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [active]);
  return (
    <button ref={btn} type="button" onClick={onPick} aria-label={`Ir para a página ${n}`} aria-current={active ? "page" : undefined} className={cn("shrink-0 rounded-md p-1 transition-colors motion-reduce:transition-none", active ? "bg-brand" : "hover:bg-white/15")}>
      <canvas ref={ref} className="block bg-white" />
      <span className={cn("mt-1 block text-center text-[12px] font-semibold tabular", active ? "text-white" : "text-white/70")}>{n}</span>
    </button>
  );
}

/** Leitor de PDF em tela cheia: uma página por vez, zoom para focar, miniaturas para pular de página. */
export function PdfReader({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(0); // índice em ZOOMS; 0 = página inteira na tela
  const [thumbs, setThumbs] = useState(true);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [drawn, setDrawn] = useState(""); // chave da última página desenhada

  const box = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  useModalFocus(box, closeBtn, onClose);

  const total = doc?.numPages ?? 0;
  const go = (n: number) => setPage((p) => Math.min(Math.max(1, n || p), total || 1));

  useEffect(() => {
    let loaded: PDFDocumentProxy | null = null;
    let alive = true;
    openPdf(src)
      .then((d) => (alive ? setDoc((loaded = d)) : d.destroy()))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
      loaded?.destroy();
    };
  }, [src]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || !canvas.current || !size.w) return;
    const signal = { cancelled: false };
    const key = `${page}-${zoom}-${size.w}x${size.h}`;
    const narrow = size.w < 640;
    // página inteira visível; no celular, ocupa a largura (a altura rola)
    const fit = (w: number, h: number) => (narrow ? (size.w - 16) / w : Math.min((size.w - 48) / w, (size.h - 48) / h)) * ZOOMS[zoom];
    draw(doc, page, canvas.current, fit, signal)
      .catch(() => {})
      .finally(() => !signal.cancelled && setDrawn(key));
    return () => void (signal.cancelled = true);
  }, [doc, page, zoom, size]);

  // roda do mouse = zoom (listener nativo: o onWheel do React é passivo e não deixa cancelar a rolagem)
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.timeStamp - last < 90) return; // um degrau por "clique" da roda, mesmo em touchpad
      last = e.timeStamp;
      setZoom((z) => Math.min(Math.max(z + (e.deltaY < 0 ? 1 : -1), 0), ZOOMS.length - 1));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // com zoom, arrastar a página move a área visível
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (zoom === 0 || e.pointerType !== "mouse" || !stage.current) return;
    drag.current = { x: e.clientX, y: e.clientY, left: stage.current.scrollLeft, top: stage.current.scrollTop };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !stage.current) return;
    stage.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    stage.current.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const onUp = () => void (drag.current = null);

  useEffect(() => {
    stage.current?.scrollTo({ top: 0 }); // no Chrome novo, scrollTo devolve uma Promise: não pode ser o retorno do efeito
  }, [page]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(page + 1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(page - 1);
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 1, ZOOMS.length - 1));
      else if (e.key === "-") setZoom((z) => Math.max(z - 1, 0));
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const tool = "flex size-10 coarse:size-11 shrink-0 items-center justify-center rounded-lg text-white/85 hover:bg-white/15 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent";
  const side = "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/70 disabled:hidden md:flex";

  return (
    <div ref={box} role="dialog" aria-modal="true" aria-label={`Leitor: ${title}`} className="fixed inset-0 z-[80] flex flex-col bg-[#0a1226] text-white [animation:facta-pop_.2s_ease-out] motion-reduce:[animation:none]">
      {/* barra superior */}
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 md:px-5">
        <p className="min-w-0 flex-1 truncate text-[14px] font-bold md:text-[16px]">{title}</p>
        <div className="flex items-center gap-1">
          <button type="button" className={tool} onClick={() => setZoom((z) => Math.max(z - 1, 0))} disabled={zoom === 0} aria-label="Diminuir zoom"><ZoomOut className="size-5" /></button>
          <span className="hidden w-12 text-center text-[14px] font-semibold tabular sm:block" aria-live="polite">{Math.round(ZOOMS[zoom] * 100)}%</span>
          <button type="button" className={tool} onClick={() => setZoom((z) => Math.min(z + 1, ZOOMS.length - 1))} disabled={zoom === ZOOMS.length - 1} aria-label="Aumentar zoom"><ZoomIn className="size-5" /></button>
          <button type="button" className={tool} onClick={() => setZoom(0)} disabled={zoom === 0} aria-label="Ver página inteira"><Maximize className="size-5" /></button>
          <span aria-hidden className="mx-1 h-6 w-px bg-white/15" />
          <a href={src} download className={tool} aria-label="Baixar PDF"><Download className="size-5" /></a>
          <button ref={closeBtn} type="button" className={tool} onClick={onClose} aria-label="Fechar leitor"><X className="size-5" /></button>
        </div>
      </div>

      {/* página */}
      <div className="relative min-h-0 flex-1">
        <button type="button" className={cn(side, "left-4")} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft className="size-6" /></button>
        <button type="button" className={cn(side, "right-4")} onClick={() => go(page + 1)} disabled={page >= total} aria-label="Próxima página"><ChevronRight className="size-6" /></button>
        <div ref={stage} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} className={cn("h-full overflow-auto", zoom > 0 && "cursor-grab active:cursor-grabbing")}>
          <div className="flex min-h-full min-w-full w-max items-center justify-center p-2 md:p-6">
            {error ? (
              <p className="max-w-[360px] text-center text-[16px] text-white/80">Não foi possível abrir este arquivo. Ele pode ainda não estar disponível no portal.</p>
            ) : (
              <canvas
                ref={canvas}
                onDoubleClick={() => setZoom((z) => (z === 0 ? 3 : 0))}
                title="Role o mouse ou dê dois cliques para aproximar"
                className={cn("block bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]", !doc && "hidden", zoom === 0 && "cursor-zoom-in")}
              />
            )}
          </div>
        </div>
        {!error && (drawn !== `${page}-${zoom}-${size.w}x${size.h}` || !doc) && (
          <LoaderCircle aria-label="Carregando" className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-white/70 motion-reduce:animate-none" />
        )}
      </div>

      {/* navegação inferior */}
      <div className="relative border-t border-white/10">
        <button type="button" onClick={() => setThumbs((t) => !t)} aria-expanded={thumbs} aria-label={thumbs ? "Ocultar páginas" : "Mostrar páginas"} title={thumbs ? "Ocultar páginas" : "Mostrar páginas"} className="absolute -top-5 left-1/2 z-10 flex size-10 coarse:size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#16203a] text-white/85 shadow-lg hover:bg-[#223056] hover:text-white">
          {thumbs ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
        </button>
        {thumbs && doc && (
          <div className="flex gap-2 overflow-x-auto px-3 pt-6 [scrollbar-width:thin] md:justify-center md:px-5">
            {Array.from({ length: total }, (_, i) => (
              <Thumb key={i} doc={doc} n={i + 1} active={page === i + 1} onPick={() => go(i + 1)} />
            ))}
          </div>
        )}
        <div className={cn("flex items-center justify-center gap-3 px-3 py-2.5", !thumbs && "pt-7")}>
          <button type="button" className={tool} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="Página anterior"><ChevronLeft className="size-5" /></button>
          <label className="flex items-center gap-2 text-[14px] text-white/80">
            Página
            <input
              key={page}
              type="number"
              min={1}
              max={total || 1}
              defaultValue={page}
              onKeyDown={(e) => e.key === "Enter" && go(Number(e.currentTarget.value))}
              onBlur={(e) => go(Number(e.currentTarget.value))}
              className="h-9 w-14 rounded-lg border border-white/20 bg-white/10 text-center font-semibold text-white tabular outline-none focus:border-white/60"
            />
            de <span className="tabular">{total || "…"}</span>
          </label>
          <button type="button" className={tool} onClick={() => go(page + 1)} disabled={page >= total} aria-label="Próxima página"><ChevronRight className="size-5" /></button>
        </div>
      </div>
    </div>
  );
}
