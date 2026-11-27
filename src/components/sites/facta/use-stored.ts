import { useEffect, useState } from "react";

/** Estado da demonstração guardado no localStorage (sem servidor). Começa em `fallback` até ler o navegador. */
export function useStored<T>(key: string, fallback: () => T) {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* usa o valor inicial */
    }
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* segue em memória */
    }
  }, [key, value, loaded]);
  return [value, setValue, loaded] as const;
}

/** Lê/grava o estado de uma tela na sessão da aba, para que os filtros sobrevivam a sair e voltar. */
export function readSession<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
export function writeSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* segue em memória */
  }
}

/** Última lista de solicitações visitada; o detalhe do chamado usa para o "Voltar" e a trilha. */
export const ORIGIN_KEY = "facta-lista-origem";
