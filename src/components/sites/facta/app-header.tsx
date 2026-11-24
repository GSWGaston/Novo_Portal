"use client";

import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { currentUser, navMenus, notifications } from "./data";

type Props = {
  /** "portal" é o cabeçalho alto da home; "app" traz o menu de navegação. */
  variant: "portal" | "app";
};

const panel =
  "absolute z-50 mt-2 rounded-2xl border border-line bg-white p-1.5 text-ink shadow-[0_16px_40px_-12px_rgba(5,42,102,0.35)]";

export function AppHeader({ variant }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLElement>(null);
  const app = variant === "app";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const toggle = (key: string) => setOpen((o) => (o === key ? null : key));
  const iconBtn = "relative flex h-10 w-10 coarse:h-11 coarse:w-11 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10";

  return (
    <header
      ref={ref}
      className={cn(
        "relative z-40 bg-gradient-to-r from-navy via-[#06408f] to-[#0a63d6] text-white",
        app ? "h-[68px]" : "h-[76px]",
      )}
    >
      <div className={cn("mx-auto flex h-full max-w-[1720px] items-center gap-4 px-4 md:px-8")}>
        <Link href="/" aria-label="Facta — início" className={cn("shrink-0", app ? "text-[30px]" : "text-[34px]")}>
          <Brand />
        </Link>

        {app && (
          <nav className="hidden flex-1 items-center gap-0.5 overflow-visible lg:flex" aria-label="Principal">
            {navMenus.map((m) => {
              const active = m.href === pathname || m.items?.some((i) => i.href === pathname);
              const cls = cn(
                "flex h-10 coarse:h-11 items-center gap-1 whitespace-nowrap rounded-xl px-3.5 text-[14px] font-semibold text-white/80 transition hover:bg-white/10 hover:text-white",
                active && "bg-brand text-white shadow-sm hover:bg-brand",
              );
              return (
                <div key={m.label} className="relative">
                  {m.href ? (
                    <Link href={m.href} className={cls}>
                      {m.label}
                    </Link>
                  ) : (
                    <button type="button" className={cls} aria-expanded={open === m.label} onClick={() => toggle(m.label)}>
                      {m.label}
                      <ChevronDown className="size-3.5 opacity-70" />
                    </button>
                  )}
                  {open === m.label && m.items && m.items.length > 0 && (
                    <div className={cn(panel, "left-0 min-w-[210px]")}>
                      {m.items.map((i) => (
                        <Link
                          key={i.label}
                          href={i.href}
                          onClick={() => setOpen(null)}
                          className="block rounded-xl px-3 py-2 text-[14px] font-medium hover:bg-brand-soft"
                        >
                          {i.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1">
          <div className="relative">
            <button type="button" className={iconBtn} aria-label="Buscar chamados" aria-expanded={open === "search"} onClick={() => toggle("search")}>
              <Search className="size-5" />
            </button>
            {open === "search" && (
              <form
                className={cn(panel, "right-0 w-[min(320px,86vw)] p-2")}
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(null);
                  router.push(`/solicitacoes/setores?q=${encodeURIComponent(query)}`);
                }}
              >
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar chamado, título, solicitante ou responsável"
                  className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[14px] outline-none focus:border-brand"
                />
              </form>
            )}
          </div>

          <div className="relative">
            <button type="button" className={iconBtn} aria-label="Notificações" aria-expanded={open === "bell"} onClick={() => toggle("bell")}>
              <Bell className="size-5" />
              <span className="absolute right-0.5 top-0.5 rounded-full bg-danger px-1.5 text-[10px] font-bold leading-[16px]">9+</span>
            </button>
            {open === "bell" && (
              <div className={cn(panel, "right-0 w-[min(340px,90vw)]")}>
                <p className="px-3 pb-1 pt-2 text-[12px] font-bold uppercase tracking-wider text-ink-soft">Atualizações</p>
                {notifications.map((n) => (
                  <div key={n.id} className="rounded-xl px-3 py-2 hover:bg-brand-soft">
                    <p className="text-[14px] font-semibold">{n.title}</p>
                    <p className="text-[12px] text-ink-soft">{n.when}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative ml-1">
            <button
              type="button"
              aria-expanded={open === "user"}
              onClick={() => toggle("user")}
              className="flex h-10 coarse:h-11 items-center gap-2 rounded-full pl-1 pr-3 transition hover:bg-white/10"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-brand text-[12px] font-bold ring-2 ring-white/60">
                {currentUser.initials}
              </span>
              <span className="hidden whitespace-nowrap text-[12px] font-bold uppercase tracking-wide 2xl:block">{currentUser.name}</span>
              <ChevronDown className="size-4 opacity-80" />
            </button>
            {open === "user" && (
              <div className={cn(panel, "right-0 w-[200px]")}>
                <Link href="/login" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-danger-ink hover:bg-danger-soft">
                  <LogOut className="size-4" /> Sair
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {app && (
        <nav className="absolute inset-x-0 top-full flex gap-1 overflow-x-auto bg-navy px-4 py-2 lg:hidden" aria-label="Principal (mobile)">
          {navMenus.flatMap((m) => (m.href ? [{ label: m.label, href: m.href }] : (m.items ?? []))).map((i) => (
            <Link key={i.label} href={i.href} className="flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 text-[14px] font-semibold text-white/85 hover:bg-white/10">
              {i.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
