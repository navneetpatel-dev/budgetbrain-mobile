package app.budgetbrain.smsdetector

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import app.budgetbrain.smsdetector.core.SmsParts
import app.budgetbrain.smsdetector.core.Watermark
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Periodic catch-up (plan T2.6): reads inbox messages newer than the watermark, queues the
 * ones the filter keeps, and moves the watermark forward. Messages the live receiver already
 * queued are skipped by their dedup key.
 */
class CatchUpWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
  override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
    val prefs = DetectorPrefs(applicationContext)
    if (!prefs.enabled) return@withContext Result.success()
    try {
      val queue = CandidateQueue.get(applicationContext)
      queue.purgeOlderThan(System.currentTimeMillis() - SEVEN_DAYS_MS)
      // One date watermark covers every SIM: the inbox query is ordered by date across all of them.
      val since = prefs.watermarkStart()
      val messages = InboxReader.read(applicationContext, since, MAX_PER_RUN, prefs.senderFilter())
      var added = false
      for (message in messages) {
        val key = SmsParts.dedupKey(message.sender, message.body, message.date)
        val slot = SimSlots.slotForSubscription(message.subscriptionId)
        added = queue.enqueue(key, message.messageId, message.sender, message.body, message.date, slot) || added
      }
      prefs.setWatermark(Watermark.advance(since, messages.map { it.date }))
      if (added) DrainScheduler.scheduleDrain(applicationContext, delaySeconds = 0)
      Result.success()
    } catch (error: SecurityException) {
      // READ_SMS was revoked; nothing to do until the user grants it again.
      Result.success()
    }
  }

  private companion object {
    const val SEVEN_DAYS_MS = 7L * 24 * 60 * 60 * 1000
    const val MAX_PER_RUN = 1000
  }
}
