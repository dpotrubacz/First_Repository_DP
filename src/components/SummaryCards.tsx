import type { DashboardStats } from "@/lib/analytics";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

export function SummaryCards({ stats }: { stats: DashboardStats }) {
  const change = stats.monthChange;
  const up = change !== null && change > 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="This month"
        value={formatCurrency(stats.thisMonth)}
        accent="from-brand-500 to-brand-700"
        highlight
        footer={
          change === null ? (
            <span className="text-brand-100">No spending last month to compare</span>
          ) : (
            <span className="text-brand-100">
              <span className="font-semibold text-white">
                {up ? "▲" : "▼"} {Math.abs(change).toFixed(0)}%
              </span>{" "}
              vs. last month ({formatCurrency(stats.lastMonth)})
            </span>
          )
        }
      />
      <StatCard
        label="Total spending"
        value={formatCurrency(stats.total)}
        footer={`${stats.count} expense${stats.count === 1 ? "" : "s"} recorded`}
      />
      <StatCard
        label="Daily average"
        value={formatCurrency(stats.averagePerDayThisMonth)}
        footer="Per day, this month"
      />
      <StatCard
        label="Top category"
        value={
          stats.topCategory ? (
            <span className="flex items-center gap-2">
              <span aria-hidden>{CATEGORY_META[stats.topCategory.category].icon}</span>
              {stats.topCategory.category}
            </span>
          ) : (
            "—"
          )
        }
        footer={
          stats.topCategory
            ? `${formatCurrency(stats.topCategory.total)} · ${(stats.topCategory.share * 100).toFixed(0)}% of all spending`
            : "No data yet"
        }
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  footer,
  highlight,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  footer: React.ReactNode;
  highlight?: boolean;
  accent?: string;
}) {
  return (
    <div
      className={
        highlight
          ? `rounded-2xl bg-gradient-to-br ${accent} p-5 text-white shadow-md shadow-brand-600/20`
          : "card p-5"
      }
    >
      <p className={`text-sm font-medium ${highlight ? "text-brand-100" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${highlight ? "" : "text-slate-900"}`}>
        {value}
      </p>
      <p className={`mt-2 text-xs ${highlight ? "" : "text-slate-500"}`}>{footer}</p>
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton mt-3 h-7 w-32" />
          <div className="skeleton mt-3 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
