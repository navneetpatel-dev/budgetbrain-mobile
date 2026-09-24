package app.budgetbrain.smsdetector

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskContext
import com.facebook.react.jstasks.HeadlessJsTaskEventListener
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlin.coroutines.resume

/**
 * Runs the JS task `TransactionDetectionDrain` for everything queued (plan T2.4).
 *
 * The task runs inside this worker instead of through a started `HeadlessJsTaskService`:
 * Android 8+ may refuse a background service start, but a running worker is allowed to work.
 * It does what `HeadlessJsTaskService` does (start the React host if needed, start the task,
 * wait for it to finish) and the worker holds the process alive until then.
 */
class DrainWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
  override suspend fun doWork(): Result {
    val queue = CandidateQueue.get(applicationContext)
    if (!DetectorPrefs(applicationContext).enabled) {
      queue.clear()
      return Result.success()
    }
    if (!withContext(Dispatchers.IO) { queue.hasPending() }) return Result.success()

    val app = applicationContext as? ReactApplication ?: return Result.failure()
    val finished = withTimeoutOrNull(TASK_TIMEOUT_MS + 15_000) {
      val reactContext = withContext(Dispatchers.Main) { reactContext(app) } ?: return@withTimeoutOrNull false
      withContext(Dispatchers.Main) { runTask(reactContext) }
      true
    }
    // Whatever wasn't acknowledged stays queued; retry with WorkManager's backoff.
    val stillPending = withContext(Dispatchers.IO) { queue.hasPending() }
    return if (finished == true && !stillPending) Result.success() else Result.retry()
  }

  private suspend fun reactContext(app: ReactApplication): ReactContext? {
    val host = app.reactHost ?: return null
    host.currentReactContext?.let { return it }
    return suspendCancellableCoroutine { continuation ->
      val listener = object : ReactInstanceEventListener {
        override fun onReactContextInitialized(context: ReactContext) {
          host.removeReactInstanceEventListener(this)
          if (continuation.isActive) continuation.resume(context)
        }
      }
      host.addReactInstanceEventListener(listener)
      continuation.invokeOnCancellation { host.removeReactInstanceEventListener(listener) }
      host.start()
    }
  }

  private suspend fun runTask(reactContext: ReactContext) {
    val tasks = HeadlessJsTaskContext.getInstance(reactContext)
    suspendCancellableCoroutine { continuation ->
      var taskId = -1
      val listener = object : HeadlessJsTaskEventListener {
        override fun onHeadlessJsTaskStart(id: Int) = Unit

        override fun onHeadlessJsTaskFinish(id: Int) {
          if (id != taskId) return
          tasks.removeTaskEventListener(this)
          if (continuation.isActive) continuation.resume(Unit)
        }
      }
      tasks.addTaskEventListener(listener)
      continuation.invokeOnCancellation { tasks.removeTaskEventListener(listener) }
      // Allowed in the foreground: the app may be open when the drain fires; JS single-flights runs.
      taskId = tasks.startTask(HeadlessJsTaskConfig(TASK_NAME, Arguments.createMap(), TASK_TIMEOUT_MS, true))
    }
  }

  private companion object {
    const val TASK_NAME = "TransactionDetectionDrain"
    const val TASK_TIMEOUT_MS = 30_000L
  }
}
