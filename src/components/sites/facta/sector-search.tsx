"use client";

import { useState } from "react";
import { sectorTickets } from "./data";

const inputCls =
  "h-[30px] w-full rounded-[3px] border border-[#d4d8da] bg-white px-2 text-[11px] text-[#4c5961] placeholder:text-[#aab2b6]";

const columns = ["", "", "CÓDIGO", "MOTIVO", "SUBMOTIVO", "UF", "ORIGEM", "SOLICITANTE", "RESPONSÁVEL", "SOLICITADO", "ATUALIZADO", "DIAS", "STATUS"];

const colWidths = [3.9, 5.3, 6, 8.4, 8.4, 4.3, 10.5, 10.6, 10.6, 7.7, 8.4, 5.3, 10.6];

const placeholderSelects = ["Motivo", "Origem", "Solicitante", "Responsável", "Prioridade", "Status", "Tipo Contato", "Motivo Auxiliar", "UF"];

type Filters = { code: string; title: string; status: string };
const empty: Filters = { code: "", title: "", status: "" };

export function SectorSearch() {
  const [draft, setDraft] = useState<Filters>(empty);
  const [applied, setApplied] = useState<Filters>(empty);

  const rows = sectorTickets.filter(
    (t) =>
      String(t.code).includes(applied.code.trim()) &&
      `${t.reason} ${t.subreason}`.toLowerCase().includes(applied.title.trim().toLowerCase()) &&
      (applied.status === "" || t.status === applied.status),
  );
  const statuses = [...new Set(sectorTickets.map((t) => t.status))];

  return (
    <>
      <section className="mt-[26px] rounded-[4px] bg-white p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <label className="block text-[11px]">
          ÁREA:
          <select className={`${inputCls} mt-[6px] block h-[36px] max-w-[418px] uppercase`} defaultValue="SUPORTE INFORMATICA">
            <option>SUPORTE INFORMATICA</option>
          </select>
        </label>

        <div className="mt-[10px] grid grid-cols-1 gap-x-[24px] gap-y-[10px] sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[11px]">
            Código:
            <input className={`${inputCls} mt-[6px] h-[34px]`} placeholder="Código" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} />
          </label>
          <label className="text-[11px]">
            Título:
            <input className={`${inputCls} mt-[6px] h-[34px]`} placeholder="Parte do título" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="text-[11px]">
            Data Alteração Inicial:
            <input className={`${inputCls} mt-[6px] h-[34px]`} placeholder="Data Inicial" />
          </label>
          <label className="text-[11px]">
            Data Alteração Final:
            <input className={`${inputCls} mt-[6px] h-[34px]`} placeholder="Data Final" />
          </label>
          {placeholderSelects.map((p) =>
            p === "Status" ? (
              <label key={p} className="text-[11px]">
                Status:
                <select className={`${inputCls} mt-[6px] h-[30px]`} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                  <option value="">Status</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label key={p} className="text-[11px]">
                {p}:
                <select className={`${inputCls} mt-[6px] h-[30px]`} defaultValue="">
                  <option value="">{p}</option>
                </select>
              </label>
            ),
          )}
        </div>

        <div className="mt-[26px] flex flex-wrap gap-[24px]">
          <button type="button" onClick={() => setApplied(draft)} className="h-[37px] w-[270px] max-w-full rounded-[3px] bg-[#1e88d8] text-[12px] font-medium uppercase text-white hover:brightness-95">
            Pesquisar
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(empty);
              setApplied(empty);
            }}
            className="h-[37px] w-[270px] max-w-full rounded-[3px] bg-[#d9344f] text-[12px] font-medium uppercase text-white hover:brightness-95"
          >
            Limpar
          </button>
        </div>

        <div className="mt-[28px] flex flex-wrap items-center gap-x-[14px] gap-y-2 text-[12px]">
          <label className="flex items-center gap-[6px]">
            <input type="checkbox" /> Chamados sem Atendimento
          </label>
          <label className="flex items-center gap-[6px]">
            <input type="checkbox" /> Chamados sem Atendimento com Prioridade
          </label>
          <span className="flex items-center gap-2 text-[#4c5961]">
            <i className="fa fa-file-excel-o text-[26px]" /> Exportar para Excel
          </span>
        </div>
      </section>

      <section className="mt-[30px] rounded-[4px] bg-white p-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-center gap-[22px] pb-[18px] pt-[6px] text-[12px]">
          <span className="rounded-[3px] bg-[#f0f1f2] px-[14px] py-[7px]"><i className="fa fa-arrow-left" /> Página Anterior</span>
          <span className="rounded-[3px] bg-[#666ee8] px-[9px] py-[5px] text-[11px] font-semibold text-white">1</span>
          <span className="rounded-[3px] bg-[#f0f1f2] px-[14px] py-[7px]">Próxima Página <i className="fa fa-arrow-right" /></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] table-fixed border-collapse text-center text-[12px] [&_td]:px-2 [&_td]:py-[11px]">
            <colgroup>
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: `${w}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="bg-[#3b8cc4] text-white">
                {columns.map((c, i) => (
                  <th key={i} className="border border-white/40 px-2 py-[10px] text-[11px] font-semibold">
                    {i === 0 ? <i className="fa fa-cog" /> : i === 1 ? <i className="fa fa-info-circle" /> : c}
                    {i > 0 && <i className="fa fa-sort-alpha-asc ml-1" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.code} className="border-b border-white odd:bg-[#efefef] even:bg-[#f6f6f6]">
                  <td className="border border-white px-2 py-[10px] text-left">
                    <span className="flex items-center gap-[10px]">
                      <input type="checkbox" aria-label={`Selecionar ${t.code}`} /> <i className="fa fa-search" />
                    </span>
                  </td>
                  <td className="border border-white px-2">
                    <span className={`rounded-[3px] px-[6px] py-[2px] text-[10px] font-medium text-white ${t.priority === "Baixa" ? "bg-[#28d094]" : "bg-[#ff9149]"}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="border border-white px-2">{t.code}</td>
                  <td className="border border-white px-2">{t.reason}</td>
                  <td className="border border-white px-2">{t.subreason}</td>
                  <td className="border border-white px-2">{t.uf}</td>
                  <td className="border border-white px-2">{t.origin}</td>
                  <td className="border border-white px-2">{t.requester}</td>
                  <td className="border border-white px-2">{t.owner}</td>
                  <td className="whitespace-pre-line border border-white px-2">{t.requested.replace(" ", "\n")}</td>
                  <td className="whitespace-pre-line border border-white px-2">{t.updated.replace(" ", "\n")}</td>
                  <td className="border border-white px-2">{t.days}</td>
                  <td className="border border-white px-2">{t.status}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="py-6 text-[12px]">Nenhum chamado encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
