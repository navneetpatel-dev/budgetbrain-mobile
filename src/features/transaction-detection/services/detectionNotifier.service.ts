import { Platform } from 'react-native';
import type { DetectionContext, SyncFlushSummary } from '../types/transactionDetection.types';

/**
 * One grouped notification per sync run (plan T2.12). Counts only: amounts and merchants stay
 * off the lock screen, and the Android channel is private (gap P6). Loads expo-notifications
 * directly, so the headless drain doesn't pull in the push-registration code and its API client.
 */
export const DETECTION_CHANNEL_ID = 'detection';

let channelReady = false;

type SummaryCounts = Pick<SyncFlushSummary, 'created' | 'needsReview'> & { reviewIds: string[] };

/** The notification's text and data, or null when the user's preference says to stay quiet. */
export function buildDetectionNotification(
  summary: SummaryCounts,
  preference: DetectionContext['notificationPreference']
): { title: string; body: string; data: Record<string, unknown> } | null {
  if (preference === 'off') return null;
  if (summary.created === 0 && summary.needsReview === 0) return null;
  if (preference === 'needs_review' && summary.needsReview === 0) return null;
  const parts: string[] = [];
  if (summary.created > 0) parts.push(`${summary.created} added`);
  if (summary.needsReview > 0) parts.push(`${summary.needsReview} to review`);
  const needsReview = summary.needsReview > 0;
  return {
    title: needsReview ? 'Transactions need review' : 'Transactions added',
    body: `Detected from your bank messages: ${parts.join(', ')}.`,
    data: {
      // A single review item deep-links to that item; several open the review list.
      detectedId: summary.reviewIds.length === 1 ? summary.reviewIds[0] : 'batch',
      status: needsReview ? 'pending_review' : 'auto_approved',
    },
  };
}

export async function notifyDetectionSummary(
  summary: SummaryCounts,
  preference: DetectionContext['notificationPreference']
): Promise<void> {
  const content = buildDetectionNotification(summary, preference);
  if (!content) return;
  try {
    const Notifications = await import('expo-notifications');
    if (Platform.OS === 'android' && !channelReady) {
      await Notifications.setNotificationChannelAsync(DETECTION_CHANNEL_ID, {
        name: 'Detected transactions',
        importance: Notifications.AndroidImportance.DEFAULT,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      });
      channelReady = true;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: content.title, body: content.body, data: content.data },
      trigger: Platform.OS === 'android' ? { channelId: DETECTION_CHANNEL_ID } : null,
    });
  } catch {
    // Expo Go or a denied permission: the review badge still shows the count.
  }
}
