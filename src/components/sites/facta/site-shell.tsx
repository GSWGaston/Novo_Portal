import Link from "next/link";
import { Logo } from "./logo";
import { TopNav } from "./top-nav";

type Props = {
  children: React.ReactNode;
  /** Portal pages show the menu bar and the user name; the home shows the avatar. */
  menu?: boolean;
  footer?: string;
};

export function SiteShell({ children, menu = false, footer }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f7f6]">
      <header className="relative">
        <div className="flex h-[60px] items-center bg-gradient-to-r from-[#0178bc] to-[#00bdda] pl-3 pr-5 md:pl-[49px] md:pr-[65px]">
          <Link href="/" className="flex w-[230px] justify-center" aria-label="Facta">
            <Logo />
          </Link>
          <div className="ml-auto flex items-center gap-[30px] text-white">
            {menu && <i className="fa fa-search text-[14px]" />}
            <span className="relative">
              <i className="fa fa-bell text-[20px]" />
              <span className="absolute -right-2 -top-3 rounded-[3px] bg-[#ff4961] px-[5px] py-px text-[9px] font-semibold leading-[11px]">
                9+
              </span>
            </span>
            {menu ? (
              <span className="hidden text-[20px] uppercase md:block">Usuário Demo</span>
            ) : (
              <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/25">
                <i className="fa fa-user text-[16px]" />
              </span>
            )}
          </div>
        </div>
        <div className="min-h-[102px] bg-[#383f4c] px-3 pb-4 md:px-[49px] md:pb-0">
          {menu && (
            <div className="min-h-[66px] pl-[8px]">
              <TopNav />
            </div>
          )}
        </div>
      </header>
      <main className="relative z-10 mt-4 flex-1 px-3 md:-mt-9 md:px-[49px]">{children}</main>
      <footer className="mx-3 mb-3 mt-[30px] rounded-[4px] bg-white px-3 py-[18px] text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.1)] md:mx-[49px]">
        {footer ?? "© 2026 Facta Empréstimos. Todos os direitos reservados."}
      </footer>
    </div>
  );
}

export function PageTitle({ title, trail }: { title: string; trail: string[] }) {
  return (
    <div className="flex min-h-[80px] items-center justify-between rounded-[4px] bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
      <h1 className="text-[24px] font-normal leading-tight text-[#4c5961]">{title}</h1>
      <ol className="hidden items-center gap-2 text-[11px] text-[#4c5961] md:flex">
        {trail.map((t, i) => (
          <li key={t} className="flex items-center gap-2">
            {i === 0 && <i className="fa fa-dashboard" />}
            {i > 0 && <span className="text-[#aab]">›</span>}
            {t}
          </li>
        ))}
      </ol>
    </div>
  );
}
