import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

// ThemeContext imports the Redux hooks (ESM react-redux, not transformed by jest-expo); use the
// real theme builder directly instead.
jest.mock('@/shared/theme', () => {
  const { buildTheme } = jest.requireActual<typeof import('@/shared/theme/buildTheme')>('@/shared/theme/buildTheme');
  const { DEFAULT_ACCENT } = jest.requireActual<typeof import('@/shared/theme/palettes')>('@/shared/theme/palettes');
  const theme = buildTheme('light', DEFAULT_ACCENT, 'light');
  return { useTheme: () => theme };
});

import { formatCurrency } from '@/shared/utils/currency';
import { DetectedTransactionRow } from '../review/DetectedTransactionRow.component';
import type { DetectedTransactionDto } from '../../types/transactionDetection.types';

const base: DetectedTransactionDto = {
  id: 'd1',
  // The server returns DECIMAL columns as strings; the old row called .toFixed on it and crashed.
  amount: '1250.50',
  currency: 'INR',
  direction: 'DEBIT',
  transactionType: 'expense',
  subtype: null,
  paymentMethod: 'upi',
  merchant: 'Swiggy',
  categoryId: 'c1',
  categoryName: 'Food',
  financialAccountId: null,
  financialAccountName: null,
  accountTail: '1234',
  referenceNumber: null,
  institutionId: 'in.hdfc_bank',
  transactionDate: '2026-09-23',
  confidenceTier: 'medium',
  reviewReason: 'medium_confidence',
  status: 'pending_review',
  source: 'android_sms',
  createdTransactionId: null,
  createdAt: '2026-09-23T10:00:00.000Z',
};

describe('DetectedTransactionRow', () => {
  it('renders a string amount, the category name and the review reason (gap P0-7)', async () => {
    await render(<DetectedTransactionRow transaction={base} onConfirm={jest.fn()} onDismiss={jest.fn()} />);
    // Formatted with the app's own currency rules (INR shows no decimals).
    expect(screen.getByText(`−${formatCurrency(1250.5, 'INR')}`)).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Some details could not be confirmed')).toBeTruthy();
  });

  it('shows refunds as money in and transfers as neutral', async () => {
    await render(
      <DetectedTransactionRow
        transaction={{ ...base, direction: 'CREDIT', transactionType: 'refund' }}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />
    );
    expect(screen.getByText(/^\+/)).toBeTruthy();
    await render(
      <DetectedTransactionRow transaction={{ ...base, transactionType: 'transfer' }} onConfirm={jest.fn()} onDismiss={jest.fn()} />
    );
    expect(screen.getByText(/^⇄/)).toBeTruthy();
  });

  it('only confirms through the Add button, never by tapping the card (gap R2)', async () => {
    const onConfirm = jest.fn();
    await render(<DetectedTransactionRow transaction={base} onConfirm={onConfirm} onDismiss={jest.fn()} />);
    fireEvent.press(screen.getByText('Swiggy'));
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.press(screen.getByLabelText('Add detected transaction'));
    expect(onConfirm).toHaveBeenCalledWith('d1');
  });
});
