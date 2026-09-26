import { CATEGORY_META } from "@/lib/categories";
import type { Category } from "@/types/expense";

export function CategoryBadge({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span aria-hidden>{meta.icon}</span>
      {category}
    </span>
  );
}

export function CategoryIcon({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
      style={{ backgroundColor: `${meta.color}1a` }}
      aria-hidden
    >
      {meta.icon}
    </span>
  );
}
