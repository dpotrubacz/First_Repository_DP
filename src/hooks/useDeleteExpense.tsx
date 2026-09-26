"use client";

import { useState } from "react";
import type { Expense } from "@/types/expense";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { formatCurrency } from "@/lib/format";
import { useExpenses } from "./useExpenses";
import { useToast } from "./useToast";

/** Confirm-then-delete flow with an "Undo" toast. Render `dialog` somewhere in the tree. */
export function useDeleteExpense() {
  const { deleteExpense, restoreExpense } = useExpenses();
  const { toast } = useToast();
  const [pending, setPending] = useState<Expense | null>(null);

  const confirm = () => {
    if (!pending) return;
    const removed = deleteExpense(pending.id);
    setPending(null);
    if (removed) {
      toast(`Deleted "${removed.description}".`, {
        variant: "info",
        action: { label: "Undo", onClick: () => restoreExpense(removed) },
      });
    }
  };

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title="Delete expense?"
      message={
        pending
          ? `"${pending.description}" (${formatCurrency(pending.amount)}) will be permanently removed.`
          : ""
      }
      onConfirm={confirm}
      onCancel={() => setPending(null)}
    />
  );

  return { requestDelete: setPending, dialog };
}
