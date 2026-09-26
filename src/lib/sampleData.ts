import type { Category, ExpenseInput } from "@/types/expense";
import { toISODate } from "./format";

const TEMPLATES: Array<[Category, string, number, number]> = [
  ["Food", "Groceries", 45, 140],
  ["Food", "Lunch with coworkers", 12, 30],
  ["Food", "Coffee", 3, 7],
  ["Transportation", "Gas", 35, 70],
  ["Transportation", "Train ticket", 5, 25],
  ["Entertainment", "Movie night", 15, 40],
  ["Entertainment", "Streaming subscription", 10, 18],
  ["Shopping", "New shoes", 50, 130],
  ["Shopping", "Household supplies", 15, 60],
  ["Bills", "Electricity bill", 60, 120],
  ["Bills", "Internet", 50, 80],
  ["Other", "Gift for a friend", 20, 75],
];

/** Generates ~3 months of realistic-looking demo expenses. */
export function generateSampleExpenses(now = new Date()): ExpenseInput[] {
  const result: ExpenseInput[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let daysBack = 0; daysBack < 90; daysBack++) {
    const perDay = rand() < 0.35 ? 0 : rand() < 0.7 ? 1 : 2;
    for (let i = 0; i < perDay; i++) {
      const [category, description, min, max] = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysBack);
      result.push({
        date: toISODate(date),
        amount: Math.round((min + rand() * (max - min)) * 100) / 100,
        category,
        description,
      });
    }
  }
  return result;
}
