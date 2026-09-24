/** Server shapes for pasted messages and statement files (backend `/detected-transactions`, plan T6.2, T6.5). */

export type PasteKind = 'sms' | 'email';

export interface IngestRequest {
  kind: PasteKind;
  text: string;
  sender?: string | null;
  subject?: string | null;
  institutionId?: string | null;
}

export interface IngestResponse {
  status: 'created' | 'needs_review' | 'already_synced' | 'ignored' | 'validation_error';
  stage: string | null;
  reason: string | null;
  detected: { id: string; amount: string; currency: string; merchant: string | null } | null;
}

export interface Institution {
  id: string;
  name: string;
  country: string;
}

export interface StatementFile {
  uri: string;
  name: string;
  mimeType: string;
}

export interface ImportPreview {
  format: string;
  needsMapping: boolean;
  totalRows: number;
  validRows: number;
  possibleDuplicates: number;
  alreadyImported: number;
  dateRange: { from: string; to: string } | null;
  errors: { line: number; error: string }[];
}

export interface ImportResult {
  totalRows: number;
  created: number;
  needsReview: number;
  alreadyImported: number;
  skippedDuplicates: number;
  invalid: number;
}
