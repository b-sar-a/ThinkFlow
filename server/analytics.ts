import type { Db } from "./family.js";

/**
 * First-party funnel analytics. The client sends a few named milestones tied to a random,
 * anonymous device id; the server stores each milestone once and the admin panel counts them.
 * No personal data is stored: no email, name or free text, only whitelisted names and tiny props.
 */

export const EVENT_NAMES = [
  "landing_view",
  "signup_started",
  "signup_completed",
  "onboarding_completed",
  "first_lab_topic",
  "first_task_completed",
  "first_lesson_completed",
  "referral_claimed",
  "parent_linked",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** The learning milestones that count as "activated". */
export const ACTIVATION_EVENTS: EventName[] = ["first_lab_topic", "first_task_completed", "first_lesson_completed"];

const NAME_SET = new Set<string>(EVENT_NAMES);
const ANON_ID = /^[A-Za-z0-9-]{8,40}$/;
const PROP_KEY = /^[a-z_]{1,16}$/;
const PROP_VALUE = /^[A-Za-z0-9_.-]{1,24}$/;

export interface CleanEvent {
  name: EventName;
  anonId: string;
  props: Record<string, string>;
}

/** Returns a safe event, or null when the input is not an accepted milestone. */
export function cleanEvent(body: any): CleanEvent | null {
  const name = String(body?.name ?? "");
  const anonId = String(body?.anonId ?? "");
  if (!NAME_SET.has(name) || !ANON_ID.test(anonId)) return null;

  const props: Record<string, string> = {};
  const raw = body?.props;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw).slice(0, 4)) {
      const v = String(value);
      if (PROP_KEY.test(key) && PROP_VALUE.test(v)) props[key] = v;
    }
  }
  return { name: name as EventName, anonId, props };
}

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/**
 * Stores the event once: every milestone once per device, except landing_view, which is once
 * per device per day. Returns true when something new was written.
 */
export async function recordEvent(db: Db, event: CleanEvent, uid: string | null, now = Date.now()): Promise<boolean> {
  const day = utcDay(now);
  const id = event.name === "landing_view" ? `${event.anonId}_${event.name}_${day}` : `${event.anonId}_${event.name}`;
  const ref = db.doc(`analytics_events/${id}`);
  if ((await ref.get()).exists) return false;
  await ref.set({ name: event.name, anonId: event.anonId, uid, day, ts: now, props: event.props });
  return true;
}

export interface StoredEvent {
  name: string;
  anonId: string;
  day: string;
  ts: number;
}

export interface FunnelStep {
  key: string;
  count: number;
  /** Share of the previous step, capped at 100 (counts are per device, not a strict cohort). */
  fromPrevious: number | null;
  /** Share of the first step. */
  fromFirst: number | null;
}

const distinct = (events: StoredEvent[], names: string[]) =>
  new Set(events.filter((e) => names.includes(e.name)).map((e) => e.anonId)).size;

const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : null);

/** Pure: counts distinct devices per step. The admin endpoint feeds it the stored events. */
export function computeFunnel(events: StoredEvent[], now = Date.now(), days = 14) {
  const steps: { key: string; names: string[] }[] = [
    { key: "landing_view", names: ["landing_view"] },
    { key: "signup_started", names: ["signup_started"] },
    { key: "signup_completed", names: ["signup_completed"] },
    { key: "onboarding_completed", names: ["onboarding_completed"] },
    { key: "activated", names: ACTIVATION_EVENTS },
  ];
  const counts = steps.map((s) => distinct(events, s.names));
  const funnel: FunnelStep[] = steps.map((s, i) => ({
    key: s.key,
    count: counts[i],
    fromPrevious: i === 0 ? null : pct(counts[i], counts[i - 1]),
    fromFirst: i === 0 ? null : pct(counts[i], counts[0]),
  }));

  const extras = Object.fromEntries(
    ["first_lab_topic", "first_task_completed", "first_lesson_completed", "referral_claimed", "parent_linked"].map((n) => [n, distinct(events, [n])])
  );

  const daily = Array.from({ length: days }, (_, i) => {
    const day = utcDay(now - (days - 1 - i) * 86_400_000);
    const on = events.filter((e) => e.day === day);
    return {
      day,
      visits: distinct(on, ["landing_view"]),
      signups: distinct(on, ["signup_completed"]),
    };
  });

  return { funnel, extras, daily, totalEvents: events.length };
}
