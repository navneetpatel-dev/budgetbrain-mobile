package app.budgetbrain.smsdetector.core

/**
 * The native pre-filter (plan T2.2). Pure Kotlin, no Android types, so it runs in JVM tests.
 *
 * An SMS is kept when its body has a currency or amount token and either its sender matches an
 * exact header or contains a header keyword, or (plan T3.2) its sender is a business header,
 * not a phone number, and its body names a known institution (a multi-word name from the pack)
 * or carries one of its IFSC codes. Core decides; that route never reaches the high tier.
 * Everything else is dropped in the receiver, so non-bank SMS never start JS.
 */
class SenderFilter(
  headers: Collection<String>,
  keywords: Collection<String>,
  bodyNames: Collection<String> = emptyList(),
  ifscPrefixes: Collection<String> = emptyList(),
) {
  private val headers: Set<String> = headers.mapTo(HashSet()) { it.trim().uppercase() }.apply { remove("") }
  private val keywords: List<String> = keywords.map { it.trim().uppercase() }.filter { it.isNotEmpty() }
  private val bodyNames: List<String> =
    bodyNames.map { it.trim().uppercase() }.filter { it.length >= 6 && ' ' in it }.distinct()
  private val ifscPrefixes: Set<String> =
    ifscPrefixes.mapTo(HashSet()) { it.trim().uppercase() }.apply { retainAll { IFSC_PREFIX.matches(it) } }

  val isEmpty: Boolean get() = headers.isEmpty() && keywords.isEmpty() && bodyNames.isEmpty() && ifscPrefixes.isEmpty()

  fun matchesSender(sender: String): Boolean {
    val header = normalizeSender(sender)
    if (header.isEmpty()) return false
    if (header in headers) return true
    return keywords.any { header.contains(it) }
  }

  /** An unknown business header whose message names a known institution (plan T3.2). */
  fun mentionsInstitution(sender: String, body: String): Boolean {
    val header = normalizeSender(sender)
    if (header.isEmpty() || PHONE.matches(header)) return false
    if (bodyNames.isEmpty() && ifscPrefixes.isEmpty()) return false
    val text = body.take(1000).uppercase()
    if (bodyNames.any { containsWord(text, it) }) return true
    return IFSC.findAll(text).any { it.groupValues[1] in ifscPrefixes }
  }

  fun accepts(sender: String, body: String): Boolean =
    hasMoneyToken(body) && (matchesSender(sender) || mentionsInstitution(sender, body))

  /** One line per entry: `H:HDFCBK`, `K:HDFC`, `N:HDFC BANK` or `I:HDFC`. Stored in SharedPreferences. */
  fun serialize(): String =
    (headers.sorted().map { "H:$it" } + keywords.map { "K:$it" } + bodyNames.map { "N:$it" } + ifscPrefixes.sorted().map { "I:$it" })
      .joinToString("\n")

  companion object {
    private val ROUTE_PREFIX = Regex("^[A-Z]{2}-")
    private val SUFFIX = Regex("-[A-Z]$")
    private val PHONE = Regex("^\\+?\\d[\\d\\s-]{5,}$")
    private val IFSC_PREFIX = Regex("^[A-Z]{4}$")
    private val IFSC = Regex("\\b([A-Z]{4})0[A-Z0-9]{6}\\b")
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

    /** `name` appears in `text` as whole words (both already uppercase). */
    fun containsWord(text: String, name: String): Boolean {
      var from = 0
      while (true) {
        val at = text.indexOf(name, from)
        if (at < 0) return false
        val end = at + name.length
        val before = at == 0 || !text[at - 1].isLetterOrDigit()
        val after = end == text.length || !text[end].isLetterOrDigit()
        if (before && after) return true
        from = at + 1
      }
    }

    fun deserialize(text: String?): SenderFilter {
      val headers = mutableListOf<String>()
      val keywords = mutableListOf<String>()
      val names = mutableListOf<String>()
      val prefixes = mutableListOf<String>()
      text?.lineSequence()?.forEach { line ->
        when {
          line.startsWith("H:") -> headers += line.substring(2)
          line.startsWith("K:") -> keywords += line.substring(2)
          line.startsWith("N:") -> names += line.substring(2)
          line.startsWith("I:") -> prefixes += line.substring(2)
        }
      }
      return SenderFilter(headers, keywords, names, prefixes)
    }

    /**
     * Until JS hands over the knowledge pack's senders (plan T4.5), nothing is kept: bank lists
     * live only in the pack, never in the app. Detection starts from the app, which sends the
     * filter before it turns the receiver on.
     */
    val EMPTY = SenderFilter(emptyList(), emptyList())
  }
}
