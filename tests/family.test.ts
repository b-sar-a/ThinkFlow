import { beforeEach, describe, expect, it } from 'vitest';
import { createCode, linkWithCode, listChildren, listParents, summarize, unlink, FamilyError } from '../server/family';
import { createFakeDb } from './helpers/fakeDb';

const NOW = Date.UTC(2026, 10, 22, 12, 0, 0);
const HOUR = 3_600_000;

const failsWith = (promise: Promise<unknown>, status: number, message: string) =>
  expect(promise).rejects.toMatchObject({ status, message });

describe('parent access', () => {
  let fake: ReturnType<typeof createFakeDb>;
  let db: ReturnType<typeof createFakeDb>['db'];

  beforeEach(() => {
    fake = createFakeDb();
    db = fake.db;
    const { store } = fake;
    store.set('users/kid', { name: 'Aziza', email: 'secret@kid.com', studentClass: 'Grade 8', goal: 'exams', xp: 300, level: 4, streakDays: 3, longestStreak: 5, lastActiveDate: '2026-11-22', aiTokensUsed: 999 });
    store.set('users/mom', { name: 'Mom' });
    store.set('users/dad', { name: 'Dad' });
    store.set('tasks/t1', { userId: 'kid', status: 'completed' });
    store.set('tasks/t2', { userId: 'kid', status: 'pending' });
    store.set('tasks/t3', { userId: 'other', status: 'completed' });
    store.set('genius_lab_activities/a1', { userId: 'kid', dateString: '2026-11-22' });
    store.set('genius_lab_activities/a2', { userId: 'kid', dateString: '2026-11-20' });
    store.set('genius_lab_activities/a3', { userId: 'other', dateString: '2026-11-21' });
  });

  describe('creating a code', () => {
    it('makes an 8-character code without look-alike characters that lasts 24 hours', async () => {
      const { code, expiresAt } = await createCode(db, 'kid', NOW);
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
      expect(expiresAt).toBe(NOW + 24 * HOUR);
    });

    it('replaces the previous code of the same student', async () => {
      const first = await createCode(db, 'kid', NOW);
      await createCode(db, 'kid', NOW);
      await failsWith(linkWithCode(db, 'mom', first.code, NOW), 404, 'INVALID_CODE');
    });
  });

  describe('linking with a code', () => {
    it('rejects malformed, unknown and missing codes', async () => {
      await failsWith(linkWithCode(db, 'mom', 'abc', NOW), 404, 'INVALID_CODE');
      await failsWith(linkWithCode(db, 'mom', 'AAAAAAAA', NOW), 404, 'INVALID_CODE');
      await failsWith(linkWithCode(db, 'mom', undefined, NOW), 404, 'INVALID_CODE');
    });

    it('does not let a student use their own code', async () => {
      const { code } = await createCode(db, 'kid', NOW);
      await failsWith(linkWithCode(db, 'kid', code, NOW), 400, 'OWN_CODE');
    });

    it('rejects an expired code', async () => {
      const { code } = await createCode(db, 'kid', NOW);
      await failsWith(linkWithCode(db, 'mom', code, NOW + 25 * HOUR), 404, 'INVALID_CODE');
    });

    it('accepts any case and spacing, and uses the code only once', async () => {
      const { code } = await createCode(db, 'kid', NOW);
      const typed = (code.slice(0, 4) + ' ' + code.slice(4)).toLowerCase();
      await expect(linkWithCode(db, 'mom', typed, NOW)).resolves.toEqual({ childUid: 'kid' });
      await failsWith(linkWithCode(db, 'dad', code, NOW), 404, 'INVALID_CODE');
    });

    it('refuses a second link between the same two people', async () => {
      const a = await createCode(db, 'kid', NOW);
      await linkWithCode(db, 'mom', a.code, NOW);
      const b = await createCode(db, 'kid', NOW);
      await failsWith(linkWithCode(db, 'mom', b.code, NOW), 409, 'ALREADY_LINKED');
    });

    it('allows at most 4 parents per student', async () => {
      for (const parent of ['p1', 'p2', 'p3', 'p4']) {
        const { code } = await createCode(db, 'kid', NOW);
        await linkWithCode(db, parent, code, NOW);
      }
      const { code } = await createCode(db, 'kid', NOW);
      await failsWith(linkWithCode(db, 'p5', code, NOW), 409, 'TOO_MANY_PARENTS');
    });
  });

  describe('what a parent sees', () => {
    beforeEach(async () => {
      const { code } = await createCode(db, 'kid', NOW);
      await linkWithCode(db, 'mom', code, NOW);
    });

    it('is a fixed list of fields and never the email or token usage', async () => {
      const [kid] = await listChildren(db, 'mom', NOW);
      expect(Object.keys(kid).sort()).toEqual(
        ['childUid', 'goal', 'grade', 'lastActiveDate', 'level', 'linkedAt', 'longestStreak', 'name', 'streakDays', 'tasksCompleted', 'week', 'xp'].sort()
      );
      expect(JSON.stringify(kid)).not.toContain('secret@kid.com');
    });

    it('counts only this student: finished tasks and the active days of the last week', async () => {
      const [kid] = await listChildren(db, 'mom', NOW);
      expect(kid.tasksCompleted).toBe(1);
      expect(kid.xp).toBe(300);
      expect(kid.week).toHaveLength(7);
      expect(kid.week.filter((d) => d.active).map((d) => d.date)).toEqual(['2026-11-20', '2026-11-22']);
    });

    it('is empty for someone who is not linked', async () => {
      await expect(listChildren(db, 'stranger', NOW)).resolves.toEqual([]);
    });

    it('lists the parents on the student side', async () => {
      const { code } = await createCode(db, 'kid', NOW);
      await linkWithCode(db, 'dad', code, NOW);
      const parents = await listParents(db, 'kid');
      expect(parents.map((p) => p.name).sort()).toEqual(['Dad', 'Mom']);
    });
  });

  describe('unlinking', () => {
    beforeEach(async () => {
      for (const parent of ['mom', 'dad']) {
        const { code } = await createCode(db, 'kid', NOW);
        await linkWithCode(db, parent, code, NOW);
      }
    });

    it('lets either side end the link', async () => {
      await unlink(db, 'mom', 'kid', 'mom');
      await unlink(db, 'kid', 'kid', 'dad');
      await expect(listChildren(db, 'mom', NOW)).resolves.toEqual([]);
      await expect(listParents(db, 'kid')).resolves.toEqual([]);
    });

    it('does not let strangers, or one parent, remove another link', async () => {
      await failsWith(unlink(db, 'stranger', 'kid', 'mom'), 403, 'FORBIDDEN');
      await failsWith(unlink(db, 'mom', 'kid', 'dad'), 403, 'FORBIDDEN');
    });

    it('reports a link that does not exist', async () => {
      await unlink(db, 'kid', 'kid', 'mom');
      await failsWith(unlink(db, 'kid', 'kid', 'mom'), 404, 'NOT_LINKED');
    });
  });

  it('summarize works without any link (the caller checks access)', async () => {
    await expect(summarize(db, 'kid', NOW)).resolves.toMatchObject({ name: 'Aziza' });
    expect(new FamilyError(400, 'X')).toBeInstanceOf(Error);
  });
});
