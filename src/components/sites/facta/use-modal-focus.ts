import { useEffect, type RefObject } from "react";

/**
 * Modal do portal: foca `first` ao abrir, prende o Tab dentro de `box`, Esc fecha e o foco volta a quem abriu.
 * Ignora teclas vindas de painéis flutuantes (`[data-floating]`: Select e DatePicker), que tratam o próprio Esc.
 */
export function useModalFocus(box: RefObject<HTMLElement | null>, first: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest("[data-floating]")) return;
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !box.current) return;
      const items = box.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]):not([tabindex='-1']), textarea, [tabindex]:not([tabindex='-1'])");
      const head = items[0];
      const last = items[items.length - 1];
      const outside = !box.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === head || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || outside)) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [box, first, onClose]);
}
