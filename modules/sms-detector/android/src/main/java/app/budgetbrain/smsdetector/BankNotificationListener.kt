package app.budgetbrain.smsdetector

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import app.budgetbrain.smsdetector.core.NotificationText

/**
 * Bank and UPI app notifications (plan T8.1). The system binds this service only after the
 * user grants notification access in Settings. Like the SMS receiver, it drops everything
 * except allowlisted packages with a money token, without starting JS, and puts the rest in
 * the same candidate queue, drained by the same WorkManager job.
 *
 * Only the notification's title and text are read; nothing else about the notification or
 * other apps is stored.
 */
class BankNotificationListener : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    val notification = sbn?.notification ?: return
    val prefs = DetectorPrefs(this)
    if (!prefs.enabled || !prefs.notificationsEnabled) return
    // Progress bars, "syncing" and group headers are never transactions.
    if (sbn.isOngoing || notification.flags and Notification.FLAG_GROUP_SUMMARY != 0) return

    val packageName = sbn.packageName ?: return
    val filter = prefs.notificationFilter()
    if (!filter.matchesPackage(packageName)) return

    val extras = notification.extras ?: return
    val body = NotificationText.compose(
      extras.getCharSequence(Notification.EXTRA_TITLE)?.toString(),
      extras.getCharSequence(Notification.EXTRA_TEXT)?.toString(),
      extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString(),
    )
    if (!filter.accepts(packageName, body)) return

    val postedAt = sbn.postTime
    Thread {
      val added = CandidateQueue.get(this).enqueue(
        key = NotificationText.dedupKey(packageName, body),
        messageId = null,
        sender = packageName,
        body = body,
        receivedAt = postedAt,
        simSlot = null,
        source = CandidateQueue.SOURCE_NOTIFICATION,
      )
      if (added) {
        DrainScheduler.scheduleDrain(this)
        SmsDetectorModule.notifyCandidateQueued()
      }
    }.start()
  }
}
