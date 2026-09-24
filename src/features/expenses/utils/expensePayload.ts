import type { ExpenseForm } from '@/features/expenses/types/expenses.types';

// A type alias (not an interface) so it stays assignable to Record<string, unknown> for the offline queue.
export type ExpensePayload = {
  type: ExpenseForm['kind'];
  amount: number;
  merchant?: string;
  notes?: string;
  categoryId?: string;
  paymentMethod: string;
  date: string;
  tags?: string[];
  direction?: 'DEBIT' | 'CREDIT';
};

export type ExpensePayloadResult =
  | { ok: true; payload: ExpensePayload }
  | { ok: false; field: 'categoryId' | 'amount' };

/**
 * Maps the add-expense form to the `/expenses` create payload.
 * - Expense: category required (matches the backend validator).
 * - Refund: money back on a purchase; the category is optional but recommended, so the refund
 *   nets against that category's spending.
 * - Transfer: between the user's own accounts; no category, and the direction says whether money
 *   left or entered this account.
 */
export function buildExpensePayload(data: ExpenseForm): ExpensePayloadResult {
  const amount = Number(data.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, field: 'amount' };
  if (data.kind === 'expense' && !data.categoryId) return { ok: false, field: 'categoryId' };

  const payload: ExpensePayload = {
    type: data.kind,
    amount,
    merchant: data.merchant || undefined,
    notes: data.notes || undefined,
    categoryId: data.kind === 'transfer' ? undefined : data.categoryId || undefined,
    paymentMethod: data.paymentMethod,
    date: data.date,
    tags: data.tags?.length ? data.tags : undefined,
  };
  if (data.kind === 'transfer') payload.direction = data.direction;
  return { ok: true, payload };
}
