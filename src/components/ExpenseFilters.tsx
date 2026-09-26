"use client";

import { CATEGORIES, type ExpenseFilters as Filters, type SortKey } from "@/types/expense";
import { daysAgoISO, startOfMonthISO } from "@/lib/analytics";
import { todayISO } from "@/lib/format";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export const EMPTY_FILTERS: Filters = { search: "", category: "All", startDate: "", endDate: "" };

const PRESETS: Array<{ label: string; range: () => [string, string] }> = [
  { label: "This month", range: () => [startOfMonthISO(), todayISO()] },
  { label: "Last 7 days", range: () => [daysAgoISO(6), todayISO()] },
  { label: "Last 30 days", range: () => [daysAgoISO(29), todayISO()] },
  { label: "Last 90 days", range: () => [daysAgoISO(89), todayISO()] },
];

export function ExpenseFilters({ filters, onChange, sort, onSortChange }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const hasFilters =
    filters.search !== "" || filters.category !== "All" || filters.startDate !== "" || filters.endDate !== "";
  const invalidRange = filters.startDate && filters.endDate && filters.startDate > filters.endDate;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_160px_160px_170px]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            aria-label="Search expenses"
            placeholder="Search descriptions…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="input pl-9"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={filters.category}
          onChange={(e) => set("category", e.target.value as Filters["category"])}
          className="input"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="Start date"
          value={filters.startDate}
          max={filters.endDate || undefined}
          onChange={(e) => set("startDate", e.target.value)}
          className={`input ${invalidRange ? "input-error" : ""}`}
        />
        <input
          type="date"
          aria-label="End date"
          value={filters.endDate}
          min={filters.startDate || undefined}
          onChange={(e) => set("endDate", e.target.value)}
          className={`input ${invalidRange ? "input-error" : ""}`}
        />
        <select aria-label="Sort expenses" value={sort} onChange={(e) => onSortChange(e.target.value as SortKey)} className="input">
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="amount-desc">Highest amount</option>
          <option value="amount-asc">Lowest amount</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((p) => {
          const [start, end] = p.range();
          const active = filters.startDate === start && filters.endDate === end;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange({ ...filters, startDate: start, endDate: end })}
              className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                active ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          );
        })}
        {hasFilters && (
          <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="ml-auto text-xs font-medium text-brand-600 hover:text-brand-700">
            Clear filters
          </button>
        )}
      </div>
      {invalidRange && <p className="field-error">Start date must be on or before the end date.</p>}
    </div>
  );
}
