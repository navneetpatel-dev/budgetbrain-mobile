/** Coerces API / form values to a finite number; falls back to 0 for NaN, null, undefined. */
export function toSafeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Safe percentage 0–100 for progress bars. */
export function toSafePercent(numerator: unknown, denominator: unknown): number {
  const num = toSafeNumber(numerator);
  const den = toSafeNumber(denominator);
  if (den <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((num / den) * 100)));
}
