"use client";

import { BriefcaseBusiness, CalendarClock, Check, MapPin, Building2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./dashboard-view";
import { vagas } from "./meu-rh-data";
import { useStored } from "./use-stored";

export function MeuRhOportunidades() {
  const [inscritas, setInscritas] = useStored<number[]>("facta-vagas-inscricoes", () => []);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const candidatar = (id: number) => {
    setInscritas((l) => [...l, id]);
    setConfirm(null);
    setToast("Candidatura enviada. O RH vai entrar em contato.");
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <Breadcrumb trail={[{ label: "Início", href: "/" }, { label: "RH" }, { label: "Oportunidades Facta" }]} />
        <h1 className="mt-3 flex items-center gap-3 text-[32px] font-extrabold leading-none tracking-tight">
          <BriefcaseBusiness className="size-8 text-brand" strokeWidth={1.8} /> Oportunidades Facta
        </h1>
        <p className="mt-2 text-[16px] text-ink-soft">Vagas abertas para quem já é da Facta. Candidate-se e o RH entra em contato.</p>
      </div>

      {vagas.length === 0 ? (
        <div className="rounded-3xl border border-paper bg-paper/90 py-14 text-center shadow-card">
          <BriefcaseBusiness className="mx-auto size-10 text-ink-mute" />
          <p className="mt-3 text-[16px] font-bold">Nenhuma oportunidade aberta no momento.</p>
          <p className="text-[14px] text-ink-soft">Quando o RH abrir uma vaga interna, ela aparece aqui.</p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {vagas.map((v) => {
            const done = inscritas.includes(v.id);
            return (
              <li key={v.id} className="flex flex-col rounded-3xl border border-paper bg-paper/90 p-6 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[12px] font-bold text-brand">{v.area}</span>
                    <h2 className="mt-2 text-[20px] font-extrabold leading-tight">{v.titulo}</h2>
                  </div>
                  {done && <span className="flex shrink-0 items-center gap-1 rounded-full bg-ok-soft px-2.5 py-1 text-[12px] font-bold text-ok-ink"><Check className="size-3.5" /> Inscrito</span>}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-ink-soft">
                  <li className="flex items-center gap-1.5"><MapPin className="size-4" /> {v.local}</li>
                  <li className="flex items-center gap-1.5"><Building2 className="size-4" /> {v.modelo}</li>
                  <li className="flex items-center gap-1.5"><CalendarClock className="size-4" /> Inscrições até <span className="font-semibold tabular text-ink">{v.ate}</span></li>
                </ul>
                <p className="mt-4 text-[15px] leading-relaxed">{v.resumo}</p>
                <p className="mt-4 text-[12px] font-bold uppercase tracking-wide text-ink-soft">Requisitos</p>
                <ul className="mt-1.5 space-y-1 text-[14px]">
                  {v.requisitos.map((r) => (
                    <li key={r} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-ok" /> {r}</li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-5">
                  {done ? (
                    <p className="text-[14px] font-semibold text-ok-ink">Candidatura enviada.</p>
                  ) : confirm === v.id ? (
                    <>
                      <span className="mr-auto text-[14px] font-semibold">Confirmar candidatura?</span>
                      <button type="button" onClick={() => setConfirm(null)} className="h-11 rounded-xl border border-line bg-paper px-4 text-[14px] font-bold hover:bg-surface">Cancelar</button>
                      <button type="button" onClick={() => candidatar(v.id)} className="h-11 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">Confirmar</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirm(v.id)} className="h-11 rounded-xl bg-brand px-5 text-[14px] font-bold text-white hover:bg-brand-dark">Quero me candidatar</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p role="status" aria-live="polite" className={cn("fixed bottom-6 right-6 z-[70] rounded-xl bg-navy px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-opacity motion-reduce:transition-none", toast ? "opacity-100" : "pointer-events-none opacity-0")}>
        {toast}
      </p>
    </div>
  );
}
