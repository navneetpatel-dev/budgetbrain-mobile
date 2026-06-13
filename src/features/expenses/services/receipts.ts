import { api } from '@/src/shared/services/api';

export async function uploadReceipt(transactionId: string, uri: string, fileName: string, mimeType: string) {
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
