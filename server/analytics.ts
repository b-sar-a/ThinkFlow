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
  // Habit and content signals (what tells us whether students come back and which lessons work):
  "active_day", // the app was opened signed in; once per device per day
  "lesson_completed", // props.lesson; once per device per lesson
  "lesson_feedback", // props.lesson and props.vote ("up" | "down"); once per device per lesson
  "lesson_issue", // props.lesson: "this lesson has a mistake"; once per device per lesson
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** The learning milestones that count as "activated". */
export const ACTIVATION_EVENTS: EventName[] = ["first_lab_topic", "first_task_completed", "first_lesson_completed"];

const NAME_SET = new Set<string>(EVENT_NAMES);
const ANON_ID = /^[A-Za-z0-9-]{8,40}$/;
const PROP_KEY = /^[a-z_]{1,16}$/;
const PROP_VALUE = /^[A-Za-z0-9_.-]{1,48}$/;

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

/** Repeat every day (once per device per day); the lesson events once per device per lesson; the rest once per device. */
const DAILY = new Set<string>(["landing_view", "active_day"]);
const PER_LESSON = new Set<string>(["lesson_completed", "lesson_feedback", "lesson_issue"]);

/** Stores the event once per its rule above. Returns true when something new was written. */
export async function recordEvent(db: Db, event: CleanEvent, uid: string | null, now = Date.now()): Promise<boolean> {
  const day = utcDay(now);
  if (PER_LESSON.has(event.name) && !event.props.lesson) return false;
  if (event.name === "lesson_feedback" && event.props.vote !== "up" && event.props.vote !== "down") return false;
  const id = DAILY.has(event.name)
    ? `${event.anonId}_${event.name}_${day}`
    : PER_LESSON.has(event.name)
      ? `${event.anonId}_${event.name}_${event.props.lesson}`
      : `${event.anonId}_${event.name}`;
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
  props?: Record<string, string>;
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

  return { funnel, extras, daily, totalEvents: events.length, retention: computeRetention(events, now), lessons: computeLessons(events) };
}

const dayIndex = (day: string) => Math.floor(Date.parse(day + "T00:00:00Z") / 86_400_000);

/**
 * Do students come back? Per device, from the days the app was opened signed in.
 * d1: of the devices first seen at least a day ago, how many were back the next day.
 * w1: of the devices first seen at least 7 days ago, how many were back on days 7 to 13.
 * "First seen" is the first day inside the window the events cover, so it is only exact for a young product.
 */
export function computeRetention(events: StoredEvent[], now = Date.now()) {
  const today = dayIndex(utcDay(now));
  const byDevice = new Map<string, Set<number>>();
  for (const e of events) {
    if (e.name !== "active_day") continue;
    const set = byDevice.get(e.anonId) ?? new Set<number>();
    set.add(dayIndex(e.day));
    byDevice.set(e.anonId, set);
  }
  let d1Cohort = 0, d1Back = 0, w1Cohort = 0, w1Back = 0, active7 = 0;
  for (const days of byDevice.values()) {
    const first = Math.min(...days);
    if (first <= today - 1) {
      d1Cohort++;
      if (days.has(first + 1)) d1Back++;
    }
    if (first <= today - 7) {
      w1Cohort++;
      if ([...days].some((d) => d >= first + 7 && d <= first + 13)) w1Back++;
    }
    if ([...days].some((d) => d > today - 7)) active7++;
  }
  return {
    devices: byDevice.size,
    activeLast7Days: active7,
    d1: { cohort: d1Cohort, back: d1Back, percent: pct(d1Back, d1Cohort) },
    w1: { cohort: w1Cohort, back: w1Back, percent: pct(w1Back, w1Cohort) },
  };
}

export interface LessonStat {
  lesson: string;
  completed: number;
  up: number;
  down: number;
  issues: number;
}

/** Per lesson: how many devices finished it, voted up or down, or reported a mistake. Worst first. */
export function computeLessons(events: StoredEvent[], limit = 40): LessonStat[] {
  const stats = new Map<string, { completed: Set<string>; up: Set<string>; down: Set<string>; issues: Set<string> }>();
  const of = (lesson: string) => {
    let s = stats.get(lesson);
    if (!s) stats.set(lesson, (s = { completed: new Set(), up: new Set(), down: new Set(), issues: new Set() }));
    return s;
  };
  for (const e of events) {
    const lesson = e.props?.lesson;
    if (!lesson) continue;
    if (e.name === "lesson_completed") of(lesson).completed.add(e.anonId);
    else if (e.name === "lesson_issue") of(lesson).issues.add(e.anonId);
    else if (e.name === "lesson_feedback") (e.props?.vote === "down" ? of(lesson).down : of(lesson).up).add(e.anonId);
  }
  return [...stats.entries()]
    .map(([lesson, s]) => ({ lesson, completed: s.completed.size, up: s.up.size, down: s.down.size, issues: s.issues.size }))
    .sort((a, b) => b.issues - a.issues || b.down - a.down || b.completed - a.completed || a.lesson.localeCompare(b.lesson))
    .slice(0, limit);
}
