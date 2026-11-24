import { createHmac, timingSafeEqual } from "node:crypto";
import { listChildren, type Db } from "./family.js";

/**
 * Weekly summary email for parents. Off until the owner sets the keys (see docs/LAUNCH.md):
 * RESEND_API_KEY and DIGEST_FROM send the emails, CRON_SECRET lets the daily Vercel cron call
 * /api/cron/digest, and the Firebase service account is needed to read the data.
 *
 * A parent gets it only after turning it on in the Parent cabinet (family_digest/{parentUid}), and
 * every email has a one-click unsubscribe link. The content is the same fixed set of fields the
 * cabinet already shows (see summarize in family.ts); nothing else about a child leaves the server.
 */

export type DigestLang = "en" | "ru" | "uz";
const LANGS: DigestLang[] = ["en", "ru", "uz"];
const asLang = (x: unknown): DigestLang => (LANGS.includes(x as DigestLang) ? (x as DigestLang) : "ru");

export const DIGEST_MIN_GAP_MS = 6.5 * 24 * 60 * 60 * 1000;
export const MAX_PARENTS_PER_RUN = 200;

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
  unsubscribeUrl: string;
}
export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY && process.env.DIGEST_FROM);
export const cronConfigured = () => Boolean(process.env.CRON_SECRET);

/** Sends through Resend's HTTP API. Needs RESEND_API_KEY and DIGEST_FROM ("ThinkFlow <hello@your-domain>"). */
export function resendMailer(fetchImpl: typeof fetch = fetch): Mailer {
  return {
    async send(mail) {
      const key = process.env.RESEND_API_KEY;
      const from = process.env.DIGEST_FROM;
      if (!key || !from) throw new Error("EMAIL_NOT_CONFIGURED");
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [mail.to],
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          headers: { "List-Unsubscribe": `<${mail.unsubscribeUrl}>` },
        }),
      });
      if (!response.ok) throw new Error(`EMAIL_SEND_FAILED_${response.status}`);
    },
  };
}

/**
 * The address a digest may go to: only a verified one on an account that is not disabled. Without
 * this, anyone could sign up with somebody else's email and have summaries sent there.
 */
export const verifiedEmail = (record: { email?: string | null; emailVerified?: boolean; disabled?: boolean } | null | undefined): string | null =>
  record && record.email && record.emailVerified === true && record.disabled !== true ? record.email : null;

// ---------- unsubscribe links ----------

const secretOf = () => process.env.DIGEST_SECRET || process.env.CRON_SECRET || "";
export const siteUrl = () => (process.env.SITE_URL || "https://mussthinkflow.vercel.app").replace(/\/+$/, "");

export const unsubscribeToken = (uid: string, secret = secretOf()) =>
  createHmac("sha256", secret).update(`digest-unsubscribe:${uid}`).digest("hex").slice(0, 32);

