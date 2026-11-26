"use client";

import { Medal, Vote } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { cipaResultados, cipaVotacao } from "./meu-rh-data";

const ANOS = Object.keys(cipaResultados).map(Number).sort((a, b) => b - a);

export function MeuRhCipa() {
  const [ano, setAno] = useState(ANOS[0]);
  const lista = cipaResultados[ano];
  const max = Math.max(...lista.map((c) => c.votos));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb trail={[{ label: "Início", href: "/" }, { label: "RH" }, { label: "CIPA" }]} />
          <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
            <Vote className="size-8 text-brand" strokeWidth={1.8} /> CIPA {ano}: resultado
          </h1>
          <p className="mt-2 text-[16px] text-ink-soft">Comissão Interna de Prevenção de Acidentes: quem foi eleito pelos colaboradores.</p>
        </div>
        <div role="tablist" aria-label="Ano da eleição" className="inline-flex gap-1 rounded-2xl border border-line bg-paper p-1 shadow-sm">
          {ANOS.map((a) => (
            <button key={a} role="tab" type="button" aria-selected={ano === a} onClick={() => setAno(a)} className={cn("h-10 coarse:h-11 rounded-xl px-4 text-[14px] font-bold tabular transition-colors motion-reduce:transition-none", ano === a ? "bg-navy text-white" : "text-ink-soft hover:bg-brand-soft hover:text-ink")}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {ano === ANOS[0] && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-warn/30 bg-warn-soft px-5 py-3 text-[14px] text-warn-ink">
          <span className="rounded-full bg-warn px-2.5 py-0.5 text-[12px] font-extrabold uppercase tracking-wide text-white">Votação encerrada</span>
          Período de votação: {cipaVotacao.inicio} até {cipaVotacao.fim}.
        </p>
      )}

      <section className="overflow-hidden rounded-3xl border border-paper bg-paper/90 shadow-card" aria-label={`Resultado da CIPA ${ano}`}>
        <h2 className="border-b border-line px-6 py-4 text-[18px] font-bold">Facta</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-[14px]">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-[12px] font-bold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Posição</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Setor</th>
                <th className="px-5 py-3">Admissão</th>
                <th className="px-5 py-3 w-[220px]">Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((c) => {
                const eleito = c.posicao?.includes("eleito");
                return (
                  <tr key={c.codigo} className={cn(eleito && "bg-ok-soft/40")}>
                    <td className="px-5 py-3">
                      {c.posicao ? (
                        <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-bold", eleito ? "bg-ok-soft text-ok-ink" : "bg-brand-soft text-brand")}>
                          {eleito && <Medal className="size-3.5" />} {c.posicao}
                        </span>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 tabular text-ink-soft">{c.codigo}</td>
                    <td className="px-5 py-3 font-semibold">{c.nome}</td>
                    <td className="px-5 py-3 text-ink-soft">{c.setor}</td>
                    <td className="px-5 py-3 tabular text-ink-soft">{c.admissao}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-3">
                        <span className="h-2 flex-1 rounded-full bg-line">
                          <span className={cn("block h-full rounded-full", eleito ? "bg-ok" : "bg-brand")} style={{ width: `${(c.votos / max) * 100}%` }} />
                        </span>
                        <span className="w-8 text-right font-bold tabular">{c.votos}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
