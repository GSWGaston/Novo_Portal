"use client";

import { Download, FileText, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";

const groups: { title: string; items: string[] }[] = [
  {
    title: "Segurança cibernética",
    items: ["Política de Segurança Cibernética Facta", "Política de Segurança Cibernética Financeira", "Política de Segurança Cibernética Seguradora"],
  },
  {
    title: "Acessos e senhas",
    items: [
      "Política Geral de Revisão de Acesso",
      "Política de Revisão de Contas Privilegiadas e Administrativas",
      "Política de Criação de Acessos",
      "Política de Revogação de Acessos",
      "Política de Gestão de Contas Genéricas",
      "Política de Gestão de Acessos Facta Financeira",
      "Política de Criação de Senha",
      "Política de Criação de Senha Facta Financeira",
    ],
  },
  {
    title: "Mudanças e backup",
    items: ["Política de Gestão de Mudanças Facta", "Política de Gestão de Mudanças Facta Financeira", "Política de Backup Facta", "Política de Backup Facta Financeira"],
  },
  {
    title: "Incidentes e continuidade",
    items: [
      "Política de Gestão de Resposta a Incidentes Críticos",
      "Plano de Resposta a Incidentes Críticos",
      "Política de Gestão de Vulnerabilidades",
      "Política PCN - Plano de Continuidade de Negócios",
    ],
  },
  { title: "Infraestrutura e conduta", items: ["Política de Uso de Firewall", "Código de Ética e Conduta"] },
];

export function PoliticasView() {
  const [q, setQ] = useState("");
  const [toast, setToast] = useState("");

  const term = q.trim().toLowerCase();
  const shown = groups
    .map((g) => ({ ...g, items: g.items.filter((n) => !term || n.toLowerCase().includes(term)) }))
    .filter((g) => g.items.length);
  const total = shown.reduce((s, g) => s + g.items.length, 0);

  const download = (name: string) => {
    setToast(`Demonstração: o PDF de "${name}" ainda não está conectado.`);
    window.setTimeout(() => setToast(""), 3200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Diversos" }, { label: "Políticas SEGINFO" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <ShieldCheck className="size-8 text-brand" strokeWidth={1.8} /> Políticas SEGINFO
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Políticas de segurança da informação. Escolha um documento para baixar em PDF.</p>
        </div>
        <label className="flex h-12 w-full max-w-[420px] items-center gap-3 rounded-xl border border-line bg-white px-4 shadow-sm focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
          <Search className="size-5 shrink-0 text-ink-soft" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar política" aria-label="Buscar política" className="w-full bg-transparent text-[16px] outline-none placeholder:text-ink-soft" />
        </label>
      </div>

      <p aria-live="polite" className="sr-only">{total} documentos encontrados</p>

      {shown.length === 0 && (
        <div className="rounded-3xl border border-dashed border-line bg-white/70 p-10 text-center">
          <FileText className="mx-auto size-8 text-ink-mute" />
          <p className="mt-2 text-[16px] font-bold">Nenhuma política encontrada</p>
          <p className="text-[14px] text-ink-soft">Tente outro termo de busca.</p>
        </div>
      )}

      {shown.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`} className="rounded-3xl border border-white bg-white/90 p-6 shadow-card">
          <h2 id={`g-${g.title}`} className="flex items-center gap-2.5 text-[20px] font-bold">
            {g.title}
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{g.items.length}</span>
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {g.items.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => download(name)}
                  aria-label={`Baixar PDF: ${name}`}
                  className="group flex h-full w-full flex-col gap-3 rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition-colors hover:border-brand/40 hover:bg-brand-soft/40 motion-reduce:transition-none"
                >
                  <span className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                      <FileText className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1 text-[16px] font-bold leading-snug">{name}</span>
                  </span>
                  <span className="mt-auto flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-soft group-hover:text-brand">
                    <Download className="size-4" /> Baixar PDF
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
