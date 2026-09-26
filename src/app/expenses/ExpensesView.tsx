"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { ExpenseFilters as Filters, SortKey } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useToast } from "@/hooks/useToast";
import { useExpenseModal } from "@/components/AppShell";
import { EMPTY_FILTERS, ExpenseFilters } from "@/components/ExpenseFilters";
import { ExpenseList, ExpenseListSkeleton } from "@/components/ExpenseList";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { filterExpenses, sortExpenses, sumAmounts } from "@/lib/analytics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, todayISO } from "@/lib/format";

const PAGE_SIZE = 25;

export function ExpensesView() {
  const { expenses, isLoading, clearAll, restoreAll } = useExpenses();
  const { openCreate, openEdit } = useExpenseModal();
  const { requestDelete, dialog } = useDeleteExpense();
  const { toast } = useToast();

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [confirmClear, setConfirmClear] = useState(false);
  const deferredFilters = useDeferredValue(filters);

  const filtered = useMemo(
    () => sortExpenses(filterExpenses(expenses, deferredFilters), sort),
    [expenses, deferredFilters, sort],
  );
  const filteredTotal = useMemo(() => sumAmounts(filtered), [filtered]);

  const changeFilters = (next: Filters) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      toast("Nothing to export — no expenses match your filters.", { variant: "error" });
      return;
    }
    try {
      downloadCsv(filtered, `expenses-${todayISO()}.csv`);
      toast(`Exported ${filtered.length} expense${filtered.length === 1 ? "" : "s"} to CSV.`);
    } catch (err) {
      console.error(err);
      toast("Export failed. Please try again.", { variant: "error" });
    }
  };

  const handleClearAll = () => {
    const removed = clearAll();
    setConfirmClear(false);
    changeFilters(EMPTY_FILTERS);
    toast(`Deleted all ${removed.length} expense${removed.length === 1 ? "" : "s"}.`, {
      variant: "info",
      action: { label: "Undo", onClick: () => restoreAll(removed) },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">Search, filter, edit, and export your transactions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={isLoading || expenses.length === 0}
            className="btn-secondary flex-1 text-red-600 hover:bg-red-50 sm:flex-none"
          >
            Clear all
          </button>
          <button type="button" onClick={exportCsv} disabled={isLoading || expenses.length === 0} className="btn-secondary flex-1 sm:flex-none">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
              <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
            </svg>
            Export CSV
          </button>
          <button type="button" onClick={openCreate} className="btn-primary flex-1 sm:hidden">
            Add expense
          </button>
        </div>
      </div>

      <div className="card p-4 sm:p-5">
        <ExpenseFilters filters={filters} onChange={changeFilters} sort={sort} onSortChange={setSort} />
      </div>

      <section className="card overflow-hidden">
        {!isLoading && expenses.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 text-sm sm:px-5">
            <span className="text-slate-500" aria-live="polite">
              Showing <strong className="font-semibold text-slate-900">{filtered.length}</strong> of {expenses.length}{" "}
              expenses
            </span>
            <span className="text-slate-500">
              Total: <strong className="font-semibold tabular-nums text-slate-900">{formatCurrency(filteredTotal)}</strong>
            </span>
          </div>
        )}

        {isLoading ? (
          <ExpenseListSkeleton rows={8} />
        ) : expenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Once you add expenses they'll show up here, ready to search, filter, and export."
            action={
              <button type="button" onClick={openCreate} className="btn-primary">
                Add expense
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No matching expenses"
            description="Try a different search term, category, or date range."
            action={
              <button type="button" onClick={() => changeFilters(EMPTY_FILTERS)} className="btn-secondary">
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <ExpenseList expenses={filtered.slice(0, visible)} onEdit={openEdit} onDelete={requestDelete} />
            {visible < filtered.length && (
              <div className="border-t border-slate-100 p-3 text-center">
                <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-ghost">
                  Show more ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {dialog}
      <ConfirmDialog
        open={confirmClear}
        title="Delete all expenses?"
        message={`All ${expenses.length} expenses (${formatCurrency(sumAmounts(expenses))}) will be removed from this browser. Export a CSV first if you want a backup.`}
        confirmLabel="Delete all"
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
