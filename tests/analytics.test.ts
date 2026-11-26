import { describe, expect, it } from 'vitest';
import { cleanEvent, computeFunnel, computeLessons, computeRetention, recordEvent, type StoredEvent } from '../server/analytics';
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

describe('habit and lesson events', () => {
  const dayMs = DAY;
  const at = (offset: number) => NOW - offset * dayMs;
  const active = (anonId: string, offset: number): StoredEvent => ({ name: 'active_day', anonId, day: new Date(at(offset)).toISOString().slice(0, 10), ts: at(offset) });

  it('store active_day once per device per day and lesson events once per lesson', async () => {
    const { db, count } = createFakeDb();
    const day = cleanEvent({ name: 'active_day', anonId: 'device-aaaa-1111' })!;
    expect(await recordEvent(db, day, 'u1', NOW)).toBe(true);
    expect(await recordEvent(db, day, 'u1', NOW + 3600_000)).toBe(false);
    expect(await recordEvent(db, day, 'u1', NOW + DAY)).toBe(true);

    const done = (lesson: string) => cleanEvent({ name: 'lesson_completed', anonId: 'device-aaaa-1111', props: { lesson } })!;
    expect(await recordEvent(db, done('algebra-7-9.systems'), 'u1', NOW)).toBe(true);
    expect(await recordEvent(db, done('algebra-7-9.systems'), 'u1', NOW + DAY)).toBe(false);
    expect(await recordEvent(db, done('algebra-7-9.quadratics'), 'u1', NOW)).toBe(true);
    expect(count('analytics_events/')).toBe(4);
  });

  it('refuse lesson events without a lesson and feedback without a valid vote', async () => {
    const { db, count } = createFakeDb();
    expect(await recordEvent(db, cleanEvent({ name: 'lesson_completed', anonId: 'device-aaaa-1111' })!, null, NOW)).toBe(false);
    expect(await recordEvent(db, cleanEvent({ name: 'lesson_feedback', anonId: 'device-aaaa-1111', props: { lesson: 'a.b', vote: 'maybe' } })!, null, NOW)).toBe(false);
    expect(await recordEvent(db, cleanEvent({ name: 'lesson_feedback', anonId: 'device-aaaa-1111', props: { lesson: 'a.b', vote: 'up' } })!, null, NOW)).toBe(true);
    expect(count('analytics_events/')).toBe(1);
  });

  it('accept a lesson id of a long program name', () => {
    const event = cleanEvent({ name: 'lesson_completed', anonId: 'device-aaaa-1111', props: { lesson: 'history-uzbekistan.independence' } })!;
    expect(event.props.lesson).toBe('history-uzbekistan.independence');
  });

  it('count who came back the next day and in week two', () => {
    const events = [
      // a: first seen 10 days ago, back the next day and on day 8
      active('device-a-0001', 10), active('device-a-0001', 9), active('device-a-0001', 2),
      // b: first seen 10 days ago, never came back
      active('device-b-0002', 10),
      // c: first seen 3 days ago, back the next day
      active('device-c-0003', 3), active('device-c-0003', 2),
      // d: first seen today: in no cohort yet
      active('device-d-0004', 0),
      // e: first seen 10 days ago, back the next day only: counts for d1 but not for week 2
      active('device-e-0005', 10), active('device-e-0005', 9),
    ];
    const r = computeRetention(events, NOW);
    expect(r.devices).toBe(5);
    expect(r.d1).toEqual({ cohort: 4, back: 3, percent: 75 });
    expect(r.w1).toEqual({ cohort: 3, back: 1, percent: 33 });
    expect(r.activeLast7Days).toBe(3);
  });

  it('give no percentage for an empty cohort', () => {
    const r = computeRetention([], NOW);
    expect(r.d1.percent).toBeNull();
    expect(r.w1.percent).toBeNull();
    expect(computeFunnel([], NOW).retention.devices).toBe(0);
  });

  it('rank lessons with mistake reports first and count devices, not events', () => {
    const e = (name: string, anonId: string, props: Record<string, string>): StoredEvent => ({ name, anonId, day: '2026-11-20', ts: NOW, props });
    const lessons = computeLessons([
      e('lesson_completed', 'device-a-0001', { lesson: 'a.one' }),
      e('lesson_completed', 'device-b-0002', { lesson: 'a.one' }),
      e('lesson_feedback', 'device-a-0001', { lesson: 'a.one', vote: 'up' }),
      e('lesson_completed', 'device-a-0001', { lesson: 'a.two' }),
      e('lesson_feedback', 'device-a-0001', { lesson: 'a.two', vote: 'down' }),
      e('lesson_issue', 'device-a-0001', { lesson: 'a.two' }),
      e('lesson_issue', 'device-a-0001', { lesson: 'a.two' }),
    ]);
    expect(lessons.map((l) => l.lesson)).toEqual(['a.two', 'a.one']);
    expect(lessons[0]).toEqual({ lesson: 'a.two', completed: 1, up: 0, down: 1, issues: 1 });
    expect(lessons[1]).toEqual({ lesson: 'a.one', completed: 2, up: 1, down: 0, issues: 0 });
  });
});
