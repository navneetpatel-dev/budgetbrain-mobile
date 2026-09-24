import type { ImportPreview, ImportResult, IngestResponse } from '../types/ingest.types';

/** User-facing outcomes for pasted messages and statement imports (plan T6.2, T6.5). Pure. */

export type Tone = 'success' | 'info' | 'error';

const IGNORE_REASONS: Record<string, string> = {
  unknown_sender: "We couldn't tell which bank sent this. Pick the bank and try again.",
  otp_marker: 'This looks like a one-time password, not a transaction.',
  promo_marker: 'This looks like an offer or advert, not a transaction.',
  failed_or_declined: 'This payment failed or was declined, so nothing was spent.',
  non_transaction_notice: 'This is a notice from the bank, not a transaction.',
  future_or_request: 'This is a payment request or a scheduled payment, not a completed one.',
  no_money_token: "We couldn't find an amount in this message.",
  no_amount: "We couldn't find an amount in this message.",
  no_movement_wording: "We couldn't tell whether money went out or came in.",
  kill_switch: 'Detection for this bank is paused right now.',
  future_date: 'The date in this message is in the future.',
  invalid_date: 'The date in this message is too old or not valid.',
};

export function ingestOutcome(result: IngestResponse): { tone: Tone; text: string } {
  switch (result.status) {
    case 'created':
      return { tone: 'success', text: 'Added to your transactions.' };
    case 'needs_review':
      return { tone: 'info', text: 'Found a transaction. It is waiting for you in Review.' };
    case 'already_synced':
      return { tone: 'info', text: 'You already have this transaction.' };
    case 'validation_error':
      return { tone: 'error', text: "The details in this message didn't pass our checks." };
    default:
      return {
        tone: 'error',
        text: (result.reason && IGNORE_REASONS[result.reason]) ?? "This message didn't look like a completed bank transaction.",
      };
  }
}

export function previewSummary(preview: ImportPreview): string {
  const parts = [`${preview.validRows} of ${preview.totalRows} rows can be imported`];
  if (preview.dateRange) parts.push(`${preview.dateRange.from} to ${preview.dateRange.to}`);
  if (preview.alreadyImported) parts.push(`${preview.alreadyImported} already imported`);
  if (preview.possibleDuplicates) parts.push(`${preview.possibleDuplicates} look like transactions you have (they'll wait for review)`);
  return parts.join(' · ');
}

export function importSummary(result: ImportResult): string {
  const parts = [`${result.created} added`];
  if (result.needsReview) parts.push(`${result.needsReview} waiting for review`);
  if (result.alreadyImported) parts.push(`${result.alreadyImported} already imported`);
  if (result.skippedDuplicates) parts.push(`${result.skippedDuplicates} skipped`);
  if (result.invalid) parts.push(`${result.invalid} couldn't be read`);
  return `Import finished: ${parts.join(', ')}.`;
}
