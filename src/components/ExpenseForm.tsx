"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Expense, type ExpenseInput } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import {
  MAX_DESCRIPTION,
  toExpenseInput,
  validateExpense,
  type ExpenseFormErrors,
  type ExpenseFormValues,
} from "@/lib/validation";

interface ExpenseFormProps {
  initial?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

function initialValues(expense?: Expense): ExpenseFormValues {
  return expense
    ? {
        date: expense.date,
        amount: expense.amount.toFixed(2),
        category: expense.category,
        description: expense.description,
      }
    : { date: todayISO(), amount: "", category: "", description: "" };
}

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<ExpenseFormValues>(() => initialValues(initial));
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ExpenseFormValues, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    // Re-validate live once the field has been touched.
    if (touched[key]) setErrors(validateExpense(next));
  };

  const blur = (key: keyof ExpenseFormValues) => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateExpense(values));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateExpense(values);
    setErrors(nextErrors);
    setTouched({ date: true, amount: true, category: true, description: true });
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(`expense-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    onSubmit(toExpenseInput(values));
  };

  const fieldError = (key: keyof ExpenseFormValues) => (touched[key] ? errors[key] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Amount" htmlFor="expense-amount" error={fieldError("amount")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">$</span>
            <input
              id="expense-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => update("amount", e.target.value.replace(/[^\d.]/g, ""))}
              onBlur={() => blur("amount")}
              aria-invalid={!!fieldError("amount")}
              aria-describedby={fieldError("amount") ? "expense-amount-error" : undefined}
              className={`input pl-7 tabular-nums ${fieldError("amount") ? "input-error" : ""}`}
            />
          </div>
        </Field>

        <Field label="Date" htmlFor="expense-date" error={fieldError("date")}>
          <input
            id="expense-date"
            type="date"
            max={todayISO()}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            onBlur={() => blur("date")}
            aria-invalid={!!fieldError("date")}
            aria-describedby={fieldError("date") ? "expense-date-error" : undefined}
            className={`input ${fieldError("date") ? "input-error" : ""}`}
          />
        </Field>
      </div>

      <fieldset>
        <legend className="label">Category</legend>
        <div
          id="expense-category"
          tabIndex={-1}
          className="mt-1.5 grid grid-cols-3 gap-2 outline-none"
          role="radiogroup"
          aria-invalid={!!fieldError("category")}
        >
          {CATEGORIES.map((c) => {
            const selected = values.category === c;
            return (
              <label
                key={c}
                className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition focus-within:ring-2 focus-within:ring-brand-500 ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={selected}
                  onChange={() => {
                    setTouched((t) => ({ ...t, category: true }));
                    update("category", c);
                  }}
                  className="sr-only"
                />
                <span className="text-lg" aria-hidden>
                  {CATEGORY_META[c].icon}
                </span>
                {c}
              </label>
            );
          })}
        </div>
        {fieldError("category") && <p className="field-error">{fieldError("category")}</p>}
      </fieldset>

      <Field label="Description" htmlFor="expense-description" error={fieldError("description")}>
        <input
          id="expense-description"
          placeholder="e.g. Weekly groceries"
          maxLength={MAX_DESCRIPTION + 20}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          onBlur={() => blur("description")}
          aria-invalid={!!fieldError("description")}
          aria-describedby={fieldError("description") ? "expense-description-error" : undefined}
          className={`input ${fieldError("description") ? "input-error" : ""}`}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {values.description.trim().length}/{MAX_DESCRIPTION}
        </p>
      </Field>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Saving…" : initial ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p id={`${htmlFor}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}
