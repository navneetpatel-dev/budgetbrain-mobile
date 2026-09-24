package app.budgetbrain.smsdetector.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NotificationFilterTest {
  private val filter = NotificationFilter(listOf("net.one97.paytm", " com.snapwork.hdfc "))

  @Test fun keepsListedPackagesWithAMoneyToken() {
    assertTrue(filter.accepts("net.one97.paytm", "Paid ₹250 to Swiggy"))
    assertTrue(filter.accepts("COM.SNAPWORK.HDFC", "Rs.1,250.00 debited from a/c **1234"))
    assertFalse(filter.accepts("net.one97.paytm", "Your cashback is waiting"))
    assertFalse(filter.accepts("com.whatsapp", "Rs 500 sent"))
    assertFalse(NotificationFilter.EMPTY.accepts("net.one97.paytm", "Paid ₹250"))
  }

  @Test fun roundTripsThroughPrefs() {
    val restored = NotificationFilter.deserialize(filter.serialize())
    assertTrue(restored.matchesPackage("com.snapwork.hdfc"))
    assertTrue(restored.matchesPackage("net.one97.paytm"))
    assertTrue(NotificationFilter.deserialize(null).isEmpty)
    assertTrue(NotificationFilter.deserialize("").isEmpty)
  }

  @Test fun composesTitleAndText() {
    assertEquals("₹250 debited\nPaid to Swiggy from HDFC a/c", NotificationText.compose("₹250 debited", "Paid to Swiggy from HDFC a/c", null))
    assertEquals("Full alert: ₹250 debited", NotificationText.compose("₹250 debited", "short", "Full alert: ₹250 debited"))
    assertEquals("Paid ₹250", NotificationText.compose(null, "Paid ₹250", null))
    assertEquals("Title only ₹5", NotificationText.compose("Title only ₹5", null, "  "))
  }

  @Test fun keysOnPackageAndTextOnly() {
    val a = NotificationText.dedupKey("net.one97.paytm", "Paid ₹250 to Swiggy")
    assertEquals(a, NotificationText.dedupKey("NET.ONE97.PAYTM", "Paid ₹250 to Swiggy"))
    assertNotEquals(a, NotificationText.dedupKey("net.one97.paytm", "Paid ₹251 to Swiggy"))
    assertTrue(a.startsWith("n|net.one97.paytm|"))
  }
}
