import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_KEY = 'pendingReceiptUploads';
const MAX_RECEIPT_SIZE_BYTES = 8 * 1024 * 1024;

export interface PendingReceipt {
  clientQueueId: string;
  localUri: string;
  name: string;
  type: string;
}

interface ReceiptLike {
  uri: string;
  name: string;
  type: string;
}

export class ReceiptTooLargeError extends Error {
  constructor(public readonly sizeBytes: number) {
    super(
      `Receipt is too large to save offline (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB, max 8MB).`
    );
  }
}

async function readAll(): Promise<PendingReceipt[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PendingReceipt[];
  } catch {
    return [];
  }
}

async function writeAll(receipts: PendingReceipt[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

/**
 * Copies a receipt image into the app's persistent document directory (not the cache
 * directory the picker may have used, which the OS can evict under storage pressure) and
 * queues it for upload once the transaction it belongs to has synced. Kept in its own
 * AsyncStorage key, not the main Redux-Persist blob, so a binary receipt never risks that
 * store's size quota. Throws ReceiptTooLargeError rather than silently dropping an
 * oversized file — callers must surface this to the user, not swallow it.
 */
export async function queuePendingReceiptUpload(
  clientQueueId: string,
  receipt: ReceiptLike
): Promise<void> {
  const info = await FileSystem.getInfoAsync(receipt.uri);
  if (info.exists && info.size > MAX_RECEIPT_SIZE_BYTES) {
    throw new ReceiptTooLargeError(info.size);
  }

  const documentDirectory = FileSystem.documentDirectory;
  const receipts = await readAll();

  if (!documentDirectory) {
    // No persistent directory available on this platform/environment — reference the
    // original uri directly rather than failing the whole offline expense save.
    receipts.push({ clientQueueId, localUri: receipt.uri, name: receipt.name, type: receipt.type });
    await writeAll(receipts);
    return;
  }

  const extension = receipt.name.includes('.')
    ? receipt.name.slice(receipt.name.lastIndexOf('.'))
    : '';
  const persistentUri = `${documentDirectory}pending-receipt-${clientQueueId}${extension}`;
  await FileSystem.copyAsync({ from: receipt.uri, to: persistentUri });

  receipts.push({ clientQueueId, localUri: persistentUri, name: receipt.name, type: receipt.type });
  await writeAll(receipts);
}

/** Removes and returns the pending receipt queued for a given client-side queue id, if any. */
export async function takePendingReceiptUpload(clientQueueId: string): Promise<PendingReceipt | null> {
  const receipts = await readAll();
  const index = receipts.findIndex((r) => r.clientQueueId === clientQueueId);
  if (index === -1) return null;
  const [receipt] = receipts.splice(index, 1);
  await writeAll(receipts);
  return receipt;
}
