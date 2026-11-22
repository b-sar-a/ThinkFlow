import { describe, expect, it } from 'vitest';
import { cleanEvent, computeFunnel, recordEvent, type StoredEvent } from '../server/analytics';
import { createFakeDb } from './helpers/fakeDb';

const NOW = Date.UTC(2026, 10, 22, 10, 0, 0);
const DAY = 86_400_000;

describe('cleanEvent', () => {
  it('rejects unknown names and malformed device ids', () => {
    expect(cleanEvent({ name: 'nope', anonId: 'abcdefgh1234' })).toBeNull();
    expect(cleanEvent({ name: 'landing_view', anonId: 'short' })).toBeNull();
    expect(cleanEvent({ name: 'landing_view', anonId: 'has spaces and <script>' })).toBeNull();
    expect(cleanEvent(null)).toBeNull();
    expect(cleanEvent('landing_view')).toBeNull();
  });

  it('keeps only small, safe props', () => {
    const event = cleanEvent({
      name: 'signup_completed',
      anonId: 'abcd-1234-efgh',
      props: { method: 'google', 'Bad Key': 'x', note: '<script>alert(1)</script>', lang: 'ru', a: 1, b: 2, c: 3 },
    })!;
    expect(event.props).toEqual({ method: 'google', lang: 'ru' });
    expect(JSON.stringify(event)).not.toContain('script');
  });

  it('ignores props that are not an object', () => {
    expect(cleanEvent({ name: 'landing_view', anonId: 'abcd-1234-efgh', props: ['x'] })!.props).toEqual({});
    expect(cleanEvent({ name: 'landing_view', anonId: 'abcd-1234-efgh', props: 'x' })!.props).toEqual({});
  });
});

describe('recordEvent', () => {
  it('stores every milestone once per device', async () => {
    const { db } = createFakeDb();
    const signup = cleanEvent({ name: 'signup_completed', anonId: 'device-aaaa-1111' })!;
    expect(await recordEvent(db, signup, 'uid1', NOW)).toBe(true);
    expect(await recordEvent(db, signup, 'uid1', NOW + 5 * DAY)).toBe(false);
  });

  it('stores a site visit once per device per day', async () => {
    const { db } = createFakeDb();
    const visit = cleanEvent({ name: 'landing_view', anonId: 'device-aaaa-1111' })!;
    expect(await recordEvent(db, visit, null, NOW)).toBe(true);
    expect(await recordEvent(db, visit, null, NOW + 1000)).toBe(false);
    expect(await recordEvent(db, visit, null, NOW + DAY)).toBe(true);
  });

  it('stores nothing but the whitelisted fields (no email, no name, no text)', async () => {
    const { db, store } = createFakeDb();
    await recordEvent(db, cleanEvent({ name: 'signup_completed', anonId: 'device-aaaa-1111' })!, 'uid1', NOW);
    const saved = [...store.values()][0];
    expect(Object.keys(saved).sort()).toEqual(['anonId', 'day', 'name', 'props', 'ts', 'uid']);
  });
});

describe('computeFunnel', () => {
  const ev = (name: string, anonId: string, daysAgo = 0): StoredEvent => ({
    name,
    anonId,
    day: new Date(NOW - daysAgo * DAY).toISOString().slice(0, 10),
    ts: NOW,
  });

  const events = [
    ...['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'].map((id) => ev('landing_view', id)),
    ...['a', 'b', 'c', 'd', 'e'].map((id) => ev('signup_started', id)),
    ...['a', 'b', 'c', 'd'].map((id) => ev('signup_completed', id)),
    ...['a', 'b', 'c'].map((id) => ev('onboarding_completed', id)),
    ev('first_lab_topic', 'a'),
    ev('first_task_completed', 'a'),
    ev('first_lesson_completed', 'b'),
    ev('landing_view', 'a', 1),
  ];

  it('counts distinct devices per step and the share of the previous and first step', () => {
    const { funnel } = computeFunnel(events, NOW, 14);
    expect(funnel.map((s) => s.count)).toEqual([10, 5, 4, 3, 2]);
    expect(funnel.map((s) => s.fromPrevious)).toEqual([null, 50, 80, 75, 67]);
    expect(funnel.map((s) => s.fromFirst)).toEqual([null, 50, 40, 30, 20]);
  });

  it('counts a device once for "activated" even if it did several learning actions', () => {
    const { funnel, extras } = computeFunnel(events, NOW, 14);
    expect(funnel[4].count).toBe(2); // a (two actions) and b
    expect(extras.first_task_completed).toBe(1);
  });

  it('builds the daily series', () => {
    const { daily } = computeFunnel(events, NOW, 14);
    expect(daily).toHaveLength(14);
    expect(daily.at(-1)).toEqual({ day: '2026-11-22', visits: 10, signups: 4 });
    expect(daily.at(-2)!.visits).toBe(1);
  });

  it('handles no data without dividing by zero', () => {
    const { funnel, totalEvents } = computeFunnel([], NOW);
    expect(funnel.map((s) => s.fromPrevious)).toEqual([null, null, null, null, null]);
    expect(totalEvents).toBe(0);
  });
});
