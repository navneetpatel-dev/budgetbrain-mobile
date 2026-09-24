/**
 * The user's own account numbers and UPI IDs (plan T5.7). A message that moves money between two
 * of them is a transfer, not spending. Only the last digits and the VPA are kept.
 */

/** Last 3–4 digits of an account or card number, or null when there aren't enough digits. */
export function normalizeAccountTail(input: string): string | null {
  const tail = input.replace(/\D/g, '').slice(-4);
  return tail.length >= 3 ? tail : null;
}

/** A lower-cased UPI ID such as `name@okhdfc`, or null when it isn't one. */
export function normalizeVpa(input: string): string | null {
  const vpa = input.trim().toLowerCase();
  return /^[\w.-]{2,}@[a-z][a-z0-9]+$/.test(vpa) ? vpa : null;
}
