package app.budgetbrain.smsdetector

import android.content.Context
import android.provider.Telephony
import app.budgetbrain.smsdetector.core.SenderFilter

/** One inbox row that passed the sender filter. */
internal data class InboxMessage(
  val messageId: String,
  val sender: String,
  val body: String,
  val date: Long,
  val subscriptionId: Int?,
)

/**
 * Reads the SMS inbox with a projection and a `date > since` selection, oldest first, in pages
 * (plan §3.1). The sender filter runs here, so only bank messages cross into JS.
 */
internal object InboxReader {
  private const val PAGE = 200

  fun read(context: Context, sinceMs: Long, limit: Int, filter: SenderFilter): List<InboxMessage> {
    val result = ArrayList<InboxMessage>()
    var since = sinceMs
    val projection = arrayOf(Telephony.Sms._ID, Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE, Telephony.Sms.SUBSCRIPTION_ID)
    while (result.size < limit) {
      val cursor = context.contentResolver.query(
        Telephony.Sms.Inbox.CONTENT_URI,
        projection,
        "${Telephony.Sms.DATE} > ?",
        arrayOf(since.toString()),
        "${Telephony.Sms.DATE} ASC LIMIT $PAGE"
      ) ?: break
      var lastDate = since
      var rows = 0
      try {
        while (result.size < limit && cursor.moveToNext()) {
          rows += 1
          val date = cursor.getLong(3)
          lastDate = maxOf(lastDate, date)
          val sender = cursor.getString(1)
          val body = cursor.getString(2)
          if (sender == null || body == null || !filter.accepts(sender, body)) continue
          val subscription = if (cursor.isNull(4)) null else cursor.getInt(4)
          result += InboxMessage(cursor.getString(0), sender, body, date, subscription)
        }
      } finally {
        cursor.close()
      }
      // Fewer rows than a page means the inbox has nothing newer.
      if (rows < PAGE || lastDate == since) break
      since = lastDate
    }
    return result
  }
}
