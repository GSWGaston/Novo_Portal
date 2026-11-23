import { cn } from "@/lib/utils";

// Aproximação do logo: o arquivo oficial (SVG) ainda não foi fornecido. Troque aqui quando tiver.
export function Brand({ tone = "light", className }: { tone?: "light" | "color"; className?: string }) {
  const color = tone === "light" ? "text-white" : "text-brand";
  return (
    <span className={cn("inline-flex items-center gap-2 font-extrabold italic", color, className)}>
      <svg viewBox="0 0 40 40" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <path
          d="M9 2h26a4 4 0 0 1 4 4.6l-3 27A5 5 0 0 1 31 38H5a4 4 0 0 1-4-4.6l3-27A5 5 0 0 1 9 2Z"
          fill="currentColor"
        />
        <path
          d="M14 27l2.2-15h13.6l-.7 5H20.600l-.4 2.800h7.300l-.7 4.900h-7.300L18.600 27Z"
          fill={tone === "light" ? "#0b5fe0" : "#fff"}
        />
      </svg>
      <span className="tracking-tight">facta</span>
    </span>
  );
}
