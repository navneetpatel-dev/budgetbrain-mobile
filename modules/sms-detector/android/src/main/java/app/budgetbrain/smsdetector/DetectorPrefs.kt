package app.budgetbrain.smsdetector

import android.content.Context
import android.content.SharedPreferences
import app.budgetbrain.smsdetector.core.NotificationFilter
import app.budgetbrain.smsdetector.core.SenderFilter
import app.budgetbrain.smsdetector.core.Watermark

/** Small native settings the receiver reads without starting JS. */
internal class DetectorPrefs(context: Context) {
  private val prefs: SharedPreferences =
    context.applicationContext.getSharedPreferences("budgetbrain_sms_detector", Context.MODE_PRIVATE)

  var enabled: Boolean
    get() = prefs.getBoolean(KEY_ENABLED, false)
    set(value) = prefs.edit().putBoolean(KEY_ENABLED, value).apply()

  /** Bank-app notification capture (plan T8.1): its own opt-in, on top of `enabled`. */
  var notificationsEnabled: Boolean
    get() = prefs.getBoolean(KEY_NOTIFICATIONS, false)
    set(value) = prefs.edit().putBoolean(KEY_NOTIFICATIONS, value).apply()

  fun notificationFilter(): NotificationFilter {
    cachedNotificationFilter?.let { return it }
    val filter = NotificationFilter.deserialize(prefs.getString(KEY_NOTIFICATION_FILTER, null))
    cachedNotificationFilter = filter
    return filter
  }

  fun setNotificationFilter(filter: NotificationFilter) {
    prefs.edit().putString(KEY_NOTIFICATION_FILTER, filter.serialize()).apply()
    cachedNotificationFilter = filter
  }

  fun senderFilter(): SenderFilter {
    cachedFilter?.let { return it }
    val stored = prefs.getString(KEY_FILTER, null)
    val filter = if (stored.isNullOrEmpty()) SenderFilter.EMPTY else SenderFilter.deserialize(stored)
    cachedFilter = filter
    return filter
  }

  fun setSenderFilter(filter: SenderFilter) {
    prefs.edit().putString(KEY_FILTER, filter.serialize()).apply()
    cachedFilter = filter
  }

  /** Sets the catch-up floor once; later calls keep the first value. */
  fun initWatermarkFloor(floorMs: Long) {
    if (!prefs.contains(KEY_FLOOR)) prefs.edit().putLong(KEY_FLOOR, floorMs).apply()
  }

  /** Where the next catch-up scan starts: the watermark, or the floor before the first scan. */
  fun watermarkStart(): Long {
    val stored = if (prefs.contains(KEY_WATERMARK)) prefs.getLong(KEY_WATERMARK, 0L) else null
    return Watermark.startFor(stored, prefs.getLong(KEY_FLOOR, System.currentTimeMillis()))
  }

  fun setWatermark(value: Long) {
    prefs.edit().putLong(KEY_WATERMARK, value).apply()
  }

  companion object {
    private const val KEY_ENABLED = "enabled"
    private const val KEY_FILTER = "sender_filter"
    private const val KEY_FLOOR = "watermark_floor"
    private const val KEY_WATERMARK = "watermark"
    private const val KEY_NOTIFICATIONS = "notifications_enabled"
    private const val KEY_NOTIFICATION_FILTER = "notification_filter"

    /** Parsed once per process; the receiver runs for every SMS. */
    @Volatile private var cachedFilter: SenderFilter? = null
    @Volatile private var cachedNotificationFilter: NotificationFilter? = null
  }
}
