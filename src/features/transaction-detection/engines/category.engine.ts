import type { LearnedMerchantRule } from '../types/transactionDetection.types';

export interface CategoryResolutionResult {
  categoryId: string | null;
  categoryName: string;
  source: 'user_rule' | 'merchant_catalog' | 'context_keyword' | 'fallback';
}

interface AvailableCategory {
  id: string;
  name: string;
}

const CONTEXT_CATEGORY_RULES: { keywords: RegExp[]; categoryName: string }[] = [
  { keywords: [/\bfuel\b/i, /\bpetrol\b/i, /\bdiesel\b/i, /\bcng\b/i], categoryName: 'Fuel' },
  { keywords: [/\bpharmacy\b/i, /\bmedicine\b/i, /\bhospital\b/i, /\bclinic\b/i], categoryName: 'Health' },
  { keywords: [/\bcinema\b/i, /\bmovie\b/i, /\btheatre\b/i], categoryName: 'Entertainment' },
  { keywords: [/\bflight\b/i, /\bairline\b/i, /\bhotel\b/i], categoryName: 'Travel' },
  { keywords: [/\belectricity\b/i, /\bbescom\b/i, /\bwater\s*bill\b/i], categoryName: 'Utilities' },
];

export function resolveCategory(
  normalizedMerchant: string | null,
  categoryHint: string | null,
  content: string,
  userRules: Record<string, LearnedMerchantRule>,
  availableCategories: AvailableCategory[]
): CategoryResolutionResult {
  // Helper to find category ID by matching name
  const findCategoryId = (name: string): string | null => {
    const target = name.toLowerCase();
    const found = availableCategories.find(
      (c) => c.name.toLowerCase() === target || c.name.toLowerCase().includes(target)
    );
    return found ? found.id : null;
  };

  // Tier 1: User-Specific Learned Rules (Highest Priority)
  if (normalizedMerchant) {
    const userRule = userRules[normalizedMerchant.toLowerCase()];
    if (userRule) {
      return {
        categoryId: userRule.categoryId,
        categoryName: userRule.categoryName || 'Custom',
        source: 'user_rule',
      };
    }
  }

  // Tier 2: Known Merchant Catalog Hint
  if (categoryHint) {
    const catId = findCategoryId(categoryHint);
    return {
      categoryId: catId,
      categoryName: categoryHint,
      source: 'merchant_catalog',
    };
  }

  // Tier 3: Transaction / Message Context Keywords
  for (const rule of CONTEXT_CATEGORY_RULES) {
    if (rule.keywords.some((kw) => kw.test(content))) {
      const catId = findCategoryId(rule.categoryName);
      return {
        categoryId: catId,
        categoryName: rule.categoryName,
        source: 'context_keyword',
      };
    }
  }

  // Tier 4: Fallback
  const fallbackCatId = findCategoryId('Other') || findCategoryId('General');
  return {
    categoryId: fallbackCatId,
    categoryName: 'Other',
    source: 'fallback',
  };
}
