/** Local calendar day helpers + feature-specific picker bounds. */

export function startOfLocalDay(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  if (!iso) return startOfLocalDay();
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return startOfLocalDay();
  return new Date(y, m - 1, d);
}

function addYears(from: Date, years: number): Date {
  return new Date(from.getFullYear() + years, from.getMonth(), from.getDate());
}

export type DateBoundSet = {
  minimumDate: Date;
  maximumDate: Date;
  min: string;
  max: string;
};

function bounds(minimumDate: Date, maximumDate: Date): DateBoundSet {
  const minD = minimumDate <= maximumDate ? minimumDate : maximumDate;
  const maxD = maximumDate >= minimumDate ? maximumDate : minimumDate;
  return {
    minimumDate: minD,
    maximumDate: maxD,
    min: toIsoDate(minD),
    max: toIsoDate(maxD),
  };
}

/** Keep an existing saved value selectable when editing older records. */
export function includeValueInBounds(b: DateBoundSet, value?: string | null): DateBoundSet {
  if (!value) return b;
  if (value < b.min) return bounds(parseIsoDate(value), b.maximumDate);
  if (value > b.max) return bounds(b.minimumDate, parseIsoDate(value));
  return b;
}

export const DateBounds = {
  /** Expenses & income — no future dates. */
  transaction(value?: string | null) {
    const today = startOfLocalDay();
    return includeValueInBounds(bounds(addYears(today, -10), today), value);
  },

  /** Investment purchase — historical only. */
  investmentPurchase(value?: string | null) {
    const today = startOfLocalDay();
    return includeValueInBounds(bounds(addYears(today, -50), today), value);
  },

  /** Goal target — today or future. */
  goalTarget(value?: string | null) {
    const today = startOfLocalDay();
    return includeValueInBounds(bounds(today, addYears(today, 50)), value);
  },

  /** Budget period start — slight past/future flexibility. */
  budgetStart(value?: string | null) {
    const today = startOfLocalDay();
    return includeValueInBounds(bounds(addYears(today, -2), addYears(today, 1)), value);
  },

  /** Custom budget end — on/after start, capped ahead. */
  budgetEnd(startIso?: string | null, value?: string | null) {
    const today = startOfLocalDay();
    const min = startIso ? parseIsoDate(startIso) : today;
    return includeValueInBounds(bounds(min, addYears(min, 5)), value);
  },

  /** Filter/report range start. */
  rangeFrom(toIso?: string | null, value?: string | null) {
    const today = startOfLocalDay();
    const max = toIso ? parseIsoDate(toIso) : today;
    return includeValueInBounds(bounds(addYears(today, -10), max), value);
  },

  /** Filter/report range end — not after today. */
  rangeTo(fromIso?: string | null, value?: string | null) {
    const today = startOfLocalDay();
    const min = fromIso ? parseIsoDate(fromIso) : addYears(today, -10);
    return includeValueInBounds(bounds(min, today), value);
  },
};
