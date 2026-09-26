"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Expense, ExpenseInput } from "@/types/expense";
import { STORAGE_KEY, loadExpenses, saveExpenses } from "@/lib/storage";

interface ExpensesContextValue {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (input: ExpenseInput) => Expense;
  addMany: (inputs: ExpenseInput[]) => void;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => Expense | undefined;
  restoreExpense: (expense: Expense) => void;
  /** Removes every expense and returns what was removed, so it can be restored. */
  clearAll: () => Expense[];
  restoreAll: (expenses: Expense[]) => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function build(input: ExpenseInput): Expense {
  const now = new Date().toISOString();
  return { ...input, id: newId(), createdAt: now, updatedAt: now };
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // If stored data was unreadable, don't overwrite it until the user makes a change.
  const skipNextSave = useRef(false);

  // Load once on mount (localStorage is only available in the browser).
  useEffect(() => {
    try {
      setExpenses(loadExpenses());
    } catch (err) {
      console.error(err);
      skipNextSave.current = true;
      setError("We couldn't read your saved expenses. Stored data may be corrupted.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist on every change once the initial load has finished.
  useEffect(() => {
    if (isLoading) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      saveExpenses(expenses);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Changes couldn't be saved. Your browser storage may be full or disabled.");
    }
  }, [expenses, isLoading]);

  // Keep multiple tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        setExpenses(loadExpenses());
      } catch {
        /* ignore malformed external writes */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addExpense = useCallback((input: ExpenseInput) => {
    const expense = build(input);
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const addMany = useCallback((inputs: ExpenseInput[]) => {
    setExpenses((prev) => [...inputs.map(build), ...prev]);
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e)),
    );
  }, []);

  const deleteExpense = useCallback(
    (id: string) => {
      const removed = expenses.find((e) => e.id === id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return removed;
    },
    [expenses],
  );

  const restoreExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => (prev.some((e) => e.id === expense.id) ? prev : [expense, ...prev]));
  }, []);

  const clearAll = useCallback(() => {
    const removed = expenses;
    setExpenses([]);
    return removed;
  }, [expenses]);

  const restoreAll = useCallback((restored: Expense[]) => {
    setExpenses((prev) => {
      const ids = new Set(prev.map((e) => e.id));
      return [...prev, ...restored.filter((e) => !ids.has(e.id))];
    });
  }, []);

  const value = useMemo(
    () => ({
      expenses,
      isLoading,
      error,
      addExpense,
      addMany,
      updateExpense,
      deleteExpense,
      restoreExpense,
      clearAll,
      restoreAll,
    }),
    [
      expenses,
      isLoading,
      error,
      addExpense,
      addMany,
      updateExpense,
      deleteExpense,
      restoreExpense,
      clearAll,
      restoreAll,
    ],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}
