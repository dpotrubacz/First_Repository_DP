"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useDeleteExpense } from "@/hooks/useDeleteExpense";
import { useToast } from "@/hooks/useToast";
import { useExpenseModal } from "@/components/AppShell";
import { SummaryCards, SummaryCardsSkeleton } from "@/components/SummaryCards";
import { CategoryChart } from "@/components/CategoryChart";
import { MonthlyChart } from "@/components/MonthlyChart";
import { ExpenseList, ExpenseListSkeleton } from "@/components/ExpenseList";
import { EmptyState } from "@/components/EmptyState";
import { dashboardStats, monthlyTotals, sortExpenses, sumAmounts, totalsByCategory } from "@/lib/analytics";
import { generateSampleExpenses } from "@/lib/sampleData";

export default function DashboardPage() {
  const { expenses, isLoading, addMany } = useExpenses();
  const { openCreate, openEdit } = useExpenseModal();
  const { requestDelete, dialog } = useDeleteExpense();
  const { toast } = useToast();

  const stats = useMemo(() => dashboardStats(expenses), [expenses]);
  const byCategory = useMemo(() => totalsByCategory(expenses), [expenses]);
  const monthly = useMemo(() => monthlyTotals(expenses, 6), [expenses]);
  const recent = useMemo(() => sortExpenses(expenses, "date-desc").slice(0, 6), [expenses]);

  const loadSample = () => {
    const sample = generateSampleExpenses();
    addMany(sample);
    toast(`Loaded ${sample.length} sample expenses.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader />

      {isLoading ? (
        <>
          <SummaryCardsSkeleton />
          <div className="card">
            <ExpenseListSkeleton />
          </div>
        </>
      ) : expenses.length === 0 ? (
        <div className="card">
          <EmptyState
            title="Start tracking your spending"
            description="Add your first expense to unlock spending summaries, category breakdowns, and monthly trends."
            action={
              <>
                <button type="button" onClick={openCreate} className="btn-primary">
                  Add your first expense
                </button>
                <button type="button" onClick={loadSample} className="btn-secondary">
                  Load sample data
                </button>
              </>
            }
          />
        </div>
      ) : (
        <>
          <SummaryCards stats={stats} />

          <div className="grid items-start gap-6 lg:grid-cols-5">
            <section className="card p-5 sm:p-6 lg:col-span-3">
              <SectionTitle title="Monthly spending" subtitle="Last 6 months" />
              <MonthlyChart data={monthly} />
            </section>
            <section className="card p-5 sm:p-6 lg:col-span-2">
              <SectionTitle title="By category" subtitle="All time" />
              <CategoryChart data={byCategory} total={sumAmounts(expenses)} />
            </section>
          </div>

          <section className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
              <SectionTitle title="Recent expenses" subtitle="Your latest transactions" noMargin />
              <Link href="/expenses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                View all →
              </Link>
            </div>
            <ExpenseList expenses={recent} onEdit={openEdit} onDelete={requestDelete} />
          </section>
        </>
      )}
      {dialog}
    </div>
  );
}

function PageHeader() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div>
      <p className="text-sm font-medium text-brand-600" suppressHydrationWarning>
        {today}
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">An overview of where your money is going.</p>
    </div>
  );
}

function SectionTitle({ title, subtitle, noMargin }: { title: string; subtitle?: string; noMargin?: boolean }) {
  return (
    <div className={noMargin ? "" : "mb-5"}>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
