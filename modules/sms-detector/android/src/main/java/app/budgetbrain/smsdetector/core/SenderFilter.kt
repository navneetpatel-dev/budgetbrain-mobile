package app.budgetbrain.smsdetector.core

/**
 * The native pre-filter (plan T2.2). Pure Kotlin, no Android types, so it runs in JVM tests.
 *
 * An SMS is kept only when its sender matches an exact header or contains a header keyword,
 * and its body has a currency or amount token. Everything else is dropped in the receiver,
 * so non-bank SMS never start JS.
 */
class SenderFilter(headers: Collection<String>, keywords: Collection<String>) {
  private val headers: Set<String> = headers.mapTo(HashSet()) { it.trim().uppercase() }.apply { remove("") }
  private val keywords: List<String> = keywords.map { it.trim().uppercase() }.filter { it.isNotEmpty() }

  val isEmpty: Boolean get() = headers.isEmpty() && keywords.isEmpty()

  fun matchesSender(sender: String): Boolean {
    val header = normalizeSender(sender)
    if (header.isEmpty()) return false
    if (header in headers) return true
    return keywords.any { header.contains(it) }
  }

  fun accepts(sender: String, body: String): Boolean = matchesSender(sender) && hasMoneyToken(body)

  /** One line per entry: `H:HDFCBK` or `K:HDFC`. Stored in SharedPreferences. */
  fun serialize(): String =
    (headers.sorted().map { "H:$it" } + keywords.map { "K:$it" }).joinToString("\n")

  companion object {
    private val ROUTE_PREFIX = Regex("^[A-Z]{2}-")
    private val SUFFIX = Regex("-[A-Z]$")
    private val MONEY_TOKEN =
      Regex("(?:RS\\.?|INR|₹|\\$|€|£|USD|EUR|GBP|AED|SGD)\\s?\\d|\\d[\\d,]*\\.\\d{2}\\b", RegexOption.IGNORE_CASE)

    /** `VM-HDFCBK`, `AD-HDFCBK-S` and `hdfcbk` all become `HDFCBK`. Phone numbers stay as they are. */
    fun normalizeSender(sender: String): String {
      var value = sender.trim().uppercase()
      value = ROUTE_PREFIX.replace(value, "")
      value = SUFFIX.replace(value, "")
      return value
    }

    /** A cheap check that the body mentions money; parsing happens in JS. Only the first 1,000 chars are read. */
    fun hasMoneyToken(body: String): Boolean = MONEY_TOKEN.containsMatchIn(body.take(1000))

    fun deserialize(text: String?): SenderFilter {
      val headers = mutableListOf<String>()
      val keywords = mutableListOf<String>()
      text?.lineSequence()?.forEach { line ->
        when {
          line.startsWith("H:") -> headers += line.substring(2)
          line.startsWith("K:") -> keywords += line.substring(2)
        }
      }
      return SenderFilter(headers, keywords)
    }

    /**
     * Until JS hands over the knowledge pack's senders (plan T4.5), nothing is kept: bank lists
     * live only in the pack, never in the app. Detection starts from the app, which sends the
     * filter before it turns the receiver on.
     */
    val EMPTY = SenderFilter(emptyList(), emptyList())
  }
}
