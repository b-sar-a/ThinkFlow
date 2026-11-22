import { beforeEach, describe, expect, it } from 'vitest';
import { deleteAccountData } from '../server/accountDeletion';
import { createFakeDb } from './helpers/fakeDb';

function seed(fake: ReturnType<typeof createFakeDb>) {
  const { store } = fake;
  store.clear();
  store.set('users/kid', { name: 'Kid', email: 'kid@example.com' });
  store.set('users/kid/blocks/x', { name: 'X' });
  store.set('users/peer', { name: 'Peer' });
  store.set('publicProfiles/kid', { name: 'Kid' });
  store.set('publicProfiles/peer', { name: 'Peer' });
  store.set('referrals/kid', { inviteeId: 'kid' });
  for (let i = 0; i < 450; i++) store.set(`tasks/k${i}`, { userId: 'kid' });
  store.set('tasks/p1', { userId: 'peer' });
  store.set('todos/t1', { userId: 'kid' });
  store.set('sessions/s1', { userId: 'kid' });
  store.set('reviews/r1', { userId: 'kid' });
  store.set('reviews/r2', { userId: 'peer' });
  store.set('genius_lab_activities/a1', { userId: 'kid' });
  store.set('promo_claims/kid_X', { uid: 'kid' });
  store.set('promo_claims/peer_X', { uid: 'peer' });
  store.set('analytics_events/e1', { uid: 'kid', anonId: 'dev-1' });
  store.set('analytics_events/e2', { uid: 'peer' });
  store.set('analytics_events/e3', { uid: null });
  store.set('family_codes/CODE', { childUid: 'kid' });
  store.set('family_links/kid_mom', { childUid: 'kid', parentUid: 'mom' });
  store.set('family_links/peer_kid', { childUid: 'peer', parentUid: 'kid' });
  store.set('family_links/peer_mom', { childUid: 'peer', parentUid: 'mom' });
  store.set('posts/post1', { userId: 'kid' });
  store.set('posts/post1/comments/c1', { userId: 'peer' });
  store.set('posts/post2', { userId: 'peer' });
  store.set('posts/post2/comments/c2', { userId: 'kid' });
  store.set('posts/post2/comments/c3', { userId: 'peer' });
  store.set('chats/chat1', { participants: ['kid', 'peer'], participantNames: { kid: 'Kid', peer: 'Peer' }, participantPhotos: { kid: 'u', peer: 'p' } });
  store.set('chats/chat1/messages/m1', { senderId: 'kid', text: 'hi' });
  store.set('chats/chat1/messages/m2', { senderId: 'peer', text: 'hello' });
  store.set('chats/chat2', { participants: ['peer', 'mom'], participantNames: { peer: 'Peer', mom: 'Mom' } });
  store.set('teachers/kid', { active: true });
  store.set('teacher_requests/kid', { status: 'pending' });
  store.set('teachers/peer', { active: true });
  store.set('classes/c1', { teacherUid: 'kid', code: 'AAAA2222' });
  store.set('classes/c2', { teacherUid: 'peer', code: 'BBBB3333' });
  store.set('class_members/c1_peer', { classId: 'c1', teacherUid: 'kid', studentUid: 'peer' });
  store.set('class_members/c2_kid', { classId: 'c2', teacherUid: 'peer', studentUid: 'kid' });
  store.set('class_members/c2_other', { classId: 'c2', teacherUid: 'peer', studentUid: 'other' });
  store.set('reports/rep1', { reporterId: 'kid', targetUserId: 'peer' });
  store.set('reports/rep2', { reporterId: 'peer', targetUserId: 'kid' });
}

describe('deleteAccountData', () => {
  let fake: ReturnType<typeof createFakeDb>;
  beforeEach(() => {
    fake = createFakeDb();
    seed(fake);
  });

  it('refuses an empty or path-like uid', async () => {
    await expect(deleteAccountData(fake.db, '')).rejects.toThrow('INVALID_UID');
    await expect(deleteAccountData(fake.db, 'a/b')).rejects.toThrow('INVALID_UID');
  });

  it('removes everything that belongs to the student', async () => {
    const report = await deleteAccountData(fake.db, 'kid');
    const gone = [
      'users/kid', 'users/kid/blocks/x', 'publicProfiles/kid', 'referrals/kid',
      'todos/t1', 'sessions/s1', 'reviews/r1', 'genius_lab_activities/a1', 'promo_claims/kid_X', 'analytics_events/e1',
      'family_codes/CODE', 'family_links/kid_mom', 'family_links/peer_kid',
      'posts/post1', 'posts/post1/comments/c1', 'posts/post2/comments/c2', 'chats/chat1/messages/m1',
      'teachers/kid', 'teacher_requests/kid', 'classes/c1', 'class_members/c1_peer', 'class_members/c2_kid',
    ];
    for (const path of gone) expect(fake.has(path), path).toBe(false);
    expect(report.skipped).toEqual([]);
    expect(report.deleted.account).toBe(1);
  });

  it('deletes more than one page of documents (450 tasks, pages of 200)', async () => {
    const report = await deleteAccountData(fake.db, 'kid');
    expect(fake.count('tasks/k')).toBe(0);
    expect(report.deleted.tasks).toBe(450);
  });

  it('leaves other people and their data alone', async () => {
    await deleteAccountData(fake.db, 'kid');
    const stays = [
      'users/peer', 'publicProfiles/peer', 'tasks/p1', 'reviews/r2', 'promo_claims/peer_X', 'analytics_events/e2', 'analytics_events/e3',
      'family_links/peer_mom', 'posts/post2', 'posts/post2/comments/c3', 'chats/chat1', 'chats/chat1/messages/m2', 'chats/chat2',
      'teachers/peer', 'classes/c2', 'class_members/c2_other',
    ];
    for (const path of stays) expect(fake.has(path), path).toBe(true);
  });

  it('hides the student in a shared chat but keeps the other person intact', async () => {
    await deleteAccountData(fake.db, 'kid');
    const chat = fake.store.get('chats/chat1');
    expect(chat.participantNames).toEqual({ kid: 'Deleted user', peer: 'Peer' });
    expect(chat.participantPhotos).toEqual({ kid: '', peer: 'p' });
    expect(chat.participants).toEqual(['kid', 'peer']);
  });

  it('keeps abuse reports for the safety of other students', async () => {
    await deleteAccountData(fake.db, 'kid');
    expect(fake.has('reports/rep1')).toBe(true);
    expect(fake.has('reports/rep2')).toBe(true);
  });

  it('is safe to run again', async () => {
    await deleteAccountData(fake.db, 'kid');
    const again = await deleteAccountData(fake.db, 'kid');
    expect(again.skipped).toEqual([]);
    expect(fake.has('users/peer')).toBe(true);
  });

  it('reports a missing collection-group index and still deletes the rest', async () => {
    fake.setGroupQueryFails(true);
    const report = await deleteAccountData(fake.db, 'kid');
    expect(report.skipped).toEqual(['comments']);
    expect(fake.has('users/kid')).toBe(false);
    expect(fake.has('posts/post1')).toBe(false);
    expect(fake.has('posts/post2/comments/c2')).toBe(true); // reported as skipped, not silently kept
  });
});
