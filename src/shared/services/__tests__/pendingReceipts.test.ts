import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockFiles = new Map<string, number>();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///document/',
  getInfoAsync: jest.fn(async (uri: string) => {
    const size = mockFiles.get(uri);
    return size === undefined ? { exists: false } : { exists: true, size, uri };
  }),
  copyAsync: jest.fn(async ({ from, to }: { from: string; to: string }) => {
    const size = mockFiles.get(from);
    if (size !== undefined) mockFiles.set(to, size);
  }),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  queuePendingReceiptUpload,
  takePendingReceiptUpload,
  ReceiptTooLargeError,
} from '../pendingReceipts';

describe('pendingReceipts', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockFiles.clear();
  });

  it('queues a receipt captured offline instead of dropping it', async () => {
    mockFiles.set('file:///cache/receipt.jpg', 1024);

    await queuePendingReceiptUpload('queue-1', {
      uri: 'file:///cache/receipt.jpg',
      name: 'receipt.jpg',
      type: 'image/jpeg',
    });

    const taken = await takePendingReceiptUpload('queue-1');
    expect(taken).not.toBeNull();
    expect(taken?.name).toBe('receipt.jpg');
    // Copied into the persistent document directory, not left at the original cache uri.
    expect(taken?.localUri).toBe('file:///document/pending-receipt-queue-1.jpg');
  });

  it('copies the file into the persistent document directory so it survives cache eviction', async () => {
    mockFiles.set('file:///cache/receipt.png', 2048);

    await queuePendingReceiptUpload('queue-2', {
      uri: 'file:///cache/receipt.png',
      name: 'receipt.png',
      type: 'image/png',
    });

    // The persistent copy must actually exist at the new location, not just be a renamed
    // reference to the (evictable) cache-directory original.
    expect(mockFiles.has('file:///document/pending-receipt-queue-2.png')).toBe(true);
  });

  it('rejects an oversized receipt with a visible error instead of silently dropping it', async () => {
    mockFiles.set('file:///cache/huge.jpg', 9 * 1024 * 1024);

    await expect(
      queuePendingReceiptUpload('queue-3', {
        uri: 'file:///cache/huge.jpg',
        name: 'huge.jpg',
        type: 'image/jpeg',
      })
    ).rejects.toBeInstanceOf(ReceiptTooLargeError);

    // Nothing was queued for this id — the caller is responsible for surfacing the error,
    // not this function silently swallowing it and queuing anyway.
    expect(await takePendingReceiptUpload('queue-3')).toBeNull();
  });

  it('returns null for a queue id with no pending receipt (e.g. an expense saved with no attachment)', async () => {
    expect(await takePendingReceiptUpload('never-queued')).toBeNull();
  });

  it('take removes the entry so it is not uploaded twice on a retry', async () => {
    mockFiles.set('file:///cache/once.jpg', 512);
    await queuePendingReceiptUpload('queue-4', {
      uri: 'file:///cache/once.jpg',
      name: 'once.jpg',
      type: 'image/jpeg',
    });

    expect(await takePendingReceiptUpload('queue-4')).not.toBeNull();
    expect(await takePendingReceiptUpload('queue-4')).toBeNull();
  });
});
