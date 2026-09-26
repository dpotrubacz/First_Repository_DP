export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Expense {
  id: string;
  /** ISO calendar date, YYYY-MM-DD (no time zone). */
  date: string;
  /** Amount in the major currency unit, e.g. 12.5 = $12.50. */
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Pick<Expense, "date" | "amount" | "category" | "description">;

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  startDate: string;
  endDate: string;
}

export type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
