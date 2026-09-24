package app.budgetbrain.smsdetector.core

/**
 * Catch-up bookkeeping (plan T2.6). One date watermark for the whole inbox; it only moves
 * forward, so a restart never rescans messages already seen.
 */
object Watermark {
  /** The new watermark after scanning messages with these dates. */
  fun advance(current: Long, scannedDates: List<Long>): Long =
    maxOf(current, scannedDates.maxOrNull() ?: current)

  /**
   * Where a scan starts. With no watermark yet the floor applies, so a fresh install doesn't
   * import old messages the user didn't ask for.
   */
  fun startFor(stored: Long?, floor: Long): Long = stored ?: floor
}
