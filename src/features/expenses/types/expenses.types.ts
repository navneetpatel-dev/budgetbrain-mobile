/** What the user is logging from the add-expense screen (spec §8–12). */
export type ExpenseKind = 'expense' | 'refund' | 'transfer';

export interface ExpenseForm {
  kind: ExpenseKind;
  /** Transfers only: money leaving (DEBIT) or entering (CREDIT) the account. */
  direction: 'DEBIT' | 'CREDIT';
  amount: string;
  merchant: string;
  notes: string;
  categoryId: string;
  paymentMethod: string;
  date: string;
  tags: string[];
}

export type CreateExpenseResult =
  | { ok: true; offline: boolean }
  | { ok: false; error: 'validation' | 'offline' | 'unknown' };

export interface Receipt {
  uri: string;
  name: string;
  type: string;
}

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Url: string;
  createdAt: string;
}

export interface ReceiptExtraction {
  merchant?: string;
  amount?: number;
  date?: string;
  confidence: number;
}
