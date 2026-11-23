import { existsSync } from "node:fs";
import { join } from "node:path";
import { Brand } from "@/components/sites/facta/brand";
import { LoginForm } from "@/components/sites/facta/login-form";

export const metadata = { title: "Entrar — Portal Interno da Facta" };

// Coloque a ilustração da personagem em public/sites/facta/login-character.png para exibi-la aqui.
const hasCharacter = existsSync(join(process.cwd(), "public/sites/facta/login-character.png"));

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(105deg,#0a66f5_0%,#2a8cff_20%,#bcd9ff_46%,#e9f2ff_70%,#f1f7ff_100%)]">
      <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute -right-24 top-6 hidden h-[620px] w-[620px] text-white/45 lg:block">
        <path d="M120 40h250l-30 70H190l-14 60h120l-24 66H152l-34 130H40Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 items-center gap-10 px-4 py-10 md:px-10">
        <section className="w-full max-w-[600px] rounded-[32px] bg-white p-8 shadow-[0_30px_80px_-20px_rgba(5,42,102,0.45)] md:p-12">
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

        <aside className="relative hidden flex-1 items-center justify-center lg:flex">
          <div className="absolute left-0 top-1/2 max-w-[260px] -translate-y-[65%] border-l-4 border-brand pl-4">
            <p className="text-[26px] font-extrabold leading-tight">Pessoas, sistemas e resultados.</p>
            <p className="mt-3 text-[17px] text-ink-soft">Tudo em um só lugar.</p>
          </div>
          {hasCharacter && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/sites/facta/login-character.png" alt="" className="ml-auto h-[min(640px,80vh)] w-auto object-contain" />
          )}
        </aside>
      </div>

      <footer className="relative mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-between gap-2 border-t border-brand/15 px-4 py-4 text-[13px] text-ink-soft md:px-10">
        <span className="flex items-center gap-3">
          <Brand tone="color" className="text-[20px] opacity-80" />
          <span className="h-5 w-px bg-ink-soft/40" /> Portal Interno da Facta
        </span>
        <span>© 2026 Facta Empréstimos. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}
