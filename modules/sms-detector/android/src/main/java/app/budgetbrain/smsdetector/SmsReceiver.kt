package app.budgetbrain.smsdetector

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import app.budgetbrain.smsdetector.core.SmsPart
import app.budgetbrain.smsdetector.core.SmsParts

/**
 * Receives every incoming SMS (plan T2.1, T2.2). Non-bank messages are dropped here in well
 * under a millisecond and never start JS. Kept messages go to the candidate queue, and one
 * WorkManager job drains the whole burst later (T2.4).
 */
class SmsReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
    val prefs = DetectorPrefs(context)
    if (!prefs.enabled) return

    val pdus = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
    val parts = pdus.mapNotNull { sms ->
      val sender = sms?.displayOriginatingAddress ?: return@mapNotNull null
      SmsPart(sender, sms.displayMessageBody ?: "", sms.timestampMillis)
    }
    val filter = prefs.senderFilter()
    val kept = SmsParts.assemble(parts).filter { filter.accepts(it.sender, it.body) }
    if (kept.isEmpty()) return

    val simSlot = SimSlots.slotForSubscription(SimSlots.subscriptionFromIntent(intent))
    val pending = goAsync()
    Thread {
      try {
        val queue = CandidateQueue.get(context)
        var added = false
        for (message in kept) {
          val key = SmsParts.dedupKey(message.sender, message.body, message.timestampMs)
          added = queue.enqueue(key, null, message.sender, message.body, message.timestampMs, simSlot) || added
        }
        if (added) {
          DrainScheduler.scheduleDrain(context)
          SmsDetectorModule.notifyCandidateQueued()
        }
      } finally {
        pending.finish()
      }
    }.start()
  }
}
