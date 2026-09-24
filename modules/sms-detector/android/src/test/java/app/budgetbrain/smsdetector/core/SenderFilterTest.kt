package app.budgetbrain.smsdetector.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class SenderFilterTest {
  private val filter = SenderFilter(listOf("HDFCBK", "ICICIB"), listOf("KOTAK"))

  @Test fun normalizesDltSenders() {
    assertEquals("HDFCBK", SenderFilter.normalizeSender("VM-HDFCBK"))
    assertEquals("HDFCBK", SenderFilter.normalizeSender("ad-hdfcbk-s"))
    assertEquals("HDFCBK", SenderFilter.normalizeSender(" HDFCBK "))
    assertEquals("+919876543210", SenderFilter.normalizeSender("+919876543210"))
  }

  @Test fun keepsKnownHeadersAndKeywords() {
    assertTrue(filter.matchesSender("VM-HDFCBK"))
    assertTrue(filter.matchesSender("JD-KOTAKB"))
    assertFalse(filter.matchesSender("VM-SWIGGY"))
    assertFalse(filter.matchesSender("+919876543210"))
    assertFalse(filter.matchesSender(""))
  }

  @Test fun requiresAMoneyToken() {
    assertTrue(filter.accepts("VM-HDFCBK", "Rs.1,250.00 debited from a/c **1234"))
    assertTrue(filter.accepts("VM-HDFCBK", "INR 99 spent on card XX1234"))
    assertTrue(filter.accepts("VM-HDFCBK", "₹500 credited"))
    assertTrue(filter.accepts("VM-HDFCBK", "Amount 1,250.00 debited"))
    assertFalse(filter.accepts("VM-HDFCBK", "Your OTP is 123456"))
    assertFalse(filter.accepts("VM-SWIGGY", "Rs 100 off on your next order"))
  }

  @Test fun onlyReadsTheFirstThousandChars() {
    assertFalse(SenderFilter.hasMoneyToken("x".repeat(1000) + " Rs 100"))
  }

  @Test fun roundTripsThroughPreferences() {
    val restored = SenderFilter.deserialize(filter.serialize())
    assertTrue(restored.matchesSender("VM-ICICIB"))
    assertTrue(restored.matchesSender("VM-KOTAKB"))
    assertFalse(restored.matchesSender("VM-AXISBK"))
    assertTrue(SenderFilter.deserialize(null).isEmpty)
  }

  @Test fun defaultCoversTheMappedBanks() {
    assertTrue(SenderFilter.DEFAULT.matchesSender("VM-SBIINB"))
    assertFalse(SenderFilter.DEFAULT.matchesSender("VM-AMAZON"))
  }
}
