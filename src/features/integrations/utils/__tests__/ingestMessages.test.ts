import { describe, expect, it } from '@jest/globals';
import { importSummary, ingestOutcome, previewSummary } from '../ingestMessages';

describe('ingest outcomes (T6.2)', () => {
  it('explains each result in plain words', () => {
    expect(ingestOutcome({ status: 'created', stage: null, reason: null, detected: null })).toEqual({ tone: 'success', text: 'Added to your transactions.' });
    expect(ingestOutcome({ status: 'needs_review', stage: null, reason: null, detected: null }).tone).toBe('info');
    expect(ingestOutcome({ status: 'ignored', stage: 'INELIGIBLE', reason: 'otp_marker', detected: null }).text).toMatch(/one-time password/);
    expect(ingestOutcome({ status: 'ignored', stage: 'INELIGIBLE', reason: 'something_new', detected: null }).text).toMatch(/didn't look like/);
  });
});

describe('statement summaries (T6.5)', () => {
  it('summarises a preview and a finished import', () => {
    expect(
      previewSummary({ format: 'csv', needsMapping: false, totalRows: 6, validRows: 5, possibleDuplicates: 1, alreadyImported: 0, dateRange: { from: '2026-09-01', to: '2026-09-20' }, errors: [] })
    ).toBe("5 of 6 rows can be imported · 2026-09-01 to 2026-09-20 · 1 look like transactions you have (they'll wait for review)");
    expect(importSummary({ totalRows: 6, created: 4, needsReview: 1, alreadyImported: 0, skippedDuplicates: 0, invalid: 1 })).toBe(
      "Import finished: 4 added, 1 waiting for review, 1 couldn't be read."
    );
  });
});
