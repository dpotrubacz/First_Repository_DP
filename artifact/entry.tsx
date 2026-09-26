import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/AppShell";
import { Modal } from "@/components/Modal";
import DashboardPage from "@/app/page";
import { ExpensesView } from "@/app/expenses/ExpensesView";
import { usePathname } from "./shims/next-navigation";
import { CSV_EVENT } from "./shims/csv";

function Routes() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return pathname === "/expenses" ? <ExpensesView /> : <DashboardPage />;
}

interface CsvDetail {
  csv: string;
  filename: string;
  count: number;
}

function CsvDialog() {
  const [detail, setDetail] = useState<CsvDetail | null>(null);
  const [copied, setCopied] = useState<"idle" | "copied" | "select">("idle");
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onCsv = (e: Event) => {
      setDetail((e as CustomEvent<CsvDetail>).detail);
      setCopied("idle");
    };
    window.addEventListener(CSV_EVENT, onCsv);
    return () => window.removeEventListener(CSV_EVENT, onCsv);
  }, []);

  const copy = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.csv.replace(/^﻿/, ""));
      setCopied("copied");
    } catch {
      textRef.current?.select();
      setCopied("select");
    }
  };

  return (
    <Modal
      open={detail !== null}
      onClose={() => setDetail(null)}
      title="Export CSV"
      description={
        detail
          ? `${detail.count} expense${detail.count === 1 ? "" : "s"}. Copy the text below and paste it into a spreadsheet or save it as ${detail.filename}.`
          : undefined
      }
    >
      {detail && (
        <div className="space-y-4">
          <textarea
            id="csv-output"
            ref={textRef}
            readOnly
            value={detail.csv}
            aria-label="CSV data"
            rows={10}
            className="input resize-none font-mono text-xs"
          />
          {copied === "select" && (
            <p className="text-xs text-slate-500">Your browser blocked copying. The text is selected, so press Ctrl+C (⌘C on Mac).</p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDetail(null)} className="btn-secondary">
              Close
            </button>
            <button type="button" onClick={copy} className="btn-primary">
              {copied === "copied" ? "Copied" : "Copy CSV"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

createRoot(document.getElementById("root")!).render(
  <AppShell>
    <Routes />
    <CsvDialog />
  </AppShell>,
);
