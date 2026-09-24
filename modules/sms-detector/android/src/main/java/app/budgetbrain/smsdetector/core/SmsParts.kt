package app.budgetbrain.smsdetector.core

/** One PDU of an incoming SMS, as the receiver reads it from the intent. */
data class SmsPart(val sender: String, val body: String, val timestampMs: Long)

/** A whole message after its parts are joined. */
data class SmsMessage(val sender: String, val body: String, val timestampMs: Long)

object SmsParts {
  /**
   * A long SMS arrives as several PDUs in one broadcast. Parts from the same sender are joined
   * in order; the earliest timestamp is the message time.
   */
  fun assemble(parts: List<SmsPart>): List<SmsMessage> {
    val bySender = LinkedHashMap<String, MutableList<SmsPart>>()
    for (part in parts) bySender.getOrPut(part.sender) { mutableListOf() }.add(part)
    return bySender.map { (sender, group) ->
      SmsMessage(sender, group.joinToString("") { it.body }, group.minOf { it.timestampMs })
    }
  }

  /**
   * Identity of a message across the live receiver and an inbox scan, which see the same SMS
   * with slightly different timestamps. Sender, body hash and the time to the second.
   */
  fun dedupKey(sender: String, body: String, timestampMs: Long): String =
    "${SenderFilter.normalizeSender(sender)}|${timestampMs / 1000}|${fnv1a(body)}"

  private fun fnv1a(text: String): String {
    var hash = 0x811c9dc5L
    for (ch in text) {
      hash = hash xor ch.code.toLong()
      hash = (hash * 0x01000193L) and 0xffffffffL
    }
    return hash.toString(16)
  }
}
