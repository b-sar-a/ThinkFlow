import { auth } from './firebase';

/**
 * Funnel milestones (see server/analytics.ts). Fire-and-forget: it never throws, never blocks
 * the UI, and is skipped when the browser sends Do Not Track. The id is random and anonymous.
 */
export type TrackEvent =
  | 'landing_view'
  | 'signup_started'
  | 'signup_completed'
  | 'onboarding_completed'
  | 'first_lab_topic'
  | 'first_task_completed'
  | 'first_lesson_completed'
  | 'referral_claimed'
  | 'parent_linked'
  | 'active_day'
  | 'lesson_completed'
  | 'lesson_feedback'
  | 'lesson_issue';

const ID_KEY = 'tf_anon_id';
const SENT_KEY = 'tf_events_sent';

function anonId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id || !/^[A-Za-z0-9-]{8,40}$/.test(id)) {
      id = crypto.randomUUID();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

const trackingAllowed = () => {
  const dnt = (navigator as any).doNotTrack ?? (window as any).doNotTrack;
  return dnt !== '1' && dnt !== 'yes';
};

// Milestones fire once per device; remember them so we do not send the same one again.
const alreadySent = (name: string): boolean => {
  try {
    return (JSON.parse(localStorage.getItem(SENT_KEY) || '[]') as string[]).includes(name);
  } catch {
    return false;
  }
};
const rememberSent = (name: string) => {
  try {
    const list = JSON.parse(localStorage.getItem(SENT_KEY) || '[]') as string[];
    if (!list.includes(name)) localStorage.setItem(SENT_KEY, JSON.stringify([...list, name]));
  } catch {
    /* ignore */
  }
};

// In flight or sent during this page visit: stops duplicates (React dev double effects, double clicks).
const sessionSent = new Set<string>();

export function track(name: TrackEvent, props?: Record<string, string>): void {
  try {
    if (!trackingAllowed()) return;
    const id = anonId();
    if (!id) return;
    const key = props?.lesson ? `${name}:${props.lesson}` : name;
    // landing_view and active_day repeat daily on the server, so only the other events are remembered for good.
    const daily = name === 'landing_view' || name === 'active_day';
    if (sessionSent.has(key)) return;
    if (!daily && alreadySent(key)) return;
    sessionSent.add(key);

    const send = async () => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const user = auth.currentUser;
      if (user) {
        try {
          headers.Authorization = `Bearer ${await user.getIdToken()}`;
        } catch {
          /* send anonymously */
        }
      }
      const response = await fetch('/api/track', { method: 'POST', headers, body: JSON.stringify({ name, anonId: id, props }), keepalive: true });
      // Remember only what really went out, so an offline moment does not lose a milestone.
      if (response.ok) {
        if (!daily) rememberSent(key);
      } else {
        sessionSent.delete(key);
      }
    };
    send().catch(() => sessionSent.delete(key));
  } catch {
    /* analytics must never break the app */
  }
}
