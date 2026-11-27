"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ConveniosMedicos } from "./convenios-medicos-view";
import { ArrowUpRight, BadgeCheck, GraduationCap, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "./dashboard-view";

type Desconto = { pct: number; on: string };
type Convenio = {
  name: string;
  kind: string;
  /** Cor da marca, usada só na faixa e nas iniciais do card. */
  color: string;
  discounts: Desconto[];
  proof: string;
  /** Pedido de carta de encaminhamento pelo portal (IERGS). */
  viaPortal?: boolean;
  site?: { label: string; href: string };
};

// Conteúdo dos cartazes "Descontos de convênios parceiros" (programa Facta Forma) do portal original.
const ctps = "Apresente a CTPS assinada ou o contrato de trabalho também assinado.";
const contracheque = "Acesse o portal da universidade e anexe o contracheque ou o termo de vínculo.";
const groups: { title: string; icon: typeof GraduationCap; items: Convenio[] }[] = [
  {
    title: "Universidades",
    icon: GraduationCap,
    items: [
      {
        name: "FTEC Faculdades",
        kind: "Faculdade",
        color: "#1d3a8a",
        discounts: [
          { pct: 11, on: "na mensalidade dos contratos firmados (graduação presencial, pós-graduação e técnicos)" },
          { pct: 5, on: "exclusivamente na Ftec Academy" },
        ],
        proof: ctps,
        site: { label: "ibgen.com.br", href: "https://www.ibgen.com.br" },
      },
      {
        name: "QI Escolas e Faculdades",
        kind: "Escola e faculdade",
        color: "#d2161d",
        discounts: [{ pct: 10, on: "na mensalidade dos contratos firmados" }],
        proof: ctps,
        site: { label: "qi.edu.br", href: "https://www.qi.edu.br" },
      },
      {
        name: "IERGS | Uniasselvi",
        kind: "Faculdade",
        color: "#111827",
        discounts: [{ pct: 10, on: "na mensalidade dos contratos firmados (graduação, pós-graduação presencial e EAD)" }],
        proof: "Peça ao RH uma carta de encaminhamento pelo portal, no assunto “Convênio Universidades GP”.",
        viaPortal: true,
        site: { label: "iergs.com.br", href: "https://www.iergs.com.br" },
      },
      {
        name: "FADERGS",
        kind: "Centro universitário",
        color: "#b3121b",
        discounts: [{ pct: 10, on: "a partir da segunda mensalidade" }],
        proof: contracheque,
      },
      {
        name: "UniRitter",
        kind: "Centro universitário",
        color: "#c8102e",
        discounts: [{ pct: 10, on: "a partir da segunda mensalidade" }],
        proof: contracheque,
      },
    ],
  },
];

const initials = (name: string) => name.replace(/[^A-Za-zÀ-ú ]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

function Card({ c }: { c: Convenio }) {
  const [main, ...rest] = c.discounts;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-paper bg-paper shadow-card">
      <div className="h-1.5" style={{ background: c.color }} />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-[16px] font-extrabold text-white" style={{ background: c.color }}>
            {initials(c.name)}
          </span>
          <div className="min-w-0">
            <h3 className="text-[18px] font-bold leading-tight">{c.name}</h3>
            <p className="text-[14px] text-ink-soft">{c.kind}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-brand-soft/60 p-4">
          <p className="flex items-baseline gap-2">
            <span className="tabular text-[40px] font-extrabold leading-none tracking-tight text-navy">{main.pct}%</span>
            <span className="text-[14px] font-bold text-navy">de desconto</span>
          </p>
          <p className="mt-1.5 text-[14px] text-ink-soft">{main.on}</p>
          {rest.map((d) => (
            <p key={d.on} className="mt-3 border-t border-brand/15 pt-3 text-[14px] text-ink-soft">
              <span className="tabular font-extrabold text-navy">{d.pct}%</span> {d.on}
            </p>
          ))}
        </div>

        <div className="mt-4 flex gap-2.5 text-[14px]">
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-ok" />
          <p>
            <span className="font-semibold">Como comprovar o vínculo: </span>
            <span className="text-ink-soft">{c.proof}</span>
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {c.viaPortal && (
            <Link href="/solicitacoes/nova" className="flex h-11 items-center rounded-xl bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-dark">
              Pedir carta ao RH
            </Link>
          )}
          {c.site && (
            <a href={c.site.href} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center gap-1.5 rounded-xl border border-line px-4 text-[14px] font-bold hover:border-brand hover:text-brand">
              Ver cursos em {c.site.label} <ArrowUpRight className="size-4" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

const tipos = [
  { id: "educacional", label: "Educacional", intro: "Descontos de instituições parceiras para colaboradores Facta. Veja quanto é o desconto e como comprovar o vínculo." },
  { id: "medico", label: "Médico", intro: "Planos de saúde e odontológicos oferecidos aos colaboradores. Cada card resume o plano; o documento completo pode ser lido ou baixado." },
] as const;
type Tipo = (typeof tipos)[number]["id"];

export function ConveniosView() {
  const [tipo, setTipo] = useState<Tipo>("educacional");
  // ?tipo=medico abre direto na aba Médico (e a aba escolhida fica no endereço ao voltar)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (new URLSearchParams(window.location.search).get("tipo") === "medico") setTipo("medico");
  }, []);
  const escolher = (t: Tipo) => {
    setTipo(t);
    window.history.replaceState(null, "", t === "medico" ? "?tipo=medico" : window.location.pathname);
  };
  const atual = tipos.find((t) => t.id === tipo)!;

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Dashboard", href: "/" }, { label: "Recursos Humanos" }, { label: "Convênios" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <HeartHandshake className="size-8 text-brand" strokeWidth={1.8} /> Convênios
        </h1>
        <p className="mt-2 max-w-[760px] text-[16px] text-ink-soft">{atual.intro}</p>
        <div role="radiogroup" aria-label="Tipo de convênio" className="mt-5 inline-flex gap-1 rounded-2xl border border-line bg-paper p-1">
          {tipos.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={tipo === t.id}
              onClick={() => escolher(t.id)}
              className={cn("h-11 rounded-xl px-6 text-[14px] font-bold transition-colors motion-reduce:transition-none", tipo === t.id ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tipo === "medico" && <ConveniosMedicos />}
      {tipo === "educacional" && groups.map((g) => (
        <section key={g.title} aria-labelledby={`cv-${g.title}`}>
          <h2 id={`cv-${g.title}`} className="mb-4 flex items-center gap-2.5 text-[20px] font-bold">
            <g.icon className="size-5 text-brand" /> {g.title}
            <span className="rounded-md bg-brand-soft px-2 py-0.5 text-[14px] font-bold text-brand">{g.items.length}</span>
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.items.map((c) => (
              <li key={c.name}><Card c={c} /></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
