import type { NormalizedMessage } from '@budgetbrain/detection-core';
import type { NativeSmsCandidate } from '../../../../modules/sms-detector';

export {
  isSmsDetectorAvailable,
  setEnabled as setSmsDetectorEnabled,
  setSenderFilter as setSmsSenderFilter,
  drainQueue as drainSmsQueue,
  ackMessages as ackSmsMessages,
  scanInbox as scanSmsInbox,
  initWatermark as initSmsWatermark,
  scheduleCatchUp as scheduleSmsCatchUp,
  addCandidateListener as addSmsCandidateListener,
} from '../../../../modules/sms-detector';
export type { NativeSmsCandidate } from '../../../../modules/sms-detector';

/** Maps a native candidate to the pipeline's message shape (plan T2.7: id and SIM slot filled). */
export function toNormalizedMessage(candidate: NativeSmsCandidate): NormalizedMessage {
  return {
    id: candidate.messageId ?? `queue:${candidate.queueId}`,
    sender: candidate.sender,
    body: candidate.body,
    receivedAt: new Date(candidate.receivedAt).toISOString(),
    source: 'android_sms',
    ...(candidate.simSlot !== null ? { simSlot: candidate.simSlot } : {}),
  };
}
