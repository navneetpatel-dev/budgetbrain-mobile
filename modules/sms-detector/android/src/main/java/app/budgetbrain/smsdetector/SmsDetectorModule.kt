package app.budgetbrain.smsdetector

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.Settings
import app.budgetbrain.smsdetector.core.NotificationFilter
import app.budgetbrain.smsdetector.core.SenderFilter
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.lang.ref.WeakReference

class SenderFilterRecord : Record {
  @Field val headers: List<String> = emptyList()
  @Field val keywords: List<String> = emptyList()
}

class NotificationFilterRecord : Record {
  @Field val packages: List<String> = emptyList()
}

class ScanInboxOptions : Record {
  @Field val sinceMs: Double = 0.0
  @Field val limit: Int = 300
  @Field val simSlot: Int? = null
}

/** JS API of the detector (plan T2.1). See `modules/sms-detector/index.ts`. */
class SmsDetectorModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("SmsDetector")
    Events(EVENT_CANDIDATE_QUEUED)

    OnCreate { current = WeakReference(this@SmsDetectorModule) }
    OnDestroy { if (current?.get() === this@SmsDetectorModule) current = null }
    OnStartObserving { observing = true }
    OnStopObserving { observing = false }
    OnActivityEntersForeground { foreground = true }
    OnActivityEntersBackground { foreground = false }

    // False in the noSms build variant (plan T2.11), whose manifest declares no SMS permission.
    Function("isSmsSupported") {
      val info = context.packageManager.getPackageInfo(context.packageName, PackageManager.GET_PERMISSIONS)
      info.requestedPermissions?.contains(Manifest.permission.RECEIVE_SMS) == true
    }

    AsyncFunction("setEnabled") { enabled: Boolean ->
      DetectorPrefs(context).enabled = enabled
      if (enabled) {
        DrainScheduler.scheduleCatchUp(context)
      } else {
        DrainScheduler.cancelAll(context)
        CandidateQueue.get(context).clear()
      }
    }

    AsyncFunction("setSenderFilter") { filter: SenderFilterRecord ->
      val next = SenderFilter(filter.headers, filter.keywords)
      if (!next.isEmpty) DetectorPrefs(context).setSenderFilter(next)
    }

    AsyncFunction("drainQueue") { limit: Int ->
      CandidateQueue.get(context).peek(limit).map { candidate ->
        mapOf(
          "queueId" to candidate.queueId.toString(),
          "messageId" to candidate.messageId,
          "sender" to candidate.sender,
          "body" to candidate.body,
          "receivedAt" to candidate.receivedAt.toDouble(),
          "simSlot" to candidate.simSlot,
          "source" to candidate.source,
        )
      }
    }

    AsyncFunction("ackMessages") { queueIds: List<String> ->
      CandidateQueue.get(context).ack(queueIds.mapNotNull { it.toLongOrNull() })
    }

    AsyncFunction("scanInbox") { options: ScanInboxOptions ->
      val prefs = DetectorPrefs(context)
      InboxReader.read(context, options.sinceMs.toLong(), options.limit.coerceIn(1, 5000), prefs.senderFilter())
        .mapNotNull { message ->
          val slot = SimSlots.slotForSubscription(message.subscriptionId)
          if (options.simSlot != null && slot != null && slot != options.simSlot) return@mapNotNull null
          mapOf(
            "queueId" to "inbox:${message.messageId}",
            "messageId" to message.messageId,
            "sender" to message.sender,
            "body" to message.body,
            "receivedAt" to message.date.toDouble(),
            "simSlot" to slot,
            "source" to CandidateQueue.SOURCE_SMS,
          )
        }
    }

    // Bank-app notifications (plan T8.1). False when the build's manifest has no listener.
    Function("isNotificationListenerSupported") {
      val component = ComponentName(context, BankNotificationListener::class.java)
      try {
        context.packageManager.getServiceInfo(component, 0)
        true
      } catch (e: PackageManager.NameNotFoundException) {
        false
      }
    }

    Function("isNotificationAccessGranted") {
      // The same list NotificationManagerCompat reads, without pulling in androidx.core.
      val enabled = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners").orEmpty()
      val ours = ComponentName(context, BankNotificationListener::class.java)
      enabled.split(':').mapNotNull { ComponentName.unflattenFromString(it) }.any { it == ours }
    }

    // Notification access is a special permission: only the user can grant it, in Settings.
    Function("openNotificationAccessSettings") {
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    AsyncFunction("setNotificationsEnabled") { enabled: Boolean ->
      DetectorPrefs(context).notificationsEnabled = enabled
      if (!enabled) CandidateQueue.get(context).clearSource(CandidateQueue.SOURCE_NOTIFICATION)
    }

    AsyncFunction("setNotificationFilter") { filter: NotificationFilterRecord ->
      val next = NotificationFilter(filter.packages)
      if (!next.isEmpty) DetectorPrefs(context).setNotificationFilter(next)
    }

    AsyncFunction("initWatermark") { floorMs: Double ->
      DetectorPrefs(context).initWatermarkFloor(floorMs.toLong())
    }

    AsyncFunction("scheduleCatchUp") {
      if (DetectorPrefs(context).enabled) DrainScheduler.scheduleCatchUp(context)
    }
  }

  companion object {
    private const val EVENT_CANDIDATE_QUEUED = "onCandidateQueued"

    @Volatile private var current: WeakReference<SmsDetectorModule>? = null
    @Volatile private var observing = false
    @Volatile private var foreground = false

    /** Lets an open app drain at once instead of waiting for the 45 s WorkManager delay. */
    internal fun notifyCandidateQueued() {
      if (!observing || !foreground) return
      current?.get()?.sendEvent(EVENT_CANDIDATE_QUEUED, emptyMap<String, Any>())
    }
  }
}
