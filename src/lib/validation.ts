import { CATEGORIES, type Category, type ExpenseInput } from "@/types/expense";
import { parseISODate, todayISO } from "./format";

export interface ExpenseFormValues {
  date: string;
  amount: string;
  category: Category | "";
  description: string;
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

export const MAX_AMOUNT = 1_000_000;
export const MAX_DESCRIPTION = 120;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const AMOUNT = /^\d+(\.\d{1,2})?$/;

export function validateExpense(values: ExpenseFormValues): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  if (!values.date) {
    errors.date = "Date is required.";
  } else if (!ISO_DATE.test(values.date) || isNaN(parseISODate(values.date).getTime())) {
    errors.date = "Enter a valid date.";
  } else if (values.date > todayISO()) {
    errors.date = "Date cannot be in the future.";
  } else if (values.date < "1970-01-01") {
    errors.date = "Date is too far in the past.";
  }

  const rawAmount = values.amount.trim();
  if (!rawAmount) {
    errors.amount = "Amount is required.";
  } else if (!AMOUNT.test(rawAmount)) {
    errors.amount = "Enter a positive number with up to 2 decimals.";
  } else {
    const amount = Number(rawAmount);
    if (amount <= 0) errors.amount = "Amount must be greater than zero.";
    else if (amount > MAX_AMOUNT) errors.amount = "Amount is unrealistically large.";
  }

  if (!values.category) {
    errors.category = "Pick a category.";
  } else if (!CATEGORIES.includes(values.category)) {
    errors.category = "Unknown category.";
  }

  const description = values.description.trim();
  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length < 2) {
    errors.description = "Description is too short.";
  } else if (description.length > MAX_DESCRIPTION) {
    errors.description = `Keep it under ${MAX_DESCRIPTION} characters.`;
  }

  return errors;
}

export function toExpenseInput(values: ExpenseFormValues): ExpenseInput {
  return {
    date: values.date,
    amount: Math.round(Number(values.amount) * 100) / 100,
    category: values.category as Category,
    description: values.description.trim(),
  };
}
