package app.budgetbrain.smsdetector.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class SmsPartsTest {
  @Test fun joinsMultipartMessagesPerSender() {
    val messages = SmsParts.assemble(
      listOf(
        SmsPart("VM-HDFCBK", "Rs 100 debited ", 2000),
        SmsPart("VM-HDFCBK", "from a/c 1234", 1000),
        SmsPart("VM-ICICIB", "Rs 5 credited", 3000),
      )
    )
    assertEquals(2, messages.size)
    assertEquals(SmsMessage("VM-HDFCBK", "Rs 100 debited from a/c 1234", 1000), messages[0])
    assertEquals("VM-ICICIB", messages[1].sender)
  }

  @Test fun dedupKeyMatchesTheSameMessageFromReceiverAndInbox() {
    val live = SmsParts.dedupKey("VM-HDFCBK", "Rs 100 debited", 1_700_000_000_123)
    val inbox = SmsParts.dedupKey("AD-HDFCBK", "Rs 100 debited", 1_700_000_000_900)
    assertEquals(live, inbox)
    assertNotEquals(live, SmsParts.dedupKey("VM-HDFCBK", "Rs 101 debited", 1_700_000_000_123))
  }
}