export function isValidUnsubscribe(uid: unknown, token: unknown, secret = secretOf()): boolean {
  if (typeof uid !== "string" || typeof token !== "string" || !uid || uid.includes("/") || !secret) return false;
  const expected = Buffer.from(unsubscribeToken(uid, secret));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const unsubscribeUrl = (uid: string) => `${siteUrl()}/api/digest/unsubscribe?u=${encodeURIComponent(uid)}&t=${unsubscribeToken(uid)}`;

// ---------- preferences ----------

export async function getDigestPref(db: Db, parentUid: string) {
  const data = (await db.doc(`family_digest/${parentUid}`).get()).data() || {};
  return { enabled: data.enabled === true, lastSentAt: Number(data.lastSentAt) || 0 };
}

export async function setDigestPref(db: Db, parentUid: string, enabled: boolean, lang: unknown, now = Date.now()) {
  await db.doc(`family_digest/${parentUid}`).set({ enabled, lang: asLang(lang), updatedAt: now }, { merge: true });
  return getDigestPref(db, parentUid);
}

// ---------- the email ----------

interface ChildLine {
  name: string;
  activeDays: number;
  lessons: number;
  lessonsGain: number | null;
  level: number;
  xp: number;
  xpGain: number | null;
  streakDays: number;
}

const COPY: Record<DigestLang, {
  subject: string;
  hello: string;
  line: (c: ChildLine) => string;
  footer: string;
  off: string;
}> = {
  en: {
    subject: "Your child's week on ThinkFlow",
    hello: "Hello! Here is the last week on ThinkFlow.",
    line: (c) =>
      `${c.name}: active on ${c.activeDays} of the last 7 days; ${c.lessons} lessons finished${c.lessonsGain !== null ? ` (+${c.lessonsGain} this week)` : ""}; level ${c.level}, ${c.xp} XP${c.xpGain !== null ? ` (+${c.xpGain} this week)` : ""}; streak ${c.streakDays} days.`,
    footer: "You get this email because you turned on the weekly summary in the Parent cabinet.",
    off: "Turn it off",
  },
  ru: {
    subject: "Неделя вашего ребёнка в ThinkFlow",
    hello: "Здравствуйте! Вот итоги последней недели в ThinkFlow.",
    line: (c) =>
      `${c.name}: занимался(-ась) в ${c.activeDays} из последних 7 дней; пройдено уроков: ${c.lessons}${c.lessonsGain !== null ? ` (+${c.lessonsGain} за неделю)` : ""}; уровень ${c.level}, ${c.xp} XP${c.xpGain !== null ? ` (+${c.xpGain} за неделю)` : ""}; серия ${c.streakDays} дн.`,
    footer: "Вы получаете это письмо, потому что включили недельную сводку в кабинете родителя.",
    off: "Отключить",
  },
  uz: {
    subject: "Farzandingizning ThinkFlow'dagi haftasi",
    hello: "Assalomu alaykum! Bu ThinkFlow'dagi oxirgi hafta natijalari.",
    line: (c) =>
      `${c.name}: oxirgi 7 kunning ${c.activeDays} tasida shug'ullangan; tugatilgan darslar: ${c.lessons}${c.lessonsGain !== null ? ` (hafta davomida +${c.lessonsGain})` : ""}; daraja ${c.level}, ${c.xp} XP${c.xpGain !== null ? ` (hafta davomida +${c.xpGain})` : ""}; seriya ${c.streakDays} kun.`,
    footer: "Siz bu xatni ota-ona kabinetida haftalik xulosani yoqqaningiz uchun olasiz.",
    off: "O'chirish",
  },
};

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function composeDigest(lang: DigestLang, lines: ChildLine[], unsubUrl: string) {
  const c = COPY[lang];
  const rows = lines.map((l) => c.line(l));
  const text = [c.hello, "", ...rows, "", c.footer, `${c.off}: ${unsubUrl}`].join("\n");
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#111">` +
    `<p>${escapeHtml(c.hello)}</p>` +
    `<ul>${rows.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>` +
    `<p style="color:#666;font-size:13px">${escapeHtml(c.footer)} <a href="${escapeHtml(unsubUrl)}">${escapeHtml(c.off)}</a></p>` +
    `</div>`;
  return { subject: c.subject, text, html };
}

// ---------- the run ----------

export interface DigestStats {
  considered: number;
  sent: number;
  skipped: number;
  failed: number;
}

interface RunOptions {
  now?: number;
  /** Pause between emails; the email service limits how fast one account may send. */
  delayMs?: number;
}

/** Sends the summary to every parent who turned it on and has not had one for about a week. */
export async function runWeeklyDigest(
  db: Db,
  mailer: Mailer,
  emailOf: (uid: string) => Promise<string | null>,
  options: RunOptions = {}
): Promise<DigestStats> {
  const now = options.now ?? Date.now();
  const stats: DigestStats = { considered: 0, sent: 0, skipped: 0, failed: 0 };

  const prefs = await db.collection("family_digest").where("enabled", "==", true).limit(MAX_PARENTS_PER_RUN).get();
  for (const pref of prefs.docs) {
    stats.considered++;
    const parentUid = pref.id;
    const data = pref.data() || {};
    const previousSentAt = Number(data.lastSentAt) || 0;
    if (now - previousSentAt < DIGEST_MIN_GAP_MS) {
      stats.skipped++;
      continue;
    }
    try {
      const [email, children] = await Promise.all([emailOf(parentUid), listChildren(db, parentUid, now)]);
      if (!email || children.length === 0) {
        stats.skipped++;
        continue;
      }
      const before: Record<string, { xp?: number; lessons?: number }> = data.snapshots || {};
      const lines: ChildLine[] = children.map((child) => {
        const prev = before[child.childUid];
        return {
          name: child.name || "—",
          activeDays: child.week.filter((d) => d.active).length,
          lessons: child.lessonsCompleted,
          lessonsGain: prev && typeof prev.lessons === "number" ? Math.max(0, child.lessonsCompleted - prev.lessons) : null,
          level: child.level,
          xp: child.xp,
          xpGain: prev && typeof prev.xp === "number" ? Math.max(0, child.xp - prev.xp) : null,
          streakDays: child.streakDays,
        };
      });
      const url = unsubscribeUrl(parentUid);
      const message = composeDigest(asLang(data.lang), lines, url);

      // Claim the slot first, so two overlapping runs cannot both send; put it back if sending fails.
      await pref.ref.set({ lastSentAt: now }, { merge: true });
      try {
        await mailer.send({ to: email, ...message, unsubscribeUrl: url });
      } catch (error) {
        await pref.ref.set({ lastSentAt: previousSentAt }, { merge: true });
        throw error;
      }
      const snapshots: Record<string, { xp: number; lessons: number }> = {};
      for (const child of children) snapshots[child.childUid] = { xp: child.xp, lessons: child.lessonsCompleted };
      await pref.ref.set({ snapshots }, { merge: true });
      stats.sent++;
      if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    } catch (error) {
      stats.failed++;
      console.error("[DIGEST] failed for one parent:", (error as Error)?.message);
    }
  }
  return stats;
}
