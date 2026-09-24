package app.budgetbrain.smsdetector

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/** A message the pre-filter kept, waiting for JS. */
internal data class Candidate(
  val queueId: Long,
  val messageId: String?,
  val sender: String,
  val body: String,
  val receivedAt: Long,
  val simSlot: Int?,
  /** Always `android_sms` now; the column stays from the bank-app notification capture (v2). */
  val source: String,
)

/**
 * App-private SQLite queue between the receiver and JS (plan T2.3).
 *
 * Acknowledged rows lose their body at once and stay as a tombstone for 7 days, so a catch-up
 * scan doesn't queue a message the live receiver already handed over. Bodies never processed
 * are purged after 7 days too.
 */
internal class CandidateQueue private constructor(context: Context) :
  SQLiteOpenHelper(context.applicationContext, "sms_candidates.db", null, 3) {

  override fun onCreate(db: SQLiteDatabase) {
    db.execSQL(
      """
      CREATE TABLE candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        msg_key TEXT NOT NULL UNIQUE,
        message_id TEXT,
        sender TEXT NOT NULL,
        body TEXT,
        received_at INTEGER NOT NULL,
        sim_slot INTEGER,
        queued_at INTEGER NOT NULL,
        acked INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'android_sms'
      )
      """.trimIndent()
    )
    db.execSQL("CREATE INDEX candidates_pending ON candidates (acked, id)")
  }

  override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
    // v2: bank-app notifications share the queue (plan T8.1).
    if (oldVersion < 2) db.execSQL("ALTER TABLE candidates ADD COLUMN source TEXT NOT NULL DEFAULT 'android_sms'")
    // v3: bank-app notification capture was removed (SMS only); drop anything it queued.
    if (oldVersion < 3) db.execSQL("DELETE FROM candidates WHERE source <> 'android_sms'")
  }

  /** Returns true when the message was new. */
  fun enqueue(
    key: String,
    messageId: String?,
    sender: String,
    body: String,
    receivedAt: Long,
    simSlot: Int?,
    source: String = SOURCE_SMS,
  ): Boolean {
    val values = ContentValues().apply {
      put("msg_key", key)
      put("message_id", messageId)
      put("sender", sender)
      put("body", body)
      put("received_at", receivedAt)
      if (simSlot != null) put("sim_slot", simSlot) else putNull("sim_slot")
      put("queued_at", System.currentTimeMillis())
      put("source", source)
    }
    return writableDatabase.insertWithOnConflict("candidates", null, values, SQLiteDatabase.CONFLICT_IGNORE) != -1L
  }

  fun hasPending(): Boolean =
    readableDatabase.rawQuery("SELECT 1 FROM candidates WHERE acked = 0 LIMIT 1", null).use { it.moveToFirst() }

  fun peek(limit: Int): List<Candidate> {
    val result = ArrayList<Candidate>()
    readableDatabase.rawQuery(
      "SELECT id, message_id, sender, body, received_at, sim_slot, source FROM candidates WHERE acked = 0 AND body IS NOT NULL ORDER BY id LIMIT ?",
      arrayOf(limit.coerceIn(1, 200).toString())
    ).use { cursor ->
      while (cursor.moveToNext()) {
        result += Candidate(
          queueId = cursor.getLong(0),
          messageId = if (cursor.isNull(1)) null else cursor.getString(1),
          sender = cursor.getString(2),
          body = cursor.getString(3),
          receivedAt = cursor.getLong(4),
          simSlot = if (cursor.isNull(5)) null else cursor.getInt(5),
          source = cursor.getString(6),
        )
      }
    }
    return result
  }

  fun ack(queueIds: List<Long>) {
    if (queueIds.isEmpty()) return
    val db = writableDatabase
    db.beginTransaction()
    try {
      val statement = db.compileStatement("UPDATE candidates SET acked = 1, body = NULL WHERE id = ?")
      for (id in queueIds) {
        statement.bindLong(1, id)
        statement.executeUpdateDelete()
      }
      db.setTransactionSuccessful()
    } finally {
      db.endTransaction()
    }
  }

  fun clear() {
    writableDatabase.execSQL("DELETE FROM candidates")
  }

  fun purgeOlderThan(cutoffMs: Long) {
    writableDatabase.execSQL("DELETE FROM candidates WHERE queued_at < ?", arrayOf(cutoffMs))
  }

  companion object {
    const val SOURCE_SMS = "android_sms"

    @Volatile private var instance: CandidateQueue? = null

    fun get(context: Context): CandidateQueue =
      instance ?: synchronized(this) { instance ?: CandidateQueue(context).also { instance = it } }
  }
}
