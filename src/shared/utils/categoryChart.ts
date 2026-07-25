/** Shared category breakdown helpers for dashboard charts. */

export type CategoryChartInput = {
  categoryId: string;
  total: string | number;
  category?: { name?: string | null; color?: string | null } | null;
};

export type CategoryChartItem = {
  id: string;
  name: string;
  total: number;
  color: string;
  pct: number;
};

const FALLBACK_COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function buildCategoryChartItems(
  data: CategoryChartInput[],
  limit = 6,
): CategoryChartItem[] {
  const sorted = [...data]
    .map((item, index) => ({
      id: item.categoryId,
      name: item.category?.name ?? 'Other',
      total: Number(item.total) || 0,
      color: item.category?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  const sum = sorted.reduce((s, d) => s + d.total, 0) || 1;

  return sorted.map((item) => ({
    ...item,
    pct: Math.round((item.total / sum) * 100),
  }));
}
