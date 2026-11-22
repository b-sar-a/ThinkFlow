import { describe, expect, it } from 'vitest';
import { QuotaError, createMemoryQuota } from '../server/quota';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 22, 12);

describe('memory quota (fallback when Firestore is not configured)', () => {
  it('lets a student spend up to the daily limit, then stops them', () => {
    const quota = createMemoryQuota({ perUserDaily: 1000, globalDaily: 1_000_000 });
    quota.reserve('a', 600, T0);
    quota.reserve('a', 600, T0); // the check happens before adding, so one request can cross the line
    expect(() => quota.reserve('a', 1, T0)).toThrow(QuotaError);
    expect(() => quota.reserve('a', 1, T0)).toThrow('USER_DAILY_LIMIT');
  });

  it('keeps students separate', () => {
    const quota = createMemoryQuota({ perUserDaily: 100, globalDaily: 1_000_000 });
    quota.reserve('a', 150, T0);
    expect(() => quota.reserve('a', 1, T0)).toThrow('USER_DAILY_LIMIT');
    expect(() => quota.reserve('b', 150, T0)).not.toThrow();
  });

  it('stops everyone when the whole instance reaches its daily budget', () => {
    const quota = createMemoryQuota({ perUserDaily: 1000, globalDaily: 300 });
    quota.reserve('a', 200, T0);
    quota.reserve('b', 200, T0);
    expect(() => quota.reserve('c', 1, T0)).toThrow('GLOBAL_DAILY_LIMIT');
  });

  it('settles an estimate to the real count, and releases a failed call', () => {
    const quota = createMemoryQuota({ perUserDaily: 1000, globalDaily: 1_000_000 });
    quota.reserve('a', 500, T0);
    quota.adjust('a', -300, T0); // the real call cost 200
    expect(quota.usage('a', T0)).toEqual({ user: 200, global: 200 });
    quota.reserve('a', 400, T0);
    quota.adjust('a', -400, T0); // the call failed: release
    expect(quota.usage('a', T0)).toEqual({ user: 200, global: 200 });
  });

  it('never goes below zero', () => {
    const quota = createMemoryQuota({ perUserDaily: 1000, globalDaily: 1000 });
    quota.adjust('a', -50, T0);
    expect(quota.usage('a', T0)).toEqual({ user: 0, global: 0 });
  });

  it('starts fresh on a new day', () => {
    const quota = createMemoryQuota({ perUserDaily: 100, globalDaily: 100 });
    quota.reserve('a', 150, T0);
    expect(() => quota.reserve('a', 1, T0)).toThrow(QuotaError);
    expect(() => quota.reserve('a', 1, T0 + DAY)).not.toThrow();
    expect(quota.usage('a', T0 + DAY)).toEqual({ user: 1, global: 1 });
  });
});
