/**
 * What may leave the phone in an error report (plan T9.4, spec §22): no message text, file
 * contents, request bodies or credentials. Pure functions, so they are unit-tested.
 */
export const REDACTED = '[redacted]';
const MAX_STRING = 300;
const MAX_DEPTH = 6;

/** Compared lower-case with `_` and `-` removed. */
const SENSITIVE_KEYS = new Set([
  'body',
  'rawbody',
  'rawcontent',
  'content',
  'text',
  'sms',
  'smsbody',
  'messagebody',
  'payload',
  'data',
  'password',
  'pin',
  'token',
  'accesstoken',
  'refreshtoken',
  'idtoken',
  'authorization',
  'cookie',
  'cookies',
  'otp',
  'secret',
]);

export function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase().replace(/[_-]/g, ''));
}

function truncate(value: string): string {
  return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
}

export function scrubValue(value: unknown, depth = 0, seen: WeakSet<object> = new WeakSet()): unknown {
  if (typeof value === 'string') return truncate(value);
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[circular]';
  if (depth >= MAX_DEPTH) return '[nested]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => scrubValue(item, depth + 1, seen));
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(item, depth + 1, seen);
  }
  return out;
}

export interface ScrubbableBreadcrumb {
  category?: string;
  message?: string;
  data?: { [key: string]: unknown };
}

export interface ScrubbableEvent {
  request?: { data?: unknown; cookies?: unknown; query_string?: unknown; headers?: Record<string, string> };
  extra?: Record<string, unknown>;
  contexts?: Record<string, unknown>;
  breadcrumbs?: ScrubbableBreadcrumb[];
}

/**
 * Console breadcrumbs lose their text (any `console.log` could print a message body); others
 * keep a short message and scrubbed data.
 */
export function scrubBreadcrumb<T extends ScrubbableBreadcrumb>(crumb: T): T {
  const next = { ...crumb };
  if (crumb.category === 'console') {
    next.message = REDACTED;
    delete next.data;
    return next;
  }
  if (typeof crumb.message === 'string') next.message = truncate(crumb.message);
  if (crumb.data) next.data = scrubValue(crumb.data) as Record<string, unknown>;
  return next;
}

export function scrubEvent<T extends ScrubbableEvent>(event: T): T {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    delete event.request.query_string;
    if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
  }
  if (event.extra) event.extra = scrubValue(event.extra) as Record<string, unknown>;
  if (event.contexts) event.contexts = scrubValue(event.contexts) as Record<string, unknown>;
  if (event.breadcrumbs) event.breadcrumbs = event.breadcrumbs.map(scrubBreadcrumb);
  return event;
}
