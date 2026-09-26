"use client";

import { useState } from "react";
import type { CategoryTotal } from "@/lib/analytics";
import { CATEGORY_META } from "@/lib/categories";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

const SIZE = 180;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
const GAP = 2; // px gap between segments

export function CategoryChart({ data, total }: { data: CategoryTotal[]; total: number }) {
  const [active, setActive] = useState<string | null>(null);
  const focused = data.find((d) => d.category === active);

  let offset = 0;
  const segments = data.map((d) => {
    const length = d.share * CIRC;
    const seg = { ...d, length, offset };
    offset += length;
    return seg;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          role="img"
          aria-label="Spending by category"
        >
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
          {segments.map((s) => (
            <circle
              key={s.category}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={CATEGORY_META[s.category].color}
              strokeWidth={active === s.category ? STROKE + 4 : STROKE}
              strokeDasharray={`${Math.max(s.length - (segments.length > 1 ? GAP : 0), 0.5)} ${CIRC}`}
              strokeDashoffset={-s.offset}
              opacity={active && active !== s.category ? 0.35 : 1}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setActive(s.category)}
              onMouseLeave={() => setActive(null)}
            >
              <title>
                {s.category}: {formatCurrency(s.total)}
              </title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-slate-500">{focused ? focused.category : "Total"}</span>
          <span className="text-lg font-semibold tabular-nums text-slate-900">
            {formatCompactCurrency(focused ? focused.total : total)}
          </span>
          {focused && <span className="text-xs text-slate-500">{(focused.share * 100).toFixed(1)}%</span>}
        </div>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
        {data.map((d) => (
          <li
            key={d.category}
            onMouseEnter={() => setActive(d.category)}
            onMouseLeave={() => setActive(null)}
            className={`rounded-lg px-2 py-1 transition ${active === d.category ? "bg-slate-50" : ""}`}
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: CATEGORY_META[d.category].color }} />
                {d.category}
              </span>
              <span className="shrink-0 whitespace-nowrap tabular-nums text-slate-900">
                {formatCurrency(d.total)}
                <span className="ml-2 inline-block w-10 text-right text-xs text-slate-400">
                  {(d.share * 100).toFixed(0)}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${d.share * 100}%`, backgroundColor: CATEGORY_META[d.category].color }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
