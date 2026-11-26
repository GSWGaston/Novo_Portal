"use client";

import { GitFork, Link2, Network, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { closedByMe, myRequests, tickets, type Status } from "./data";
import { StatusPill } from "./tickets-view";
import { useStored } from "./use-stored";

type Filho = { code: number; title: string; status: Status };
type Rel = { filhos: Filho[]; links: number[] };

const ALL = [...tickets, ...myRequests, ...closedByMe];
const find = (code: number) => ALL.find((t) => t.code === code);

const input = "h-11 min-w-0 flex-1 rounded-xl border bg-paper px-3 text-[14px] outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";
const addBtn = "flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-dark";
const sub = "flex items-center gap-2 text-[14px] font-bold text-ink";

/** Chamados filhos (desdobramentos deste chamado) e vinculações (outros chamados ligados a ele). Demonstração: fica no localStorage. */
export function TicketRelated({ code, onLog }: { code: number; onLog: (text: string) => void }) {
  const [rel, setRel] = useStored<Rel>(`facta-chamado-rel-${code}`, () => ({ filhos: [], links: [] }));
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [titleErr, setTitleErr] = useState(false);
  const [linkCode, setLinkCode] = useState("");
  const [linkErr, setLinkErr] = useState("");

  const createChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setTitleErr(true);
    const child: Filho = { code: Number(`${code}${rel.filhos.length + 1}`), title: title.trim(), status: "Em desenvolvimento" };
    setRel((r) => ({ ...r, filhos: [...r.filhos, child] }));
    onLog(`CHAMADO FILHO CRIADO\n#${child.code} - ${child.title}`);
    setTitle("");
    setCreating(false);
  };

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(linkCode.trim().replace(/^#/, ""));
    const err = !n
      ? "Informe o código do chamado."
      : n === code
        ? "Este é o próprio chamado."
        : rel.links.includes(n)
          ? "Este chamado já está vinculado."
          : !find(n)
            ? `Chamado #${n} não encontrado.`
            : "";
    setLinkErr(err);
    if (err) return;
    setRel((r) => ({ ...r, links: [...r.links, n] }));
    onLog(`VINCULAÇÃO\nChamado vinculado ao #${n}.`);
    setLinkCode("");
  };

  return (
    <div className="space-y-6">
      {/* chamados filhos */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className={sub}><GitFork className="size-4 text-brand" /> Chamados filhos</h3>
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className="flex h-9 coarse:h-11 items-center gap-1.5 rounded-lg px-3 text-[14px] font-bold text-brand hover:bg-brand-soft">
              <Plus className="size-4" /> Criar filho
            </button>
          )}
        </div>
        {creating && (
          <form onSubmit={createChild} noValidate className="mt-3 rounded-2xl bg-surface p-3">
            <label htmlFor={`filho-${code}`} className="mb-1 block text-[14px] font-semibold">Título do chamado filho</label>
            <input id={`filho-${code}`} autoFocus value={title} maxLength={120} aria-invalid={titleErr} onChange={(e) => (setTitle(e.target.value), setTitleErr(false))} placeholder="Ex.: Trocar o monitor" className={cn(input, "w-full", titleErr ? "border-danger" : "border-line")} />
            {titleErr && <p className="mt-1 text-[14px] font-medium text-danger-ink">Dê um título ao chamado filho.</p>}
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" onClick={() => (setCreating(false), setTitle(""), setTitleErr(false))} className="h-10 coarse:h-11 rounded-lg px-3 text-[14px] font-bold text-ink-soft hover:bg-paper">Cancelar</button>
              <button type="submit" className="h-10 coarse:h-11 rounded-lg bg-brand px-4 text-[14px] font-bold text-white hover:bg-brand-dark">Criar</button>
            </div>
          </form>
        )}
        {rel.filhos.length === 0 ? (
          !creating && <p className="mt-2 text-[14px] text-ink-soft">Nenhum chamado filho. Crie um para desdobrar atividades deste chamado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rel.filhos.map((f) => (
              <li key={f.code} className="rounded-xl border border-line p-3">
                <p className="flex items-center justify-between gap-2 text-[14px] font-bold">
                  <span className="tabular">#{f.code}</span>
                  <StatusPill s={f.status} />
                </p>
                <p className="mt-1 text-[14px] text-ink-soft">{f.title}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* vinculações */}
      <div className="border-t border-line pt-5">
        <h3 className={sub}><Link2 className="size-4 text-brand" /> Vinculações</h3>
        <form onSubmit={addLink} noValidate className="mt-3 flex gap-2">
          <label htmlFor={`vinc-${code}`} className="sr-only">Código do chamado para vincular</label>
          <input id={`vinc-${code}`} inputMode="numeric" value={linkCode} aria-invalid={!!linkErr} onChange={(e) => (setLinkCode(e.target.value), setLinkErr(""))} placeholder="Código do chamado" className={cn(input, "tabular", linkErr ? "border-danger" : "border-line")} />
          <button type="submit" aria-label="Vincular chamado" className={addBtn}><Plus className="size-5" /></button>
        </form>
        {linkErr && <p role="alert" className="mt-1 text-[14px] font-medium text-danger-ink">{linkErr}</p>}
        {rel.links.length > 0 && (
          <ul className="mt-3 space-y-2">
            {rel.links.map((n) => {
              const t = find(n);
              return (
                <li key={n} className="flex items-center gap-2 rounded-xl border border-line p-1 pl-3">
                  <Network aria-hidden className="size-4 shrink-0 text-ink-soft" />
                  <Link href={`/solicitacoes/${n}`} className="min-w-0 flex-1 py-1.5 text-[14px] hover:text-brand">
                    <span className="font-bold tabular">#{n}</span> <span className="text-ink-soft">{t?.subtitle}</span>
                  </Link>
                  <button type="button" onClick={() => setRel((r) => ({ ...r, links: r.links.filter((x) => x !== n) }))} aria-label={`Remover vínculo com #${n}`} className="flex size-9 coarse:size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-soft hover:text-danger-ink">
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
