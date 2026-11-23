"use client";

import { useState } from "react";

export function ScopeToggle() {
  const [scope, setScope] = useState<"Setor" | "Individual">("Individual");
  return (
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-wide">
        Área
        <select className="h-[36px] min-w-[190px] rounded-[3px] border border-[#d4d8da] bg-white px-2 text-[11px] uppercase text-[#4c5961]" defaultValue="SUPORTE INFORMATICA">
          <option>SUPORTE INFORMATICA</option>
        </select>
      </label>
      <div className="flex overflow-hidden rounded-[3px] text-[12px]">
        {(["Setor", "Individual"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScope(s)}
            className={`h-[36px] px-[16px] ${scope === s ? "bg-[#1e9ff2] text-white" : "bg-[#f4f5f6] text-[#67757c]"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
