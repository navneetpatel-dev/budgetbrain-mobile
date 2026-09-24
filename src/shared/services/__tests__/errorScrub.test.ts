import { describe, expect, it } from '@jest/globals';
import { REDACTED, scrubBreadcrumb, scrubEvent, scrubValue } from '../errorScrub';

describe('error report scrubbing (T9.4)', () => {
  it('replaces sensitive keys at any depth and cuts long strings', () => {
    expect(
      scrubValue({ userId: 'u1', payload: { amount: '10' }, nested: { raw_content: 'x', smsBody: 'y', ok: 'z'.repeat(400) } })
    ).toEqual({ userId: 'u1', payload: REDACTED, nested: { raw_content: REDACTED, smsBody: REDACTED, ok: `${'z'.repeat(300)}…` } });
  });

  it('never keeps console text, bodies, cookies or tokens in a report', () => {
    const event = scrubEvent({
      request: { data: '{"text":"Rs 250 debited"}', cookies: 'sid=1', headers: { Authorization: 'Bearer t', Accept: 'json' } },
      extra: { body: 'Rs 250 debited', screen: 'review' },
      breadcrumbs: [
        { category: 'console', message: 'Rs 250 debited from a/c 1234', data: { arguments: ['Rs 250'] } },
        { category: 'xhr', data: { url: '/detected-transactions/sync', status_code: 500, body: 'x' } },
      ],
    });
    expect(event.request).toEqual({ headers: { Authorization: REDACTED, Accept: 'json' } });
    expect(event.extra).toEqual({ body: REDACTED, screen: 'review' });
    expect(event.breadcrumbs).toEqual([
      { category: 'console', message: REDACTED },
      { category: 'xhr', data: { url: '/detected-transactions/sync', status_code: 500, body: REDACTED } },
    ]);
    expect(JSON.stringify(event)).not.toContain('Rs 250');
  });

  it('leaves the input breadcrumb untouched', () => {
    const crumb = { category: 'console', message: 'secret' };
    scrubBreadcrumb(crumb);
    expect(crumb.message).toBe('secret');
  });
});
