"use client";

import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const field =
  "flex h-14 items-center gap-3 rounded-xl border border-[#cfd9ea] bg-white px-4 text-ink-soft transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15";

export function LoginForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      noValidate
      className="mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (!user.trim() || !pass) {
          setError("Informe usuário e senha para continuar.");
          return;
        }
        // Sem backend: qualquer credencial preenchida entra (protótipo de design).
        router.push("/");
      }}
    >
      <label htmlFor="user" className="mb-2 block text-[15px] font-bold">
        Usuário
      </label>
      <div className={field}>
        <User className="size-5 shrink-0 text-ink" />
        <input
          id="user"
          autoComplete="username"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Digite seu usuário"
          className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-soft/80"
        />
      </div>

      <label htmlFor="pass" className="mb-2 mt-5 block text-[15px] font-bold">
        Senha
      </label>
      <div className={field}>
        <Lock className="size-5 shrink-0 text-ink" />
        <input
          id="pass"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Digite sua senha"
          className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-soft/80"
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Ocultar senha" : "Mostrar senha"} className="text-ink hover:text-brand">
          {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <p role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </p>
        <Link href="#" className="shrink-0 text-[14px] font-medium text-brand underline underline-offset-2">
          Esqueci minha senha
        </Link>
      </div>

      <button
        type="submit"
        className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand text-[18px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(11,95,224,0.7)] transition hover:bg-brand-dark"
      >
        Acessar <ArrowRight className="size-5" />
      </button>
    </form>
  );
}
