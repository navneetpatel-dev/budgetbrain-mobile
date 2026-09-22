import { api } from '@/shared/services/api';
import type { Attachment, ReceiptExtraction } from '@/features/expenses/types/expenses.types';

export async function uploadReceipt(transactionId: string, uri: string, fileName: string, mimeType: string): Promise<Attachment> {
  const formData = new FormData();
  formData.append('receipt', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);

  const { data } = await api.post(`/expenses/${transactionId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
}

export async function fetchAttachments(transactionId: string): Promise<Attachment[]> {
  const { data } = await api.get(`/expenses/${transactionId}/attachments`);
  return data.data ?? [];
}

/**
 * Reads the backend's async OpenAI Vision extraction result for a receipt, if it has
 * finished by the time this is called (extraction is fire-and-forget after upload, so it
 * may not be ready yet — callers should treat a null `extractedData` as "not ready or
 * nothing usable found", not an error, and let the user retry rather than poll forever).
 */
export async function fetchAttachmentSuggestion(
  transactionId: string,
  attachmentId: string
): Promise<ReceiptExtraction | null> {
  const { data } = await api.get(`/expenses/${transactionId}/attachments/${attachmentId}/suggestion`);
  return data.data?.extractedData ?? null;
}

export async function deleteReceipt(transactionId: string, attachmentId: string): Promise<void> {
  await api.delete(`/expenses/${transactionId}/attachments/${attachmentId}`);
}
