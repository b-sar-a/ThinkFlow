import { beforeEach, describe, expect, it } from 'vitest';
import * as C from '../server/classes';
import { createFakeDb } from './helpers/fakeDb';

const NOW = Date.UTC(2026, 10, 22, 12);
const failsWith = (promise: Promise<unknown>, status: number, message: string) =>
  expect(promise).rejects.toMatchObject({ status, message });

describe('teacher cabinet', () => {
  let fake: ReturnType<typeof createFakeDb>;
  let db: ReturnType<typeof createFakeDb>['db'];

  beforeEach(() => {
    fake = createFakeDb();
    db = fake.db;
    for (const [uid, name] of [['teach', 'Ms. Karimova'], ['teach2', 'Mr. Other'], ['admin', 'Admin'], ['s2', 'Timur'], ['s3', 'Dilnoza']]) {
      fake.store.set(`users/${uid}`, { name, email: `${uid}@x.com` });
    }
    fake.store.set('users/s1', { name: 'Aziza', email: 's1@x.com', studentClass: 'Grade 8', xp: 300, level: 4, streakDays: 3, longestStreak: 5, lastActiveDate: '2026-11-22', aiTokensUsed: 5 });
  });

  const approve = async (uid: string) => {
    await C.requestTeacher(db, uid, { school: 'School 12' }, NOW);
    await C.approveTeacher(db, 'admin', uid, NOW);
  };

  describe('teacher approval', () => {
    it('keeps everyone out until an admin approves', async () => {
      expect(await C.teacherStatus(db, 'teach')).toBe('none');
      await failsWith(C.createClass(db, 'teach', 'Class 8B', NOW), 403, 'NOT_TEACHER');
      await failsWith(C.listClasses(db, 'teach'), 403, 'NOT_TEACHER');
      await C.requestTeacher(db, 'teach', { school: 'School 12' }, NOW);
      expect(await C.teacherStatus(db, 'teach')).toBe('pending');
      await failsWith(C.createClass(db, 'teach', 'Class 8B', NOW), 403, 'NOT_TEACHER'); // pending is not approved
    });

    it('requires a school and strips markup from what is stored', async () => {
      await failsWith(C.requestTeacher(db, 'teach', { school: '   ' }, NOW), 400, 'SCHOOL_REQUIRED');
      await C.requestTeacher(db, 'teach', { school: 'School 12 <b>x</b>', note: 'I teach math' }, NOW);
      expect(JSON.stringify(fake.store.get('teacher_requests/teach'))).not.toContain('<b>');
    });

    it('shows requests to the admin with name and email, then moves them to the teachers list', async () => {
      await C.requestTeacher(db, 'teach', { school: 'School 12', note: 'math' }, NOW);
      const before = await C.listTeacherAdmin(db);
      expect(before.requests).toHaveLength(1);
      expect(before.requests[0]).toMatchObject({ name: 'Ms. Karimova', school: 'School 12' });
      await C.approveTeacher(db, 'admin', 'teach', NOW);
      const after = await C.listTeacherAdmin(db);
      expect(after.requests).toHaveLength(0);
      expect(after.teachers).toHaveLength(1);
      await failsWith(C.requestTeacher(db, 'teach', { school: 'x' }, NOW), 409, 'ALREADY_TEACHER');
    });

    it('cannot approve someone who does not exist, and can decline a request', async () => {
      await failsWith(C.approveTeacher(db, 'admin', 'ghost', NOW), 404, 'NO_SUCH_USER');
      await C.requestTeacher(db, 'teach', { school: 'School 12' }, NOW);
      await C.declineTeacher(db, 'teach');
      expect(await C.teacherStatus(db, 'teach')).toBe('none');
    });
  });

  describe('classes', () => {
    beforeEach(() => approve('teach'));

    it('creates a class with a code and limits a teacher to 5 classes', async () => {
      await failsWith(C.createClass(db, 'teach', '  ', NOW), 400, 'NAME_REQUIRED');
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      expect(cls.code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
      for (let i = 0; i < 4; i++) await C.createClass(db, 'teach', `Extra ${i}`, NOW + i);
      await failsWith(C.createClass(db, 'teach', 'One too many', NOW), 409, 'TOO_MANY_CLASSES');
      expect(await C.listClasses(db, 'teach')).toHaveLength(5);
    });

    it('lets students join with the code (any case), once, and counts them', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await failsWith(C.joinClass(db, 's1', 'nonsense', NOW), 404, 'INVALID_CODE');
      await failsWith(C.joinClass(db, 's1', 'AAAAAAAA', NOW), 404, 'INVALID_CODE');
      await failsWith(C.joinClass(db, 'teach', cls.code, NOW), 400, 'OWN_CODE');
      await expect(C.joinClass(db, 's1', cls.code.toLowerCase(), NOW)).resolves.toEqual({ classId: cls.classId, name: 'Class 8B' });
      await failsWith(C.joinClass(db, 's1', cls.code, NOW), 409, 'ALREADY_MEMBER');
      await C.joinClass(db, 's2', cls.code, NOW);
      expect((await C.listClasses(db, 'teach'))[0].students).toBe(2);
      expect((await C.listMyClasses(db, 's1')).map((m) => [m.name, m.teacherName])).toEqual([['Class 8B', 'Ms. Karimova']]);
    });

    it('shows the teacher only a light, fixed set of fields per student', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.joinClass(db, 's1', cls.code, NOW);
      const { students } = await C.roster(db, 'teach', cls.classId);
      expect(Object.keys(students[0]).sort()).toEqual(['grade', 'joinedAt', 'lastActiveDate', 'level', 'longestStreak', 'name', 'streakDays', 'studentUid', 'xp']);
      expect(JSON.stringify(students)).not.toContain('s1@x.com');
      expect(JSON.stringify(students)).not.toContain('aiTokensUsed');
    });

    it('gives detail only for members of the teacher’s own class', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.joinClass(db, 's1', cls.code, NOW);
      const detail: any = await C.studentDetail(db, 'teach', cls.classId, 's1', NOW);
      expect(detail.xp).toBe(300);
      expect('email' in detail).toBe(false);
      await failsWith(C.studentDetail(db, 'teach', cls.classId, 's3', NOW), 404, 'NOT_MEMBER');
    });

    it('keeps other teachers out of the class', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.joinClass(db, 's1', cls.code, NOW);
      await approve('teach2');
      await failsWith(C.roster(db, 'teach2', cls.classId), 403, 'FORBIDDEN');
      await failsWith(C.studentDetail(db, 'teach2', cls.classId, 's1', NOW), 403, 'FORBIDDEN');
      await failsWith(C.rotateCode(db, 'teach2', cls.classId), 403, 'FORBIDDEN');
      await failsWith(C.deleteClass(db, 'teach2', cls.classId), 403, 'FORBIDDEN');
      await failsWith(C.roster(db, 'teach', 'nope'), 404, 'NO_SUCH_CLASS');
    });

    it('replaces the code: the old one dies, members stay', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.joinClass(db, 's1', cls.code, NOW);
      const { code: fresh } = await C.rotateCode(db, 'teach', cls.classId);
      expect(fresh).not.toBe(cls.code);
      await failsWith(C.joinClass(db, 's3', cls.code, NOW), 404, 'INVALID_CODE');
      await C.joinClass(db, 's3', fresh, NOW);
      expect((await C.roster(db, 'teach', cls.classId)).students).toHaveLength(2);
    });

    it('lets a student leave and a teacher remove a student, nobody else', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      for (const s of ['s1', 's2', 's3']) await C.joinClass(db, s, cls.code, NOW);
      await failsWith(C.leaveClass(db, 's2', cls.classId, 's3'), 403, 'FORBIDDEN'); // a classmate cannot remove another
      await failsWith(C.leaveClass(db, 'teach2', cls.classId, 's3'), 403, 'FORBIDDEN');
      await C.leaveClass(db, 's2', cls.classId, 's2');
      await C.leaveClass(db, 'teach', cls.classId, 's3');
      await failsWith(C.leaveClass(db, 's2', cls.classId, 's2'), 404, 'NOT_MEMBER');
      expect((await C.roster(db, 'teach', cls.classId)).students).toHaveLength(1);
    });

    it('deletes a class together with its memberships', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.joinClass(db, 's1', cls.code, NOW);
      await C.deleteClass(db, 'teach', cls.classId);
      expect(await C.listClasses(db, 'teach')).toHaveLength(0);
      expect(await C.listMyClasses(db, 's1')).toHaveLength(0);
    });

    it('ends access and kills the codes the moment a teacher is revoked', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      await C.revokeTeacher(db, 'teach');
      await failsWith(C.roster(db, 'teach', cls.classId), 403, 'NOT_TEACHER');
      await failsWith(C.joinClass(db, 's3', cls.code, NOW), 404, 'INVALID_CODE');
    });

    it('limits a class to 200 students and a student to 10 classes', async () => {
      const cls = await C.createClass(db, 'teach', 'Class 8B', NOW);
      for (let i = 0; i < 200; i++) fake.store.set(`class_members/${cls.classId}_f${i}`, { classId: cls.classId, studentUid: `f${i}`, teacherUid: 'teach' });
      await failsWith(C.joinClass(db, 's2', cls.code, NOW), 409, 'CLASS_FULL');

      const other = await C.createClass(db, 'teach', 'Other', NOW);
      for (let i = 0; i < 10; i++) fake.store.set(`class_members/other${i}_s3`, { classId: `other${i}`, studentUid: 's3', teacherUid: 'x' });
      await failsWith(C.joinClass(db, 's3', other.code, NOW), 409, 'TOO_MANY_CLASSES_JOINED');
    });
  });
});
