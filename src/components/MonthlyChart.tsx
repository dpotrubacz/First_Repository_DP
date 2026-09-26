"use client";

import { useState } from "react";
import type { MonthTotal } from "@/lib/analytics";
import { formatCompactCurrency, formatCurrency, formatMonthLabel } from "@/lib/format";

const CHART_HEIGHT = 200;

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const n = value / magnitude;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function MonthlyChart({ data }: { data: MonthTotal[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.total)));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((t) => t * max);
  const average = data.reduce((s, d) => s + d.total, 0) / (data.length || 1);

  return (
    <div>
      <div className="flex gap-3">
        {/* Y axis labels */}
        <div className="relative w-12 shrink-0 text-right text-xs tabular-nums text-slate-400" style={{ height: CHART_HEIGHT }}>
          {ticks.map((t, i) => (
            <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
              {formatCompactCurrency(t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
          {/* Grid lines */}
          {ticks.map((_, i) => (
            <div
              key={i}
              className={`absolute inset-x-0 border-t ${i === ticks.length - 1 ? "border-slate-300" : "border-dashed border-slate-200"}`}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            />
          ))}
          {/* Average line */}
          {average > 0 && (
            <div
              className="absolute inset-x-0 z-10 border-t-2 border-dotted border-amber-400"
              style={{ bottom: `${(average / max) * 100}%` }}
              title={`Average: ${formatCurrency(average)}`}
            />
          )}
          {/* Bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {data.map((d, i) => {
              const isLast = i === data.length - 1;
              return (
                <div
                  key={d.key}
                  className="group relative flex h-full flex-1 items-end justify-center"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  {hover === i && (
                    <div className="absolute z-20 -translate-y-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow" style={{ bottom: `${(d.total / max) * 100}%` }}>
                      {formatCurrency(d.total)}
                    </div>
                  )}
                  <div
                    className={`w-full max-w-[44px] rounded-t-md transition-all duration-500 ${
                      isLast ? "bg-brand-600" : "bg-brand-300 group-hover:bg-brand-400"
                    }`}
                    style={{ height: `${Math.max((d.total / max) * 100, d.total > 0 ? 1 : 0)}%` }}
                    role="img"
                    aria-label={`${formatMonthLabel(d.key)}: ${formatCurrency(d.total)}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* X axis */}
      <div className="ml-[60px] mt-2 flex justify-around gap-2 text-xs text-slate-500">
        {data.map((d, i) => (
          <span key={d.key} className={`flex-1 text-center ${i === data.length - 1 ? "font-semibold text-slate-900" : ""}`}>
            {formatMonthLabel(d.key)}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-600" /> Current month
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dotted border-amber-400" /> Average ({formatCurrency(average)})
        </span>
      </div>
    </div>
  );
}
