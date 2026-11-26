import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import type { MenuItem } from "./data";

export function AppShell({
  variant,
  children,
  className,
  menus,
}: {
  variant: "portal" | "app";
  children: React.ReactNode;
  className?: string;
  menus?: MenuItem[];
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(ellipse_at_top_right,#dbe9ff_0%,#f3f7ff_45%,#f6f9ff_100%)] dark:bg-[radial-gradient(ellipse_at_top_right,#152a55_0%,#0f182c_45%,#0b1222_100%)]">
      <AppHeader variant={variant} menus={menus} />
      <main className={cn("mx-auto w-full max-w-[1720px] flex-1 px-4 pb-10 md:px-8", variant === "app" && "pt-16 lg:pt-6", className)}>
        {children}
      </main>
      <footer className="mx-auto flex w-full max-w-[1720px] items-center justify-between border-t border-line px-4 py-4 text-[12px] text-ink-soft md:px-8">
        <span>© 2018 Facta Empréstimos. Todos os direitos reservados.</span>
        <span>v2.4.0</span>
      </footer>
    </div>
  );
}
