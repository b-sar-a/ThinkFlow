import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DIGEST_MIN_GAP_MS,
  composeDigest,
  getDigestPref,
  isValidUnsubscribe,
  resendMailer,
  runWeeklyDigest,
  setDigestPref,
  unsubscribeToken,
  unsubscribeUrl,
  type Mail,
  type Mailer,
} from '../server/digest';
import { deleteAccountData } from '../server/accountDeletion';
import { createFakeDb } from './helpers/fakeDb';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 24, 5, 0, 0);

const recorder = () => {
  const sent: Mail[] = [];
  const mailer: Mailer = { send: async (mail) => void sent.push(mail) };
  return { sent, mailer };
};

function world() {
  const fake = createFakeDb();
  fake.store.set('users/c1', { name: 'Ali', xp: 400, level: 5, streakDays: 3, lessonsDone: ['a/1', 'a/2', 'a/3'] });
  fake.store.set('users/p1', { name: 'Parent' });
  fake.store.set('family_links/c1_p1', { childUid: 'c1', parentUid: 'p1', createdAt: 1 });
  return fake;
}

beforeEach(() => {
  process.env.CRON_SECRET = 'test-secret';
  process.env.SITE_URL = 'https://example.test';
});
afterEach(() => {
  delete process.env.CRON_SECRET;
  delete process.env.SITE_URL;
  delete process.env.RESEND_API_KEY;
  delete process.env.DIGEST_FROM;
});

describe('preferences', () => {
  it('start off, can be turned on and off, and fall back to Russian for an unknown language', async () => {
    const { db, store } = world();
    expect(await getDigestPref(db, 'p1')).toEqual({ enabled: false, lastSentAt: 0 });
    expect((await setDigestPref(db, 'p1', true, 'uz', NOW)).enabled).toBe(true);
    expect(store.get('family_digest/p1').lang).toBe('uz');
    await setDigestPref(db, 'p1', true, 'klingon', NOW);
    expect(store.get('family_digest/p1').lang).toBe('ru');
    expect((await setDigestPref(db, 'p1', false, 'en', NOW)).enabled).toBe(false);
  });
});

describe('runWeeklyDigest', () => {
  it('sends to a parent who turned it on, in their language, with a working unsubscribe link', async () => {
    const { db } = world();
    await setDigestPref(db, 'p1', true, 'ru', NOW - 8 * DAY);
    const { sent, mailer } = recorder();
    const stats = await runWeeklyDigest(db, mailer, async () => 'parent@example.com', { now: NOW });

    expect(stats).toEqual({ considered: 1, sent: 1, skipped: 0, failed: 0 });
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe('parent@example.com');
    expect(sent[0].subject).toContain('ThinkFlow');
    expect(sent[0].text).toContain('Ali');
    expect(sent[0].text).toContain('пройдено уроков: 3');
    expect(sent[0].text).toContain(sent[0].unsubscribeUrl);
    const url = new URL(sent[0].unsubscribeUrl);
    expect(url.origin).toBe('https://example.test');
    expect(isValidUnsubscribe(url.searchParams.get('u'), url.searchParams.get('t'))).toBe(true);
  });

  it('does not send twice in a week, then sends again with what changed since', async () => {
    const { db, store } = world();
    await setDigestPref(db, 'p1', true, 'en', NOW - 30 * DAY);
    const { sent, mailer } = recorder();
    const email = async () => 'parent@example.com';

    await runWeeklyDigest(db, mailer, email, { now: NOW });
    const again = await runWeeklyDigest(db, mailer, email, { now: NOW + DAY });
    expect(again).toMatchObject({ sent: 0, skipped: 1 });
    expect(sent).toHaveLength(1);
    expect(sent[0].text).not.toContain('this week');

    store.set('users/c1', { ...store.get('users/c1'), xp: 520, lessonsDone: ['a/1', 'a/2', 'a/3', 'a/4'] });
    await runWeeklyDigest(db, mailer, email, { now: NOW + 7 * DAY });
    expect(sent).toHaveLength(2);
    expect(sent[1].text).toContain('(+120 this week)');
    expect(sent[1].text).toContain('(+1 this week)');
  });

  it('skips parents who did not turn it on, have no children, or have no email', async () => {
    const { db, store } = world();
    const { sent, mailer } = recorder();

    // Not turned on.
    expect(await runWeeklyDigest(db, mailer, async () => 'a@b.c', { now: NOW })).toMatchObject({ considered: 0, sent: 0 });

    // Turned on, but no children.
    store.set('family_digest/lonely', { enabled: true, lang: 'en' });
    // Turned on, child linked, but the account has no email.
    store.set('family_digest/p1', { enabled: true, lang: 'en' });
    const stats = await runWeeklyDigest(db, mailer, async (uid) => (uid === 'lonely' ? 'lonely@example.com' : null), { now: NOW });
    expect(stats).toEqual({ considered: 2, sent: 0, skipped: 2, failed: 0 });
    expect(sent).toHaveLength(0);
  });

  it('counts a failed send and lets the next run try again', async () => {
    const { db, store } = world();
    await setDigestPref(db, 'p1', true, 'en', NOW);
    const failing: Mailer = { send: async () => { throw new Error('EMAIL_SEND_FAILED_500'); } };
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {});
    const stats = await runWeeklyDigest(db, failing, async () => 'parent@example.com', { now: NOW });
    quiet.mockRestore();

    expect(stats).toMatchObject({ sent: 0, failed: 1 });
    expect(store.get('family_digest/p1').lastSentAt ?? 0).toBe(0);

    const { sent, mailer } = recorder();
    expect(await runWeeklyDigest(db, mailer, async () => 'parent@example.com', { now: NOW + 1000 })).toMatchObject({ sent: 1 });
    expect(sent).toHaveLength(1);
  });

  it('waits less than a week between emails but not much less', () => {
    expect(DIGEST_MIN_GAP_MS).toBeLessThan(7 * DAY);
    expect(DIGEST_MIN_GAP_MS).toBeGreaterThan(6 * DAY);
  });
});

