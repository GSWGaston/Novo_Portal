"use client";

import { Bell, ChevronDown, ChevronRight, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { currentUser, navMenus, notifications, type MenuItem } from "./data";

type Props = {
  /** "portal" é o cabeçalho alto da home; "app" traz o menu de navegação. */
  variant: "portal" | "app";
};

const hasPath = (m: MenuItem, path: string): boolean => m.href === path || !!m.items?.some((i) => hasPath(i, path));
/** Item sem tela ainda: aparece desativado, com selo "Em breve". */
const isSoon = (href?: string) => !href || href === "#";

function MenuLeaf({ item, onGo, onEnter, mobile }: { item: MenuItem; onGo?: () => void; onEnter?: () => void; mobile?: boolean }) {
  if (isSoon(item.href)) {
    return (
      <span
        role={mobile ? undefined : "menuitem"}
        aria-disabled="true"
        onMouseEnter={onEnter}
        className={cn(mobile ? "flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-[14px] text-white/60" : "flex min-h-10 coarse:min-h-11 w-full cursor-default items-center justify-between gap-3 whitespace-nowrap rounded-xl px-3 py-2 text-left text-[14px] font-medium text-ink-soft")}
      >
        {item.label}
        <span className={cn("shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-bold", mobile ? "bg-white/10 text-white/80" : "bg-surface text-ink-soft ring-1 ring-line")}>Em breve</span>
      </span>
    );
  }
  return (
    <Link
      href={item.href ?? "#"}
      role={mobile ? undefined : "menuitem"}
      onMouseEnter={onEnter}
      onClick={onGo}
      className={mobile ? "flex min-h-11 items-center rounded-lg px-3 text-[14px] text-white/90 hover:bg-white/10" : row}
    >
      {item.label}
    </Link>
  );
}

const row = "flex min-h-10 whitespace-nowrap coarse:min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[14px] font-medium hover:bg-brand-soft";

/** Submenu curto: centralizado na linha de origem, sem passar do topo/base do menu principal. */
function CenteredFlyout({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const row = el?.parentElement;
    const menu = row?.parentElement;
    if (!el || !row || !menu) return;
    const r = row.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const h = el.offsetHeight;
    const top = Math.min(Math.max(r.top + r.height / 2 - h / 2, m.top), Math.max(m.top, m.bottom - h));
    el.style.top = `${top - r.top}px`;
  }, []);
  return (
    <div ref={ref} role="menu" className={cn(panel, "left-full mt-0 ml-[10px] w-max min-w-[200px]")}>
      {children}
    </div>
  );
}

const panel =
  "absolute z-50 mt-2 rounded-2xl border border-line bg-white p-1.5 text-ink shadow-[0_16px_40px_-12px_rgba(5,42,102,0.35)]";

