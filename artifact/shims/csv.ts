import type { Expense } from "@/types/expense";
import { expensesToCsv } from "../../src/lib/csv";

export { expensesToCsv };

export const CSV_EVENT = "spendwise:csv";

// File downloads are blocked in the artifact viewer, so hand the CSV to a copy dialog instead.
export function downloadCsv(expenses: Expense[], filename: string): void {
  window.dispatchEvent(new CustomEvent(CSV_EVENT, { detail: { csv: expensesToCsv(expenses), filename, count: expenses.length } }));
}