describe('composeDigest', () => {
  const line = { name: 'Ali', activeDays: 4, lessons: 7, lessonsGain: 2, level: 3, xp: 150, xpGain: 60, streakDays: 5 };

  it('writes the same facts in English, Russian and Uzbek', () => {
    for (const lang of ['en', 'ru', 'uz'] as const) {
      const mail = composeDigest(lang, [line], 'https://example.test/off');
      expect(mail.text, lang).toContain('Ali');
      expect(mail.text, lang).toContain('150');
      expect(mail.text, lang).toContain('https://example.test/off');
      expect(mail.html, lang).toContain('href="https://example.test/off"');
      expect(mail.subject.length).toBeGreaterThan(10);
    }
  });

  it('escapes a hostile child name in the HTML part', () => {
    const mail = composeDigest('en', [{ ...line, name: '<img src=x onerror=alert(1)>' }], 'https://example.test/off');
    expect(mail.html).not.toContain('<img');
    expect(mail.html).toContain('&lt;img');
  });
});

describe('unsubscribe tokens', () => {
  it('accept only the right token for the right account', () => {
    const token = unsubscribeToken('p1');
    expect(isValidUnsubscribe('p1', token)).toBe(true);
    expect(isValidUnsubscribe('p2', token)).toBe(false);
    expect(isValidUnsubscribe('p1', token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'))).toBe(false);
    expect(isValidUnsubscribe('p1', '')).toBe(false);
    expect(isValidUnsubscribe('', token)).toBe(false);
    expect(isValidUnsubscribe('a/b', unsubscribeToken('a/b'))).toBe(false);
    expect(isValidUnsubscribe(undefined, token)).toBe(false);
    expect(unsubscribeUrl('p1')).toContain('u=p1');
  });

  it('are refused when no secret is set', () => {
    delete process.env.CRON_SECRET;
    expect(isValidUnsubscribe('p1', unsubscribeToken('p1', ''))).toBe(false);
  });
});

describe('resendMailer', () => {
  const mail: Mail = { to: 'p@example.com', subject: 'S', text: 'T', html: '<p>T</p>', unsubscribeUrl: 'https://example.test/off' };

  it('posts to the Resend API with the key, sender and an unsubscribe header', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.DIGEST_FROM = 'ThinkFlow <hello@example.test>';
    const calls: any[] = [];
    const fakeFetch = (async (url: string, init: any) => {
      calls.push({ url, init });
      return { ok: true, status: 200 };
    }) as unknown as typeof fetch;
    await resendMailer(fakeFetch).send(mail);

    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect(calls[0].init.headers.Authorization).toBe('Bearer re_test');
    const body = JSON.parse(calls[0].init.body);
    expect(body.from).toBe('ThinkFlow <hello@example.test>');
    expect(body.to).toEqual(['p@example.com']);
    expect(body.headers['List-Unsubscribe']).toBe('<https://example.test/off>');
  });

  it('fails clearly when the service rejects the email or is not configured', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.DIGEST_FROM = 'x@example.test';
    const rejecting = (async () => ({ ok: false, status: 422 })) as unknown as typeof fetch;
    await expect(resendMailer(rejecting).send(mail)).rejects.toThrow('EMAIL_SEND_FAILED_422');
    delete process.env.RESEND_API_KEY;
    await expect(resendMailer(rejecting).send(mail)).rejects.toThrow('EMAIL_NOT_CONFIGURED');
  });
});

describe('account deletion', () => {
  it('removes the parent\'s digest settings', async () => {
    const { db, has } = world();
    await setDigestPref(db, 'p1', true, 'en', NOW);
    expect(has('family_digest/p1')).toBe(true);
    await deleteAccountData(db as any, 'p1');
    expect(has('family_digest/p1')).toBe(false);
  });
});