export function AppHeader({ variant }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [sub, setSub] = useState<string | null>(null);
  const [mSub, setMSub] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLElement>(null);
  const leaveTimer = useRef<number | null>(null);
  const [hover] = useState({ pointer: "" });
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

  const toggle = (key: string) => {
    setSub(null);
    setOpen((o) => (o === key ? null : key));
  };
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
              const active = hasPath(m, pathname);
              const cls = cn(
                "flex h-10 coarse:h-11 items-center gap-1 whitespace-nowrap rounded-xl px-3.5 text-[14px] font-semibold text-white transition hover:bg-white/15",
                active && "bg-brand text-white shadow-sm hover:bg-brand",
              );
              return (
                <div
                  key={m.label}
                  className="relative"
                  onPointerEnter={(e) => {
                    if (e.pointerType !== "mouse") return;
                    hover.pointer = "mouse";
                    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
                    if (m.items?.length) {
                      if (open !== m.label) setSub(null);
                      setOpen(m.label);
                    } else if (open && open !== "search" && open !== "bell" && open !== "user") setOpen(null);
                  }}
                  onPointerLeave={(e) => {
                    if (e.pointerType !== "mouse") return;
                    leaveTimer.current = window.setTimeout(() => setOpen((o) => (o === m.label ? null : o)), 160);
                  }}
                >
                  {m.href ? (
                    <Link href={m.href} className={cls}>
                      {m.label}
                    </Link>
                  ) : (
                    <button type="button" className={cls} aria-expanded={open === m.label} onClick={() => (hover.pointer === "mouse" ? setOpen(m.label) : toggle(m.label))} onPointerDown={(e) => { hover.pointer = e.pointerType; }}>
                      {m.label}
                      <ChevronDown className="size-3.5 opacity-70" />
                    </button>
                  )}
                  {open === m.label && m.items && m.items.length > 0 && (
                    <div className={cn(panel, "left-0 w-max min-w-[230px]")} role="menu">
                      {m.items.map((i) =>
                        i.items ? (
                          <div key={i.label} className={cn(i.items.length <= 8 && "relative")} onMouseEnter={() => setSub(i.label)}>
                            <button type="button" role="menuitem" aria-haspopup="menu" aria-expanded={sub === i.label} onClick={() => setSub(sub === i.label ? null : i.label)} className={cn(row, sub === i.label && "bg-brand-soft")}>
                              {i.label}
                              <ChevronRight className="size-4 shrink-0 text-ink-soft" />
                            </button>
                            {sub === i.label && (() => {
                              const links = i.items.map((c) => (
                                <MenuLeaf key={c.label} item={c} onGo={() => setOpen(null)} />
                              ));
                              return i.items.length <= 8 ? (
                                <CenteredFlyout>{links}</CenteredFlyout>
                              ) : (
                                <div role="menu" className={cn(panel, "left-full top-0 mt-0 ml-1 max-h-[calc(100vh-110px)] w-max min-w-[240px] overflow-y-auto")}>
                                  {links}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <MenuLeaf key={i.label} item={i} onEnter={() => setSub(null)} onGo={() => setOpen(null)} />
                        ),
                      )}
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
              <span className="absolute right-0.5 top-0.5 rounded-full bg-danger-ink px-1.5 text-[12px] font-bold leading-[18px] text-white">9+</span>
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
        <nav className="absolute inset-x-0 top-full max-h-[70vh] overflow-y-auto bg-navy px-4 py-2 lg:hidden" aria-label="Principal (mobile)">
          <div className="flex gap-1 overflow-x-auto">
            {navMenus.map((m) =>
              m.href ? (
                <Link key={m.label} href={m.href} className="flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 text-[14px] font-semibold text-white/85 hover:bg-white/10">
                  {m.label}
                </Link>
              ) : (
                <button key={m.label} type="button" aria-expanded={mSub === m.label} onClick={() => setMSub(mSub === m.label ? null : m.label)} className={cn("flex min-h-11 items-center gap-1 whitespace-nowrap rounded-lg px-4 text-[14px] font-semibold text-white/85 hover:bg-white/10", mSub === m.label && "bg-white/10 text-white")}>
                  {m.label} <ChevronDown className="size-3.5 opacity-70" />
                </button>
              ),
            )}
          </div>
          {navMenus.filter((m) => m.items && m.label === mSub).map((m) => (
            <ul key={m.label} className="mt-2 space-y-0.5 border-t border-white/15 pt-2">
              {m.items?.map((i) => (
                <li key={i.label}>
                  {i.items ? (
                    <details className="group">
                      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-[14px] font-semibold text-white/90 hover:bg-white/10">
                        {i.label} <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <ul className="ml-3 border-l border-white/15 pl-2">
                        {i.items.map((c) => (
                          <li key={c.label}>
                            <MenuLeaf item={c} mobile />
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <MenuLeaf item={i} mobile />
                  )}
                </li>
              ))}
            </ul>
          ))}
        </nav>
      )}
    </header>
  );
}
