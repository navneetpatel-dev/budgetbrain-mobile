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

  @Test fun keepsAnUnknownBusinessHeaderThatNamesABank() {
    val content = SenderFilter(listOf("HDFCBK"), emptyList(), listOf("HDFC Bank", "Axis Bank", "SBI"), listOf("HDFC", "hdf"))
    val debit = "Rs.1,250.00 debited from your HDFC Bank a/c **1234"
    assertTrue(content.accepts("VM-NEWHDR", debit))
    assertTrue(content.accepts("AX-XYZPAY", "INR 500 sent to HDFC0001234 via NEFT"))
    // Whole words only, a money token still required, and never from a phone number.
    assertFalse(content.accepts("VM-NEWHDR", "Rs 500 at XHDFC BANKS store"))
    assertFalse(content.accepts("VM-NEWHDR", "Visit your HDFC Bank branch today"))
    assertFalse(content.accepts("+919876543210", debit))
    assertFalse(content.accepts("98765 43210", debit))
    // One-word names and malformed prefixes are not kept: too broad for a pre-filter.
    assertFalse(content.accepts("VM-NEWHDR", "Rs 500 paid, SBI"))
    assertFalse(content.accepts("VM-NEWHDR", "Rs 500 to HDF00001234"))
    // The pre-filter without names behaves as before.
    assertFalse(filter.accepts("VM-NEWHDR", debit))
    val restored = SenderFilter.deserialize(content.serialize())
    assertTrue(restored.accepts("VM-NEWHDR", debit))
    assertTrue(restored.accepts("AX-XYZPAY", "INR 500 sent to HDFC0001234 via NEFT"))
    assertFalse(SenderFilter(emptyList(), emptyList(), listOf("AXIS BANK"), emptyList()).isEmpty)
  }

  @Test fun keepsNothingUntilThePackSendersArrive() {
    assertTrue(SenderFilter.EMPTY.isEmpty)
    assertFalse(SenderFilter.EMPTY.accepts("VM-HDFCBK", "Rs 100 debited"))
  }
}
