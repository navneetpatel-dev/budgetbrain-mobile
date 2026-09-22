import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import type { Receipt } from '@/features/expenses/types/expenses.types';

export function useReceiptPicker() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setReceipt({
        uri: asset.uri,
        name: asset.fileName ?? 'receipt.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      });
    }
  };

  const clear = () => setReceipt(null);

  return { receipt, pick, clear };
}
