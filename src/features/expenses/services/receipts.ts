import { api } from '@/shared/services/api';

export interface Attachment {
  id: string;
  transactionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Url: string;
  createdAt: string;
}

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

export async function deleteReceipt(transactionId: string, attachmentId: string): Promise<void> {
  await api.delete(`/expenses/${transactionId}/attachments/${attachmentId}`);
}
