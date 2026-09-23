export interface ExtractedDetails {
  amount: number | null;
  currency: string;
  accountTail: string | null;
  referenceNumber: string | null;
  transactionDate: string; // YYYY-MM-DD
  rawMerchantCandidate: string | null;
}

// Patterns that identify account or balance amounts that must NOT be confused with transaction amount
const BALANCE_REGEX =
  /(?:avbl?\s*bal|available\s*balance|bal\s*is|curr\s*bal|balance)\s*(?::|is)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/gi;

const PRIMARY_AMOUNT_PATTERNS = [
  // "debited by Rs. 1,250.00" / "spent Rs 500"
  /(?:debited|spent|paid|withdrawn|credited|received|deposited)\s+(?:by|for|of)?\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i,
  // "Rs. 1,250.00 debited" / "INR 500 spent"
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent|paid|withdrawn|credited|received|deposited)/i,
  // "txn of Rs 500" / "payment of Rs 500"
  /(?:txn|transaction|payment|transfer|purchase)\s+(?:of)?\s*(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i,
  // Fallback: any Currency symbol followed by digits if it's the only one
  /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i,
];

const ACCOUNT_PATTERNS = [
  /(?:a\/?c|acct|account|card)\s*(?:no\.?)?\s*(?:ending\s*)?([xX*]*\d{3,4})/i,
  /ending\s+([xX*]*\d{3,4})/i,
  /\b([xX*]{2,}\d{3,4})\b/,
];

const REFERENCE_PATTERNS = [
  /(?:ref|utr|rrn|txn\s*id|transaction\s*id)\s*[:\-]?\s*([A-Za-z0-9]{8,22})/i,
  /UPI\s*[:\/]?\s*([0-9]{10,14})/i,
];

const MERCHANT_EXTRACTION_PATTERNS = [
  /(?:at|to|info:?|vpa)\s+([A-Za-z0-9\s&.\-@]{3,35})(?:\s+on|\s+ref|\s+avail|\s+bal|\.|$)/i,
  /(?:spent\s+on|paid\s+to)\s+([A-Za-z0-9\s&.\-@]{3,35})/i,
  /vpa\s+([A-Za-z0-9_.\-]+@[a-zA-Z0-9]+)/i,
];

const DATE_PATTERNS = [
  /(\d{2}[-/]\d{2}[-/]\d{2,4})/,
  /(\d{2}-[A-Za-z]{3}-\d{2,4})/,
  /(\d{2}\s+[A-Za-z]{3}\s+\d{2,4})/,
];

export function extractTransactionDetails(
  content: string,
  fallbackTimestamp: string = new Date().toISOString()
): ExtractedDetails {
  let amount: number | null = null;
  let currency = 'INR';

  // Currency detection
  if (/\b(?:USD|\$)\b/i.test(content)) currency = 'USD';
  else if (/\b(?:EUR|€)\b/i.test(content)) currency = 'EUR';
  else if (/\b(?:GBP|£)\b/i.test(content)) currency = 'GBP';
  else if (/\b(?:AED)\b/i.test(content)) currency = 'AED';

  // 1. Identify and mask balances so they aren't parsed as transaction amount
  const balancesFound: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = BALANCE_REGEX.exec(content)) !== null) {
    balancesFound.push(match[1].replace(/,/g, ''));
  }

  // 2. Extract transaction amount using prioritized patterns
  for (const pattern of PRIMARY_AMOUNT_PATTERNS) {
    const amtMatch = content.match(pattern);
    if (amtMatch) {
      const candidateStr = amtMatch[1].replace(/,/g, '');
      const candidateNum = parseFloat(candidateStr);

      // Verify that this candidate isn't one of the matched available balances
      if (!isNaN(candidateNum) && candidateNum > 0) {
        if (!balancesFound.includes(candidateStr) || balancesFound.length === 0) {
          amount = candidateNum;
          break;
        }
      }
    }
  }

  // 3. Extract account / card tail (last 3 or 4 digits)
  let accountTail: string | null = null;
  for (const pattern of ACCOUNT_PATTERNS) {
    const accMatch = content.match(pattern);
    if (accMatch) {
      const raw = accMatch[1];
      const digitsOnly = raw.replace(/\D/g, '');
      if (digitsOnly.length >= 3 && digitsOnly.length <= 4) {
        accountTail = digitsOnly;
        break;
      }
    }
  }

  // 4. Extract reference number (UTR, UPI ref)
  let referenceNumber: string | null = null;
  for (const pattern of REFERENCE_PATTERNS) {
    const refMatch = content.match(pattern);
    if (refMatch) {
      referenceNumber = refMatch[1].trim();
      break;
    }
  }

  // 5. Extract merchant candidate
  let rawMerchantCandidate: string | null = null;
  for (const pattern of MERCHANT_EXTRACTION_PATTERNS) {
    const mMatch = content.match(pattern);
    if (mMatch) {
      const cleanCandidate = mMatch[1].trim().replace(/[.,;]$/, '');
      // Avoid capturing common non-merchant words
      if (!/^(your|account|bank|card|self|credit|debit)$/i.test(cleanCandidate)) {
        rawMerchantCandidate = cleanCandidate;
        break;
      }
    }
  }

  // 6. Extract transaction date
  let transactionDate = fallbackTimestamp.split('T')[0];
  for (const pattern of DATE_PATTERNS) {
    const dMatch = content.match(pattern);
    if (dMatch) {
      const parsedDate = new Date(dMatch[1]);
      if (!isNaN(parsedDate.getTime())) {
        transactionDate = parsedDate.toISOString().split('T')[0];
        break;
      }
    }
  }

  return {
    amount,
    currency,
    accountTail,
    referenceNumber,
    transactionDate,
    rawMerchantCandidate,
  };
}
