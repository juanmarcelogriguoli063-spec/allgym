"use client";

import { useState } from "react";

type Slice = { key: string; label: string; value: number; color: string };

export default function CuotasDonutChart({ slices }: { slices: Slice[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const total = slices.reduce((s, d) => s + d.value, 0);

  const size = 160;
  const r = 60;
  const stroke = 22;
  const c = 2 * Math.PI * r;
  const center = size / 2;

  const gapLen = total > 0 ? 2 : 0;
  const lens = slices.map((s) => (total > 0 ? s.value / total : 0) * c);
  const arcs = slices.map((s, i) => {
    const len = lens[i];
    const offset = lens.slice(0, i).reduce((a, b) => a + b, 0);
    return { ...s, dasharray: `${Math.max(0, len - gapLen)} ${c - Math.max(0, len - gapLen)}`, dashoffset: -offset, index: i };
  });

  if (total === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sin socios cargados todavía.</p>;
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribución de socios por estado de cuota">
          <circle cx={center} cy={center} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
          {arcs.map((a) => (
            <circle
              key={a.key}
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={stroke}
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
              transform={`rotate(-90 ${center} ${center})`}
              opacity={hover === null || hover === a.index ? 1 : 0.35}
              onPointerEnter={() => setHover(a.index)}
              onPointerLeave={() => setHover(null)}
              tabIndex={0}
              onFocus={() => setHover(a.index)}
              onBlur={() => setHover(null)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">{hover !== null ? slices[hover].value : total}</span>
          <span className="text-[10px] text-muted-foreground">{hover !== null ? slices[hover].label : "socios"}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2 text-sm">
        {slices.map((s, i) => (
          <li
            key={s.key}
            className="flex items-center gap-2"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
          >
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <strong className="ml-auto text-foreground">{s.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
