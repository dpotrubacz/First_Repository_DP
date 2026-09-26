# Spendwise — Expense Tracker

A modern personal expense tracker built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Data is stored in your browser's `localStorage`, so it needs no backend or account.

## Features

- **Add, edit, and delete expenses** with date, amount, category, and description
- **Form validation**: required fields, positive amounts with at most 2 decimals, no future dates, and a length limit on descriptions. Errors show inline as you type.
- **Date picker** (native, works on desktop and mobile) and **USD currency formatting**
- **Dashboard** with:
  - Summary cards: this month (with % change vs. last month), total spending, daily average, and top category
  - Monthly spending bar chart for the last 6 months, with an average line
  - Category donut chart with a breakdown legend
  - Recent expenses
- **Expense list** with search, category filter, date range (plus quick presets), sorting, running totals, and "show more" pagination
- **CSV export** of the currently filtered expenses. The file opens in Excel with UTF-8 support and is protected against formula injection.
- **Undo** after deleting, toast notifications, confirm dialogs, loading skeletons, empty states, and storage error banners
- **Responsive**, with a bottom tab bar and a floating add button on mobile
- Sync across browser tabs, plus a **sample data** loader for trying the app out

## Getting started

Requirements: Node.js 18.17+ (Node 20+ recommended).

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Quality checks:

```bash
npm run lint
npm run typecheck
```

## Testing the features manually

1. **Empty state**: open http://localhost:3000. You'll see an onboarding card.
2. **Validation**: click **Add expense** and submit the empty form. Each field shows an error. Try an amount like `12.345` or a future date to see the specific messages.
3. **Add**: fill in an amount, pick a category, enter a description, and submit. A toast confirms it, and the dashboard cards and charts update.
4. **Sample data**: to try the analytics quickly, clear storage (DevTools → Application → Local Storage → delete `expense-tracker:expenses:v1`), reload, and click **Load sample data** (~3 months of expenses).
5. **Dashboard**: hover the donut segments or legend rows and the monthly bars to see values.
6. **Edit**: hover a row (always visible on mobile) and click the pencil icon. Change fields and click **Save changes**.
7. **Delete + Undo**: click the trash icon, confirm, then click **Undo** in the toast.
8. **Filters**: go to **Expenses**. Search for "coffee", choose a category, pick a start and end date or a preset like *Last 30 days*, and change the sort order. The header shows the count and total of the matching expenses.
9. **Export**: click **Export CSV**. The downloaded file contains only the filtered expenses.
10. **Persistence**: reload the page. Everything is still there. Open a second tab, and changes sync between them.
11. **Mobile**: use DevTools device mode (e.g. iPhone 14). Navigation moves to a bottom bar and the form opens as a bottom sheet.

## Project structure

```
src/
  app/
    layout.tsx            Root layout (wraps everything in AppShell)
    page.tsx              Dashboard
    expenses/             Expense list page (search, filters, export)
    error.tsx, not-found.tsx
  components/             UI: AppShell/nav, ExpenseForm, ExpenseList, filters, charts, modal, cards
  hooks/
    useExpenses.tsx       Context + localStorage persistence (add/update/delete/restore)
    useToast.tsx          Toast notifications
    useDeleteExpense.tsx  Confirm + undo delete flow
  lib/
    analytics.ts          Filtering, sorting, totals, monthly/category aggregation
    validation.ts         Form validation rules
    csv.ts                CSV generation and download
    format.ts             Currency and timezone-safe date helpers
    storage.ts            localStorage read/write with schema checks
    sampleData.ts         Demo data generator
  types/expense.ts        Shared types and categories
```

## Notes

- Amounts are summed in cents to avoid floating-point drift.
- Dates are stored as `YYYY-MM-DD` and parsed as local dates, so there are no off-by-one timezone bugs.
- If stored data can't be parsed, the app shows an error and won't overwrite it until you make a change.
