"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="card flex flex-col items-center px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{error.message || "An unexpected error occurred."}</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
