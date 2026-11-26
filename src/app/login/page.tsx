import { Brand, FactaLogo } from "@/components/sites/facta/brand";
import { LoginForm } from "@/components/sites/facta/login-form";

export const metadata = { title: "Entrar — Portal Interno da Facta" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(105deg,#0a66f5_0%,#2a8cff_20%,#bcd9ff_46%,#e9f2ff_70%,#f1f7ff_100%)] dark:bg-[linear-gradient(105deg,#0a4fc4_0%,#0d3a8a_22%,#0f1f42_50%,#0d1526_75%,#0b1222_100%)]">
      <FactaLogo variant="f" className="pointer-events-none absolute -right-16 top-16 hidden h-[520px] text-white/40 lg:block" />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 items-center gap-10 px-4 py-10 md:px-10">
        <section className="w-full max-w-[600px] rounded-[32px] bg-paper p-8 shadow-[0_30px_80px_-20px_rgba(5,42,102,0.45)] md:p-12">
          <Brand tone="color" className="text-[44px]" />
          <h1 className="mt-8 text-[34px] font-extrabold leading-[1.15] tracking-tight md:text-[40px]">
            Bem-vindo(a) ao
            <br />
            Portal Interno da Facta
          </h1>
          <p className="mt-3 max-w-[460px] text-[16px] leading-relaxed text-ink-soft">
            Acesse sua conta para utilizar os sistemas e recursos internos da empresa.
          </p>
          <LoginForm />
        </section>

        <aside className="relative -mb-10 hidden flex-1 items-end justify-center self-stretch lg:flex">
          <div className="absolute left-0 top-1/2 max-w-[260px] -translate-y-[65%] border-l-4 border-brand pl-4">
            <p className="text-[26px] font-extrabold leading-tight">Pessoas, sistemas e resultados.</p>
            <p className="mt-3 text-[18px] text-ink-soft">Tudo em um só lugar.</p>
          </div>
          {/* personagem da Facta (PNG com fundo transparente) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sites/facta/personagem.png" alt="" width={448} height={556} className="ml-auto block h-[min(680px,80vh)] w-auto drop-shadow-[0_30px_40px_rgba(5,42,102,0.3)]" />
        </aside>
      </div>

      <footer className="relative mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-brand/15 px-4 py-4 text-[14px] text-ink-soft md:px-10">
        <span className="flex items-center gap-3 font-semibold text-white">
          <Brand className="text-[20px]" />
          <span className="h-5 w-px bg-paper/50" /> Portal Interno da Facta
        </span>
        <span>© 2026 Facta Empréstimos. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
