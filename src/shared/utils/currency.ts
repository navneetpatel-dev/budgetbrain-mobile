import { toSafeNumber } from './number';

/**
 * The 6 currencies requirements.md's Multi Currency Support asks for. Locale drives both
 * digit grouping and decimal precision (Intl.NumberFormat's `style: 'currency'` derives the
 * symbol from `currency` + `locale` itself, so we only need to pin locale/decimals here).
 */
interface CurrencyConfig {
  locale: string;
  decimals: number;
}

const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  INR: { locale: 'en-IN', decimals: 0 },
  USD: { locale: 'en-US', decimals: 2 },
  EUR: { locale: 'en-IE', decimals: 2 },
  GBP: { locale: 'en-GB', decimals: 2 },
  AED: { locale: 'en-AE', decimals: 2 },
  SGD: { locale: 'en-SG', decimals: 2 },
};

const DEFAULT_CONFIG: CurrencyConfig = { locale: 'en-US', decimals: 2 };

/**
 * ICU's default symbol for a currency is sometimes ambiguous out of local context —
 * e.g. `en-SG` renders SGD as a bare "$", indistinguishable from USD in a multi-currency
 * UI. Override only where that ambiguity is real; every other currency uses Intl's own
 * locale-correct symbol rather than a hardcoded table.
 */
const SYMBOL_OVERRIDES: Record<string, string> = {
  SGD: 'S$',
};

function configFor(currency: string): CurrencyConfig {
  return CURRENCY_CONFIG[currency] ?? DEFAULT_CONFIG;
}

/** Currency symbol alone (e.g. for form field labels) — derived from Intl, not hardcoded per-currency. */
export function getCurrencySymbol(currency: string): string {
  if (SYMBOL_OVERRIDES[currency]) return SYMBOL_OVERRIDES[currency];
  const { locale } = configFor(currency);
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? `${currency} `;
  } catch {
    return `${currency} `;
  }
}

/**
 * Full currency formatting: symbol + correct decimal precision + correct digit grouping
 * for the given currency, per requirements.md (INR/USD/EUR/GBP/AED/SGD). Never used to
 * convert between currencies — conversion is money math and stays server-side (MOBILE
 * doc §12); this only formats whatever amount the API already returned.
 */
export function formatCurrency(amount: unknown, currency: string): string {
  const safe = toSafeNumber(amount);
  const { locale, decimals } = configFor(currency);
  const override = SYMBOL_OVERRIDES[currency];
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    if (!override) return formatter.format(safe);
    // Swap in the disambiguated symbol (e.g. ICU's bare "$" -> "S$") without touching grouping/decimals.
    return formatter
      .formatToParts(safe)
      .map((part) => (part.type === 'currency' ? override : part.value))
      .join('');
  } catch {
    // Intl throws on an unrecognized ISO currency code — fall back to a plain grouped number.
    return `${getCurrencySymbol(currency)}${safe.toLocaleString(locale, { maximumFractionDigits: decimals })}`;
  }
}

export function formatCurrencyParts(
  amount: unknown,
  currency: string
): { integerPart: string; fractionPart: string } {
  const safe = toSafeNumber(amount);
  const { locale, decimals } = configFor(currency);
  const override = SYMBOL_OVERRIDES[currency];
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const parts = formatter.formatToParts(safe);
    let integerPart = '';
    let fractionPart = '';
    let foundDecimal = false;
    for (const part of parts) {
      const val = part.type === 'currency' && override ? override : part.value;
      if (part.type === 'decimal') {
        foundDecimal = true;
        fractionPart += val;
      } else if (foundDecimal) {
        fractionPart += val;
      } else {
        integerPart += val;
      }
    }
    return { integerPart, fractionPart };
  } catch {
    const formatted = formatCurrency(amount, currency);
    return { integerPart: formatted, fractionPart: '' };
  }
}
