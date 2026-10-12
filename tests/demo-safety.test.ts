import { describe, expect, it } from 'vitest';
import { assertDemoCapacity, buildDemoUid, mayDeleteFirestorePath, mayResetAuthUser } from '../shared/demo-safety';

describe('demo reset safety', () => {
  it('refuses org data and the admin uid', () => {
    expect(mayDeleteFirestorePath('org/main/products/1')).toBe(false);
    expect(mayDeleteFirestorePath('sandboxes/strachan-admin/catalog/products/items/1')).toBe(false);
    expect(mayResetAuthUser('admin')).toBe(false);
    expect(mayResetAuthUser('strachan')).toBe(false);
  });

  it('allows only demo sandboxes and demo users', () => {
    const uid = buildDemoUid('store-admin', 'abcdabcdabcdabcd');
    expect(mayDeleteFirestorePath(`sandboxes/${uid}/catalog/products/items/1`)).toBe(true);
    expect(mayResetAuthUser(uid)).toBe(true);
  });

  it('stops at the daily and hourly caps', () => {
    const now = new Date('2026-10-11T18:00:00.000Z');
    expect(() => assertDemoCapacity({ day: '2026-10-11', dayCount: 300, clients: {} }, 'hash', now)).toThrow(/resource-exhausted/);
    expect(() => assertDemoCapacity({
      day: '2026-10-11',
      dayCount: 1,
      clients: { hash: { hour: '2026-10-11T18', count: 5 } },
    }, 'hash', now)).toThrow(/resource-exhausted/);
  });
});
