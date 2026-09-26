import { CATEGORIES, type Category, type Expense, type ExpenseFilters, type SortKey } from "@/types/expense";
import { parseISODate, toISODate } from "./format";

export function sumAmounts(expenses: Expense[]): number {
  // Sum in cents to avoid floating point drift.
  return expenses.reduce((cents, e) => cents + Math.round(e.amount * 100), 0) / 100;
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const query = filters.search.trim().toLowerCase();
  return expenses.filter((e) => {
    if (filters.category !== "All" && e.category !== filters.category) return false;
    if (filters.startDate && e.date < filters.startDate) return false;
    if (filters.endDate && e.date > filters.endDate) return false;
    if (
      query &&
      !e.description.toLowerCase().includes(query) &&
      !e.category.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });
}

export function sortExpenses(expenses: Expense[], sort: SortKey): Expense[] {
  const sorted = [...expenses];
  const byCreated = (a: Expense, b: Expense) => b.createdAt.localeCompare(a.createdAt);
  switch (sort) {
    case "date-desc":
      return sorted.sort((a, b) => b.date.localeCompare(a.date) || byCreated(a, b));
    case "date-asc":
      return sorted.sort((a, b) => a.date.localeCompare(b.date) || -byCreated(a, b));
    case "amount-desc":
      return sorted.sort((a, b) => b.amount - a.amount);
    case "amount-asc":
      return sorted.sort((a, b) => a.amount - b.amount);
  }
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  share: number;
}

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const grand = sumAmounts(expenses);
  return CATEGORIES.map((category) => {
    const items = expenses.filter((e) => e.category === category);
    const total = sumAmounts(items);
    return { category, total, count: items.length, share: grand > 0 ? total / grand : 0 };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export interface MonthTotal {
  key: string;
  total: number;
}

/** Totals for the last `months` calendar months, oldest first, including empty months. */
export function monthlyTotals(expenses: Expense[], months = 6, now = new Date()): MonthTotal[] {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(toISODate(d).slice(0, 7));
  }
  const totals = new Map<string, number>(keys.map((k) => [k, 0]));
  for (const e of expenses) {
    const k = monthKey(e.date);
    if (totals.has(k)) totals.set(k, totals.get(k)! + Math.round(e.amount * 100));
  }
  return keys.map((key) => ({ key, total: totals.get(key)! / 100 }));
}

export interface DashboardStats {
  total: number;
  count: number;
  thisMonth: number;
  lastMonth: number;
  /** Percentage change vs. last month, or null if last month had no spending. */
  monthChange: number | null;
  averagePerDayThisMonth: number;
  largest: Expense | null;
  topCategory: CategoryTotal | null;
}

export function dashboardStats(expenses: Expense[], now = new Date()): DashboardStats {
  const thisKey = toISODate(now).slice(0, 7);
  const lastKey = toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)).slice(0, 7);

  const thisMonthItems = expenses.filter((e) => monthKey(e.date) === thisKey);
  const thisMonth = sumAmounts(thisMonthItems);
  const lastMonth = sumAmounts(expenses.filter((e) => monthKey(e.date) === lastKey));

  const largest = expenses.reduce<Expense | null>(
    (max, e) => (max === null || e.amount > max.amount ? e : max),
    null,
  );

  return {
    total: sumAmounts(expenses),
    count: expenses.length,
    thisMonth,
    lastMonth,
    monthChange: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null,
    averagePerDayThisMonth: thisMonth / now.getDate(),
    largest,
    topCategory: totalsByCategory(expenses)[0] ?? null,
  };
}

export function daysAgoISO(days: number, now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  return toISODate(d);
}

export function startOfMonthISO(now = new Date()): string {
  return toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function isSameMonth(iso: string, now = new Date()): boolean {
  const d = parseISODate(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
