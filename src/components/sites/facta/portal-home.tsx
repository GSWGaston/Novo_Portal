"use client";

import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight, ArrowUpRight, BookOpenText, Lock, Vote,
  Droplet,
  Headset,
  Megaphone,
  Settings,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Brand, FactaLogo } from "./brand";
import { announcements, currentUser, portalApps, type Announcement, type PortalApp } from "./data";
import { PdfReader } from "./pdf-reader";

const icons = { calendar: CalendarDays, cogs: Settings, headset: Headset, users: Users, trend: TrendingUp, bars: BarChart3 };

const tones: Record<PortalApp["tone"], { tile: string; glow: string }> = {
  red: { tile: "facta-tile-red", glow: "facta-glow-red" },
  blue: { tile: "facta-tile-blue", glow: "facta-glow-blue" },
  green: { tile: "facta-tile-green", glow: "facta-glow-green" },
  purple: { tile: "facta-tile-purple", glow: "facta-glow-purple" },
  orange: { tile: "facta-tile-orange", glow: "facta-glow-orange" },
  indigo: { tile: "facta-tile-indigo", glow: "facta-glow-indigo" },
  cyan: { tile: "facta-tile-cyan", glow: "facta-glow-cyan" },
  violet: { tile: "facta-tile-violet", glow: "facta-glow-violet" },
};

const ACK_KEY = "facta-avisos-lidos";

