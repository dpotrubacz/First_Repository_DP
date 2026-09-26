"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Expense, ExpenseInput } from "@/types/expense";
import { ExpensesProvider, useExpenses } from "@/hooks/useExpenses";
import { ToastProvider, useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/format";
import { ExpenseForm } from "./ExpenseForm";
import { Modal } from "./Modal";

interface ExpenseModalContextValue {
  openCreate: () => void;
  openEdit: (expense: Expense) => void;
}

const ExpenseModalContext = createContext<ExpenseModalContextValue | null>(null);

export function useExpenseModal(): ExpenseModalContextValue {
  const ctx = useContext(ExpenseModalContext);
  if (!ctx) throw new Error("useExpenseModal must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ExpensesProvider>
        <ShellInner>{children}</ShellInner>
      </ExpensesProvider>
    </ToastProvider>
  );
}

type ModalState = { mode: "closed" } | { mode: "create" } | { mode: "edit"; expense: Expense };

function ShellInner({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const { addExpense, updateExpense, error } = useExpenses();
  const { toast } = useToast();

  const openCreate = useCallback(() => setModal({ mode: "create" }), []);
  const openEdit = useCallback((expense: Expense) => setModal({ mode: "edit", expense }), []);
  const close = useCallback(() => setModal({ mode: "closed" }), []);

  const handleSubmit = (input: ExpenseInput) => {
    if (modal.mode === "edit") {
      updateExpense(modal.expense.id, input);
      toast("Expense updated.");
    } else {
      addExpense(input);
      toast(`Added ${formatCurrency(input.amount)} for ${input.description}.`);
    }
    close();
  };

  return (
    <ExpenseModalContext.Provider value={{ openCreate, openEdit }}>
      <div className="min-h-screen">
        <Navbar onAdd={openCreate} />
        {error && (
          <div role="alert" className="border-b border-red-200 bg-red-50">
            <p className="mx-auto max-w-6xl px-4 py-2.5 text-sm text-red-700 sm:px-6">{error}</p>
          </div>
        )}
        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-8">{children}</main>
        <MobileNav onAdd={openCreate} />
      </div>
      <Modal
        open={modal.mode !== "closed"}
        onClose={close}
        title={modal.mode === "edit" ? "Edit expense" : "New expense"}
        description={modal.mode === "edit" ? "Update the details below." : "Record a purchase to keep your budget on track."}
      >
        {modal.mode !== "closed" && (
          <ExpenseForm
            key={modal.mode === "edit" ? modal.expense.id : "new"}
            initial={modal.mode === "edit" ? modal.expense : undefined}
            onSubmit={handleSubmit}
            onCancel={close}
          />
        )}
      </Modal>
    </ExpenseModalContext.Provider>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/expenses", label: "Expenses", icon: ListIcon },
];

function Navbar({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Zm0 0 2-3h14l2 3M16 13h2" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">Spendwise</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <button type="button" onClick={onAdd} className="btn-primary hidden sm:inline-flex">
          <PlusIcon /> Add expense
        </button>
      </div>
    </header>
  );
}

function MobileNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-3 items-center">
        {NAV_ITEMS.slice(0, 1).map((item) => (
          <MobileNavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onAdd}
            aria-label="Add expense"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition active:scale-95"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        </div>
        {NAV_ITEMS.slice(1).map((item) => (
          <MobileNavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: () => JSX.Element;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${active ? "text-brand-600" : "text-slate-500"}`}
    >
      <Icon />
      {label}
    </Link>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h6v6H4zM14 5h6v4h-6zM14 13h6v6h-6zM4 15h6v4H4z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}
