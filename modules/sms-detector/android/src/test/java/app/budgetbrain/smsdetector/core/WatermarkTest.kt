package app.budgetbrain.smsdetector.core

import org.junit.Assert.assertEquals
import org.junit.Test

class WatermarkTest {
  @Test fun onlyMovesForward() {
    assertEquals(500L, Watermark.advance(500L, listOf(100L, 400L)))
    assertEquals(900L, Watermark.advance(500L, listOf(900L, 600L)))
    assertEquals(500L, Watermark.advance(500L, emptyList()))
  }

  @Test fun startsAtTheFloorOnAFreshInstall() {
    assertEquals(1_000L, Watermark.startFor(null, 1_000L))
    assertEquals(2_000L, Watermark.startFor(2_000L, 1_000L))
  }
}
