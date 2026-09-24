package app.budgetbrain.smsdetector.core

/**
 * The native pre-filter for bank-app notifications (plan T8.1). Pure Kotlin, no Android types.
 *
 * A notification is kept only when it comes from an app package the knowledge pack lists for
 * notifications and its text has a currency or amount token, the same money check SMS use.
 * Everything else is dropped in the listener and never reaches JS.
 */
class NotificationFilter(packages: Collection<String>) {
  private val packages: Set<String> = packages.mapTo(HashSet()) { it.trim().lowercase() }.apply { remove("") }

  val isEmpty: Boolean get() = packages.isEmpty()

  fun matchesPackage(packageName: String): Boolean = packageName.trim().lowercase() in packages

  fun accepts(packageName: String, text: String): Boolean =
    matchesPackage(packageName) && SenderFilter.hasMoneyToken(text)

  /** One package per line. Stored in SharedPreferences. */
  fun serialize(): String = packages.sorted().joinToString("\n")

  companion object {
    fun deserialize(text: String?): NotificationFilter =
      NotificationFilter(text?.lines().orEmpty())

    /** Nothing is kept until JS hands over the pack's notification packages. */
    val EMPTY = NotificationFilter(emptyList())
  }
}

/** Turns a notification's title and text into one message body for the parser. */
object NotificationText {
  /**
   * The expanded text wins over the one-line text (it's the full alert). The title goes first
   * unless the text already contains it; bank apps often put the amount there
   * ("₹250 debited").
   */
  fun compose(title: String?, text: String?, bigText: String?): String {
    val main = (bigText?.trim()?.takeIf { it.isNotEmpty() } ?: text?.trim()).orEmpty()
    val heading = title?.trim().orEmpty()
    return when {
      heading.isEmpty() -> main
      main.isEmpty() -> heading
      main.contains(heading, ignoreCase = true) -> main
      else -> "$heading\n$main"
    }
  }

  /**
   * Apps repost the same notification when it is updated or the phone restarts; keying on the
   * package and the text (no time) keeps one candidate. The queue remembers a key for 7 days.
   */
  fun dedupKey(packageName: String, body: String): String =
    "n|${packageName.trim().lowercase()}|${SmsParts.dedupKey(packageName, body, 0).substringAfterLast('|')}"
}
