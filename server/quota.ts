/**
 * Fallback token budget for when Firestore is not configured (no FIREBASE_SERVICE_ACCOUNT).
 * The real quota lives in Firestore and is shared by every server instance. Without it the AI used
 * to be completely unmetered, so anyone with a free account could burn the Gemini key.
 *
 * This fallback lives in memory: each server instance keeps its own numbers and forgets them when it
 * restarts, so it is only a safety net that bounds casual abuse, not a replacement for the real quota.
 * It limits every student per day and the whole instance per day.
 */

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const DAY_MS = 86_400_000;
const dayOf = (now: number) => Math.floor(now / DAY_MS);

export function createMemoryQuota(options: { perUserDaily: number; globalDaily: number }) {
  const users = new Map<string, { day: number; used: number }>();
  let global = { day: -1, used: 0 };

  const currentUser = (uid: string, now: number) => {
    const day = dayOf(now);
    const entry = users.get(uid);
    if (entry && entry.day === day) return entry;
    const fresh = { day, used: 0 };
    users.set(uid, fresh);
    return fresh;
  };
  const currentGlobal = (now: number) => {
    const day = dayOf(now);
    if (global.day !== day) {
      global = { day, used: 0 };
      // Yesterday's per-user rows are of no use any more.
      for (const [uid, entry] of users) if (entry.day !== day) users.delete(uid);
    }
    return global;
  };

  return {
    /** Counts the estimate in advance; throws QuotaError("USER_DAILY_LIMIT" | "GLOBAL_DAILY_LIMIT") when it does not fit. */
    reserve(uid: string, estimate: number, now = Date.now()) {
      const g = currentGlobal(now);
      const u = currentUser(uid, now);
      if (u.used >= options.perUserDaily) throw new QuotaError('USER_DAILY_LIMIT');
      if (g.used >= options.globalDaily) throw new QuotaError('GLOBAL_DAILY_LIMIT');
      u.used += estimate;
      g.used += estimate;
    },
    /** Replaces the estimate by the real count (or releases it with a negative delta). */
    adjust(uid: string, delta: number, now = Date.now()) {
      const g = currentGlobal(now);
      const u = currentUser(uid, now);
      u.used = Math.max(0, u.used + delta);
      g.used = Math.max(0, g.used + delta);
    },
    usage(uid: string, now = Date.now()) {
      return { user: currentUser(uid, now).used, global: currentGlobal(now).used };
    },
  };
}
