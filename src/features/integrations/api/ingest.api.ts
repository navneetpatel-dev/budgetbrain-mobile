import { api, apiGet, apiPost } from '@/shared/services/api';
import type { ApiResponse } from '@/shared/types';
import type { ImportPreview, ImportResult, IngestRequest, IngestResponse, Institution, StatementFile } from '../types/ingest.types';

const BASE = '/detected-transactions';

/** A pasted bank SMS or email; the server parses it and keeps only the extracted fields (T6.2). */
export async function ingestMessage(request: IngestRequest): Promise<IngestResponse> {
  return await apiPost<IngestResponse>(`${BASE}/ingest`, request);
}

export async function fetchInstitutions(): Promise<Institution[]> {
  return await apiGet<Institution[]>(`${BASE}/institutions`);
}

function statementForm(file: StatementFile): FormData {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob);
  form.append('options', JSON.stringify({ includePossibleDuplicates: true }));
  return form;
}

/** What importing this statement would do; nothing is written (T6.5). */
export async function previewStatement(file: StatementFile): Promise<ImportPreview> {
  const res = await api.post<ApiResponse<ImportPreview>>(`${BASE}/import/preview`, statementForm(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function importStatement(file: StatementFile): Promise<ImportResult> {
  const res = await api.post<ApiResponse<ImportResult>>(`${BASE}/import`, statementForm(file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}
