package app.budgetbrain.smsdetector

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/** WorkManager wiring (plan T2.4, T2.6). */
internal object DrainScheduler {
  const val DRAIN_WORK = "sms-detect-drain"
  const val CATCH_UP_WORK = "sms-detect-catchup"
  private const val DRAIN_DELAY_SECONDS = 45L

  /** KEEP: a burst of SMS schedules one drain, which handles them all. */
  fun scheduleDrain(context: Context, delaySeconds: Long = DRAIN_DELAY_SECONDS) {
    val request = OneTimeWorkRequestBuilder<DrainWorker>()
      .setInitialDelay(delaySeconds, TimeUnit.SECONDS)
      .build()
    WorkManager.getInstance(context).enqueueUniqueWork(DRAIN_WORK, ExistingWorkPolicy.KEEP, request)
  }

  /** Every 6 hours with battery not low; finds SMS the receiver missed (app force-stopped, reboot). */
  fun scheduleCatchUp(context: Context) {
    val request = PeriodicWorkRequestBuilder<CatchUpWorker>(6, TimeUnit.HOURS)
      .setConstraints(Constraints.Builder().setRequiresBatteryNotLow(true).build())
      .build()
    WorkManager.getInstance(context).enqueueUniquePeriodicWork(CATCH_UP_WORK, ExistingPeriodicWorkPolicy.KEEP, request)
  }

  fun cancelAll(context: Context) {
    val workManager = WorkManager.getInstance(context)
    workManager.cancelUniqueWork(DRAIN_WORK)
    workManager.cancelUniqueWork(CATCH_UP_WORK)
  }
}
