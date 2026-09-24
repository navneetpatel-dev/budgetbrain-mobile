package app.budgetbrain.smsdetector

import android.content.Intent
import android.os.Build
import android.telephony.SubscriptionManager

/** Maps a subscription id to the 1-based SIM slot JS filters on (plan T2.7). */
internal object SimSlots {
  fun slotForSubscription(subscriptionId: Int?): Int? {
    if (subscriptionId == null || subscriptionId < 0) return null
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null
    val index = SubscriptionManager.getSlotIndex(subscriptionId)
    return if (index >= 0) index + 1 else null
  }

  /** The SMS_RECEIVED intent names the subscription under a documented extra, or an older OEM one. */
  fun subscriptionFromIntent(intent: Intent): Int? {
    val extras = intent.extras ?: return null
    for (key in listOf(SubscriptionManager.EXTRA_SUBSCRIPTION_INDEX, "subscription")) {
      if (extras.containsKey(key)) {
        val value = extras.getInt(key, -1)
        if (value >= 0) return value
      }
    }
    return null
  }
}
