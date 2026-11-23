import { reasons } from "./data";

const CX = 460;
const CY = 150;
const R = 108;

const total = reasons.reduce((s, r) => s + r.value, 0);

export function PieChart() {
  let acc = 0;
  let smallIdx = 0;
  const slices = reasons.map((r) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += r.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const mid = (a0 + a1) / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (a: number) => `${CX + R * Math.cos(a)} ${CY + R * Math.sin(a)}`;
    const d = `M${CX} ${CY} L${p(a0)} A${R} ${R} 0 ${large} 1 ${p(a1)} Z`;
    const small = r.value / total < 0.06;
    // Small slices crowd together near the top-left, so their labels stack in a column like the source.
    const labelY = small ? 30 + smallIdx++ * 20 : CY + (R + 28) * Math.sin(mid);
    const right = Math.cos(mid) >= 0;
    const lx = small ? 330 : CX + (R + 28) * Math.cos(mid);
    return {
      ...r,
      d,
      labelY,
      lx,
      anchor: small ? "end" : right ? "start" : "end",
      from: `${CX + R * Math.cos(mid)},${CY + R * Math.sin(mid)}`,
      to: `${small ? 340 : lx},${labelY - 4}`,
    };
  });

  return (
    <svg viewBox="0 0 920 300" className="h-auto w-full" role="img" aria-label="Top 10 motivos em aberto">
      {slices.map((s) => (
        <g key={s.label}>
          <path d={s.d} fill={s.color} stroke="#fff" strokeWidth={1} />
          <polyline points={`${s.from} ${s.to}`} fill="none" stroke="#999" strokeWidth={1} />
          <text
            x={s.lx + (s.anchor === "end" ? -10 : 10)}
            y={s.labelY}
            textAnchor={s.anchor as "start" | "end"}
            fontSize="10"
            fontWeight="600"
            fill="#000"
          >
            {s.label}: {s.value}
          </text>
        </g>
      ))}
    </svg>
  );
}
