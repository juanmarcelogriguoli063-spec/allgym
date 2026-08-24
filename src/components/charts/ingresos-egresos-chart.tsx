"use client";

import { useId, useState } from "react";

type Punto = { mes: string; label: string; ingreso: number; egreso: number };

const GOOD = "#0ca30c";
const CRITICAL = "#d03b3b";

export default function IngresosEgresosChart({ data }: { data: Punto[] }) {
  const uid = useId();
  const [hover, setHover] = useState<number | null>(null);

  const width = 640;
  const height = 260;
  const padding = { top: 12, right: 12, bottom: 28, left: 48 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const max = Math.max(1, ...data.flatMap((d) => [d.ingreso, d.egreso]));
  const niceMax = Math.ceil(max / 5) * 5 || 1;
  const yTicks = [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax];

  const groupW = plotW / data.length;
  const barW = Math.min(24, groupW / 3);
  const gap = 2;

  function y(v: number) {
    return padding.top + plotH - (v / niceMax) * plotH;
  }

  const fmt = (v: number) => `$${v.toLocaleString("es-AR")}`;

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: GOOD }} />
          Ingresos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: CRITICAL }} />
          Egresos
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Ingresos y egresos por mes">
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text x={padding.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--muted-foreground)">
              {t >= 1000 ? `${Math.round(t / 1000)}k` : t}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const gx = padding.left + i * groupW;
          const cx1 = gx + groupW / 2 - barW / 2 - gap / 2;
          const cx2 = gx + groupW / 2 + barW / 2 + gap / 2;
          const isHover = hover === i;
          return (
            <g key={d.mes}>
              <rect
                x={cx1 - barW}
                y={y(d.ingreso)}
                width={barW}
                height={Math.max(0, y(0) - y(d.ingreso))}
                rx={4}
                fill={GOOD}
                opacity={isHover ? 1 : 0.9}
              />
              <rect
                x={cx2}
                y={y(d.egreso)}
                width={barW}
                height={Math.max(0, y(0) - y(d.egreso))}
                rx={4}
                fill={CRITICAL}
                opacity={isHover ? 1 : 0.9}
              />
              <rect
                x={gx}
                y={padding.top}
                width={groupW}
                height={plotH}
                fill="transparent"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                tabIndex={0}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              />
              <text x={gx + groupW / 2} y={height - 8} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                {d.label}
              </text>
            </g>
          );
        })}
        <line x1={padding.left} x2={width - padding.right} y1={y(0)} y2={y(0)} stroke="var(--border)" strokeWidth={1} />
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{ left: `${((hover + 0.5) / data.length) * 100}%`, transform: "translateX(-50%)" }}
        >
          <p className="mb-1 font-medium text-popover-foreground">{data[hover].label}</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: GOOD }} />
            <span className="text-muted-foreground">Ingresos</span>
            <strong className="ml-auto text-popover-foreground">{fmt(data[hover].ingreso)}</strong>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: CRITICAL }} />
            <span className="text-muted-foreground">Egresos</span>
            <strong className="ml-auto text-popover-foreground">{fmt(data[hover].egreso)}</strong>
          </p>
        </div>
      )}
      <span className="sr-only" id={uid}>
        Tabla de datos disponible más abajo.
      </span>
    </div>
  );
}