function readAck(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(ACK_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function PortalHome() {
  const mode = useSearchParams().get("aviso"); // "popup" | "banner" forçam a visualização
  const [ack, setAck] = useState<string[] | null>(null);

  useEffect(() => {
    // sessionStorage só existe no cliente; ler depois da montagem evita divergência de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAck(readAck());
  }, []);

  const urgent = announcements.filter((a) => a.level === "urgent");
  const popup =
    mode === "banner" || ack === null ? undefined : urgent.find((a) => mode === "popup" || !ack.includes(a.id));
  // Comunicados triviais ficam na página; os urgentes passam para a página depois de lidos.
  const banners = announcements.filter(
    (a) => a.id !== popup?.id && (a.level === "info" || mode === "banner" || (ack?.includes(a.id) ?? false)),
  );

  const dismiss = (id: string) => {
    const next = [...new Set([...(ack ?? []), id])];
    try {
      sessionStorage.setItem(ACK_KEY, JSON.stringify(next));
    } catch {}
    setAck(next);
  };

  return (
    <>
      <section className="relative pb-3 pt-4 md:pt-5">
        <FactaLogo variant="f" className="pointer-events-none absolute right-6 top-4 hidden h-[240px] text-brand/20 md:block" />
        <h1 className="text-[32px] font-extrabold leading-tight tracking-tight md:text-[38px]">
          Olá, <span className="text-brand">{currentUser.first}!</span> <span aria-hidden>👋</span>
        </h1>
        {banners.length > 0 ? (
          <p className="mt-1 border-l-4 border-brand pl-3 text-[18px] text-ink">Selecione um sistema para continuar.</p>
        ) : (
          <>
            <p className="mt-1 text-[20px]">Bem-vindo(a) ao portal interno da Facta.</p>
            <p className="mt-4 max-w-[480px] border-l-4 border-brand pl-3 text-[16px] leading-snug text-ink-soft">
              Acesse abaixo os sistemas da empresa e gerencie suas atividades de forma rápida e segura.
            </p>
          </>
        )}
      </section>

      {banners.map((a) => (
        <InlineNotice key={a.id} a={a} />
      ))}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {portalApps.map((app) => (
          <AppCard key={app.title} app={app} />
        ))}
      </div>

      {popup && <UrgentDialog a={popup} onClose={() => dismiss(popup.id)} />}
    </>
  );
}

function AppCard({ app }: { app: PortalApp }) {
  const Icon = icons[app.icon];
  const t = tones[app.tone];
  const [reading, setReading] = useState(false);
  const soon = app.href === "#";
  const external = app.href.startsWith("http");
  const End = app.read ? BookOpenText : external ? ArrowUpRight : ChevronRight;
  const base = "group relative flex min-h-[92px] items-center gap-4 overflow-hidden rounded-3xl border border-paper bg-paper/85 p-3.5 shadow-card";
  const body = (
    <>
      <span aria-hidden className={cn("absolute inset-y-0 right-0 w-1/2 opacity-90 [clip-path:ellipse(80%_130%_at_100%_50%)]", t.glow)} />
      <span className={cn("relative flex size-[60px] shrink-0 items-center justify-center rounded-2xl text-white shadow-lg", t.tile, soon && "opacity-70")}>
        <Icon className="size-8" strokeWidth={1.8} />
      </span>
      <span className="relative h-14 w-px shrink-0 bg-line" />
      <span className="relative min-w-0 flex-1">
        <span className="block text-[20px] font-extrabold leading-tight tracking-tight">{app.title}</span>
        <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{app.description}</span>
        {app.blocked === "permissao" && (
          <span className="mt-1 flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-danger-ink">
            <Lock aria-hidden className="size-3.5 shrink-0" /> Você não tem permissão de acesso.
          </span>
        )}
        {app.blocked === "votacao" && (
          <span className="mt-1 flex items-center gap-1 whitespace-nowrap text-[12px] font-semibold text-warn-ink">
            <Vote aria-hidden className="size-3.5 shrink-0" /> Votação encerrada.
          </span>
        )}
      </span>
      {app.blocked ? null : soon ? (
        <span className="relative shrink-0 rounded-md bg-surface px-2 py-1 text-[12px] font-bold text-ink-soft ring-1 ring-line">Em breve</span>
      ) : (
        <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-paper text-ink shadow transition group-hover:bg-brand group-hover:text-white">
          <End className="size-5" />
        </span>
      )}
    </>
  );
  if (soon) {
    return (
      <div aria-disabled="true" className={cn(base, "cursor-default")}>
        {body}
      </div>
    );
  }
  const live = cn(base, "w-full text-left transition-shadow hover:shadow-[0_18px_40px_-14px_rgba(11,95,224,0.35)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-brand");
  if (app.read) {
    return (
      <>
        <button type="button" onClick={() => setReading(true)} className={live}>{body}</button>
        {reading && <PdfReader src={app.read} title={app.title} onClose={() => setReading(false)} />}
      </>
    );
  }
  if (external) {
    return (
      <a href={app.href} target="_blank" rel="noopener noreferrer" className={live}>
        {body}
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    );
  }
  return (
    <Link href={app.href} className={live}>
      {body}
    </Link>
  );
}

function InlineNotice({ a }: { a: Announcement }) {
  const urgent = a.level === "urgent";
  return (
    <section
      className={cn(
        "relative mb-3 flex flex-col overflow-hidden rounded-3xl border bg-paper shadow-card md:flex-row md:items-center",
        urgent ? "border-[#f9d4d4] dark:border-danger/30" : "border-[#cfe0fb] dark:border-brand/30",
      )}
    >
      <span className={cn("flex items-center justify-center px-8 py-3 text-white md:self-stretch md:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)] md:pr-14", urgent ? "bg-gradient-to-br from-[#f05252] to-[#c81e1e]" : "bg-gradient-to-br from-[#2b8cff] to-brand")}>
        <Megaphone className="size-10" strokeWidth={1.6} />
      </span>
      <div className="flex-1 px-5 py-2.5 md:px-4">
        <span className={cn("rounded-full px-3 py-0.5 text-[12px] font-extrabold uppercase tracking-wide", urgent ? "bg-danger-soft text-danger-ink" : "bg-brand-soft text-brand")}>{a.tag}</span>
        <h2 className="mt-1 flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
          {a.title}
          {urgent && <Droplet className="size-5 fill-danger text-danger" />}
        </h2>
        <p className="text-[14px] text-ink-soft">{a.text}</p>
      </div>
      {a.facts?.[0] && (
        <div className={cn("m-3 rounded-2xl px-5 py-2.5 md:mr-8", urgent ? "bg-danger-soft" : "bg-brand-soft")}>
          <p className="text-[12px] font-semibold">{a.facts[0].label}:</p>
          <p className={cn("text-[28px] font-extrabold leading-none", urgent ? "text-danger" : "text-brand")}>{a.facts[0].value}</p>
        </div>
      )}
    </section>
  );
}

function UrgentDialog({ a, onClose }: { a: Announcement; onClose: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      // mantém o Tab dentro do popup: do último volta ao primeiro e vice-versa
      const items = box.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])");
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#041b45]/55 p-4 backdrop-blur-[3px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="aviso-titulo" className="relative max-h-[94vh] w-full max-w-[680px] overflow-y-auto rounded-[28px] bg-paper p-6 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] [animation:facta-pop_.25s_ease-out] motion-reduce:[animation:none] md:p-8">
        <div className="flex items-center gap-3">
          <Brand tone="color" className="text-[26px]" />
          <span className="h-7 w-px bg-line" />
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-danger-ink px-3 py-1.5 text-[14px] font-extrabold uppercase text-white">
            <AlertTriangle className="size-4" /> {a.tag}
          </span>
          <button type="button" onClick={onClose} aria-label="Fechar comunicado" className="ml-auto flex size-10 items-center justify-center rounded-full bg-surface hover:bg-brand-soft">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-6 flex items-start gap-4">
          <div className="flex-1">
            <h2 id="aviso-titulo" className="flex items-end gap-2 text-[44px] font-extrabold leading-[1.02] tracking-tight">
              {a.title}
              <Droplet className="mb-1 size-9 shrink-0 fill-danger text-danger" />
            </h2>
            <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed">{a.text}</p>
          </div>
        </div>

        {a.facts && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {a.facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-danger-soft/70 px-4 py-3">
                <p className="text-[12px] font-semibold text-ink-soft">{f.label}:</p>
                <p className="text-[20px] font-extrabold leading-tight">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {a.highlight && (
          <div className="mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-danger-soft to-paper px-5 py-4">
            <Megaphone className="size-9 shrink-0 text-danger" strokeWidth={1.7} />
            <p className="text-[18px] font-extrabold leading-snug text-danger-ink">{a.highlight}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button ref={btn} type="button" onClick={onClose} className="inline-flex h-14 min-w-[260px] items-center justify-center gap-2 rounded-full bg-brand text-[18px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(11,95,224,0.7)] hover:bg-brand-dark">
            <Check className="size-5" /> Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
