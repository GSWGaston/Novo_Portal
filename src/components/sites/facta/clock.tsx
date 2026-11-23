"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo" });

export function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(fmt.format(new Date()).replace(",", " -"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[11px]">{now}</span>;
}
