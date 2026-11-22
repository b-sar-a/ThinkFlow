import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, setLogLevel, updateDoc } from 'firebase/firestore';

/**
 * Runs firestore.rules in the Firestore emulator (npm run test:rules, also in CI).
 * The rules are the only thing standing between a student's browser and the database, so the
 * important promises are written down as tests: who can read what, and what nobody can change.
 */

let env: RulesTestEnvironment;

beforeAll(async () => {
  setLogLevel('error');
  env = await initializeTestEnvironment({
    projectId: 'demo-thinkflow',
    firestore: { rules: fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8') },
  });
});
afterAll(async () => {
  await env.cleanup();
});
beforeEach(async () => {
  await env.clearFirestore();
});

const as = (uid: string, token: Record<string, unknown> = {}) =>
  env.authenticatedContext(uid, { email: `${uid}@example.com`, email_verified: true, ...token }).firestore();
const visitor = () => env.unauthenticatedContext().firestore();
const OWNER_EMAIL = 'sarvarkhotamov10@gmail.com';
const asOwnerEmail = () => as('owner', { email: OWNER_EMAIL });

const seed = (writes: Record<string, object>) =>
  env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [p, data] of Object.entries(writes)) await setDoc(doc(db, p), data);
  });

const student = (uid: string, extra: object = {}) => ({
  uid, email: `${uid}@example.com`, name: uid, xp: 0, level: 1, role: 'student', aiTokensUsed: 0, aiTokenLimit: 15000, ...extra,
});
const post = (userId: string, extra: object = {}) => ({ userId, userName: userId, content: 'hello', likes: [], commentsCount: 0, createdAt: 1, ...extra });
const task = (userId: string, extra: object = {}) => ({ userId, title: 'Task', description: 'd', difficulty: 'Easy', status: 'pending', xpReward: 10, createdAt: 1, ...extra });
const review = (userId: string, extra: object = {}) => ({ userId, userName: userId, text: 'great', rating: 5, timestamp: 1, ...extra });
const report = (reporterId: string, extra: object = {}) => ({
  reporterId, targetType: 'post', targetId: 'p1', targetUserId: 'alice', reason: 'spam', details: '', text: 'hi', status: 'open', createdAt: 1, ...extra,
});

describe('users', () => {
  it('can be read by the owner and an admin, nobody else', async () => {
    await seed({ 'users/alice': student('alice'), 'users/root': student('root', { role: 'admin' }) });
    await assertSucceeds(getDoc(doc(as('alice'), 'users/alice')));
    await assertSucceeds(getDoc(doc(as('root'), 'users/alice')));
    await assertFails(getDoc(doc(as('bob'), 'users/alice')));
    await assertFails(getDoc(doc(visitor(), 'users/alice')));
  });

  it('can be created by the owner as an ordinary student', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'users/alice'), student('alice')));
  });

  it('cannot be created with a bonus or a role, or for someone else', async () => {
    const db = as('alice');
    await assertFails(setDoc(doc(db, 'users/alice'), student('alice', { role: 'admin' })));
    await assertFails(setDoc(doc(db, 'users/alice'), student('alice', { xp: 500 })));
    await assertFails(setDoc(doc(db, 'users/alice'), student('alice', { aiTokenLimit: 999999 })));
    await assertFails(setDoc(doc(db, 'users/alice'), student('alice', { referralCount: 5 })));
    await assertFails(setDoc(doc(db, 'users/alice'), student('alice', { email: 'not-an-email' })));
    await assertFails(setDoc(doc(as('bob'), 'users/alice'), student('alice')));
  });

  describe('updates by the owner', () => {
    beforeEach(() => seed({ 'users/alice': student('alice', { xp: 100, level: 2, streakDays: 3 }) }));

    it('allow ordinary changes and small progress', async () => {
      const ref = doc(as('alice'), 'users/alice');
      await assertSucceeds(updateDoc(ref, { name: 'Alice B' }));
      await assertSucceeds(updateDoc(ref, { xp: 150 }));
      await assertSucceeds(updateDoc(ref, { level: 3 }));
      await assertSucceeds(updateDoc(ref, { streakDays: 4 }));
    });

    it('refuse a big XP jump, a loss of XP and a big level jump', async () => {
      const ref = doc(as('alice'), 'users/alice');
      await assertFails(updateDoc(ref, { xp: 500 }));
      await assertFails(updateDoc(ref, { xp: 50 }));
      await assertFails(updateDoc(ref, { level: 6 }));
    });

    it('refuse a streak that jumps ahead', async () => {
      await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { streakDays: 6 }));
    });

    it('refuse changes to role, token limit, token usage and referral count', async () => {
      const ref = doc(as('alice'), 'users/alice');
      await assertFails(updateDoc(ref, { role: 'admin' }));
      await assertFails(updateDoc(ref, { aiTokenLimit: 1000000 }));
      await assertFails(updateDoc(ref, { aiTokensUsed: 0, aiTokenLimit: 15000, referralCount: 5 }));
      await assertFails(updateDoc(ref, { aiTokensUsed: 5 }));
    });

    it('keep finished lessons as a list of at most 200 entries', async () => {
      const ref = doc(as('alice'), 'users/alice');
      await assertSucceeds(updateDoc(ref, { lessonsDone: ['algebra-7-9/linear-equations'] }));
      await assertSucceeds(updateDoc(ref, { lessonsDone: Array.from({ length: 200 }, (_, i) => `p/${i}`) }));
      await assertFails(updateDoc(ref, { lessonsDone: Array.from({ length: 201 }, (_, i) => `p/${i}`) }));
      await assertFails(updateDoc(ref, { lessonsDone: 'all of them' }));
    });

    it('refuse a bio that is too long', async () => {
      await assertFails(updateDoc(doc(as('alice'), 'users/alice'), { bio: 'x'.repeat(1001) }));
    });

    it('cannot be done by someone else', async () => {
      await assertFails(updateDoc(doc(as('bob'), 'users/alice'), { name: 'Hacked' }));
    });
  });

  it('can be deleted only by an admin', async () => {
    await seed({ 'users/alice': student('alice'), 'users/root': student('root', { role: 'admin' }) });
    await assertFails(deleteDoc(doc(as('alice'), 'users/alice')));
    await assertSucceeds(deleteDoc(doc(as('root'), 'users/alice')));
  });

  describe('admin rights', () => {
    beforeEach(() => seed({ 'users/alice': student('alice'), 'users/root': student('root', { role: 'admin' }) }));

    it('come from role=admin on the user document', async () => {
      await assertSucceeds(updateDoc(doc(as('root'), 'users/alice'), { role: 'admin' }));
    });

    it('come from an owner email only when the email is verified', async () => {
      await assertSucceeds(updateDoc(doc(asOwnerEmail(), 'users/alice'), { aiTokenLimit: 1000000 }));
      await assertFails(updateDoc(doc(as('owner', { email: OWNER_EMAIL, email_verified: false }), 'users/alice'), { aiTokenLimit: 1000000 }));
    });

    it('are not given to a regular student', async () => {
      await assertFails(updateDoc(doc(as('bob'), 'users/alice'), { role: 'admin' }));
    });
  });

  describe('blocks', () => {
    it('are private to the person who blocked', async () => {
      await assertSucceeds(setDoc(doc(as('alice'), 'users/alice/blocks/bob'), { name: 'Bob', blockedAt: 1 }));
      await assertSucceeds(getDoc(doc(as('alice'), 'users/alice/blocks/bob')));
      await assertFails(getDoc(doc(as('bob'), 'users/alice/blocks/bob')));
      await assertFails(setDoc(doc(as('bob'), 'users/alice/blocks/carol'), { name: 'Carol', blockedAt: 1 }));
      await assertFails(setDoc(doc(as('alice'), 'users/alice/blocks/carol'), { name: 'Carol', blockedAt: 1, extra: true }));
    });
  });
});

describe('publicProfiles (what other students see)', () => {
  it('can be read by signed-in students only', async () => {
    await seed({ 'publicProfiles/alice': { uid: 'alice', name: 'Alice' } });
    await assertSucceeds(getDoc(doc(as('bob'), 'publicProfiles/alice')));
    await assertFails(getDoc(doc(visitor(), 'publicProfiles/alice')));
  });

  it('can be written by the owner with name and photo only', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'publicProfiles/alice'), { uid: 'alice', name: 'Alice', updatedAt: 1 }));
    await assertFails(setDoc(doc(as('alice'), 'publicProfiles/alice'), { uid: 'alice', name: 'Alice', email: 'a@x.com' }));
    await assertFails(setDoc(doc(as('bob'), 'publicProfiles/alice'), { uid: 'alice', name: 'Fake' }));
  });
});

describe('reports', () => {
  it('can be filed by any signed-in student about someone else', async () => {
    await assertSucceeds(setDoc(doc(as('bob'), 'reports/r1'), report('bob')));
  });

  it('cannot be forged or malformed', async () => {
    const db = as('bob');
    await assertFails(setDoc(doc(db, 'reports/r1'), report('alice')));
    await assertFails(setDoc(doc(db, 'reports/r1'), report('bob', { reason: 'nonsense' })));
    await assertFails(setDoc(doc(db, 'reports/r1'), report('bob', { status: 'resolved' })));
    await assertFails(setDoc(doc(db, 'reports/r1'), report('bob', { details: 'x'.repeat(501) })));
    await assertFails(setDoc(doc(visitor(), 'reports/r1'), report('bob')));
  });

  it('can be read and handled only by an admin', async () => {
    await seed({ 'reports/r1': report('bob'), 'users/root': student('root', { role: 'admin' }) });
    await assertFails(getDoc(doc(as('bob'), 'reports/r1')));
    await assertFails(getDoc(doc(as('alice'), 'reports/r1')));
    await assertSucceeds(getDoc(doc(as('root'), 'reports/r1')));
    await assertSucceeds(updateDoc(doc(as('root'), 'reports/r1'), { status: 'resolved' }));
    await assertFails(deleteDoc(doc(as('bob'), 'reports/r1')));
  });
});

describe('private study data (sessions, tasks, todos)', () => {
  it.each([
    ['sessions', { userId: 'alice', messages: [], lastUpdated: 1 }],
    ['tasks', task('alice')],
    ['todos', { userId: 'alice', text: 'x' }],
  ])('%s belong to their owner only', async (name, data) => {
    await assertSucceeds(setDoc(doc(as('alice'), `${name}/a1`), data));
    await assertFails(getDoc(doc(as('bob'), `${name}/a1`)));
    await assertSucceeds(getDoc(doc(as('alice'), `${name}/a1`)));
    await assertFails(setDoc(doc(as('bob'), `${name}/b1`), { ...data, userId: 'alice' })); // cannot write as someone else
    await assertFails(deleteDoc(doc(as('bob'), `${name}/a1`)));
    await assertSucceeds(deleteDoc(doc(as('alice'), `${name}/a1`)));
  });

  it('tasks must be well formed', async () => {
    await assertFails(setDoc(doc(as('alice'), 'tasks/t1'), task('alice', { difficulty: 'Impossible' })));
    await assertFails(setDoc(doc(as('alice'), 'tasks/t1'), task('alice', { status: 'done' })));
    await assertSucceeds(setDoc(doc(as('alice'), 'tasks/t1'), task('alice')));
    await assertSucceeds(updateDoc(doc(as('alice'), 'tasks/t1'), { status: 'completed' }));
    await assertFails(updateDoc(doc(as('bob'), 'tasks/t1'), { status: 'completed' }));
  });

  it('lab activity can be written by the owner and read only by an admin', async () => {
    await seed({ 'users/root': student('root', { role: 'admin' }) });
    await assertSucceeds(addDoc(collection(as('alice'), 'genius_lab_activities'), { userId: 'alice', dateString: '2026-11-22' }));
    await assertFails(addDoc(collection(as('alice'), 'genius_lab_activities'), { userId: 'bob', dateString: '2026-11-22' }));
    await assertFails(getDocs(collection(as('alice'), 'genius_lab_activities')));
    await assertSucceeds(getDocs(collection(as('root'), 'genius_lab_activities')));
  });
});

describe('reviews', () => {
  it('are public to read, even for a visitor', async () => {
    await seed({ 'reviews/r1': review('alice') });
    await assertSucceeds(getDoc(doc(visitor(), 'reviews/r1')));
  });

  it('can be written by their author only, and must be valid', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'reviews/r1'), review('alice')));
    await assertFails(setDoc(doc(as('alice'), 'reviews/r2'), review('alice', { rating: 6 })));
    await assertFails(setDoc(doc(as('alice'), 'reviews/r2'), review('alice', { text: '' })));
    await assertFails(setDoc(doc(as('bob'), 'reviews/r3'), review('alice')));
  });

  it('can be deleted by their author or an admin', async () => {
    await seed({ 'reviews/r1': review('alice'), 'users/root': student('root', { role: 'admin' }) });
    await assertFails(deleteDoc(doc(as('bob'), 'reviews/r1')));
    await assertSucceeds(deleteDoc(doc(as('alice'), 'reviews/r1')));
    await seed({ 'reviews/r2': review('alice') });
    await assertSucceeds(deleteDoc(doc(as('root'), 'reviews/r2')));
  });
});

describe('community posts', () => {
  beforeEach(() => seed({ 'posts/p1': post('alice'), 'users/root': student('root', { role: 'admin' }) }));

  it('can be read by signed-in students only', async () => {
    await assertSucceeds(getDoc(doc(as('bob'), 'posts/p1')));
    await assertFails(getDoc(doc(visitor(), 'posts/p1')));
  });

  it('can be created by their author only', async () => {
    await assertSucceeds(setDoc(doc(as('bob'), 'posts/p2'), post('bob')));
    await assertFails(setDoc(doc(as('bob'), 'posts/p3'), post('alice')));
    await assertFails(setDoc(doc(as('bob'), 'posts/p4'), post('bob', { content: '' })));
  });

  it('can be edited by their author, not by others', async () => {
    await assertSucceeds(updateDoc(doc(as('alice'), 'posts/p1'), { content: 'edited' }));
    await assertFails(updateDoc(doc(as('bob'), 'posts/p1'), { content: 'hijacked' }));
  });

  it('can be liked and unliked by anyone, but only as yourself', async () => {
    await assertSucceeds(updateDoc(doc(as('bob'), 'posts/p1'), { likes: ['bob'] }));
    await assertFails(updateDoc(doc(as('bob'), 'posts/p1'), { likes: ['bob', 'carol'] }));
    await assertSucceeds(updateDoc(doc(as('bob'), 'posts/p1'), { likes: [] }));
  });

  it('cannot have likes of other people removed', async () => {
    await seed({ 'posts/p5': post('alice', { likes: ['carol'] }) });
    await assertFails(updateDoc(doc(as('bob'), 'posts/p5'), { likes: [] }));
  });

  it('allow the comment counter to move by one only', async () => {
    await assertSucceeds(updateDoc(doc(as('bob'), 'posts/p1'), { commentsCount: 1 }));
    await assertFails(updateDoc(doc(as('bob'), 'posts/p1'), { commentsCount: 9 }));
  });

  it('can be deleted by their author or an admin', async () => {
    await assertFails(deleteDoc(doc(as('bob'), 'posts/p1')));
    await assertSucceeds(deleteDoc(doc(as('alice'), 'posts/p1')));
    await seed({ 'posts/p6': post('alice') });
    await assertSucceeds(deleteDoc(doc(as('root'), 'posts/p6')));
  });

  describe('comments', () => {
    const comment = (userId: string) => ({ userId, userName: userId, content: 'nice', createdAt: 1 });

    it('can be written as yourself and deleted by the author or an admin', async () => {
      await assertSucceeds(setDoc(doc(as('bob'), 'posts/p1/comments/c1'), comment('bob')));
      await assertFails(setDoc(doc(as('bob'), 'posts/p1/comments/c2'), comment('alice')));
      await assertFails(setDoc(doc(as('bob'), 'posts/p1/comments/c3'), { ...comment('bob'), content: '' }));
      await assertFails(deleteDoc(doc(as('carol'), 'posts/p1/comments/c1')));
      await assertSucceeds(deleteDoc(doc(as('bob'), 'posts/p1/comments/c1')));
      await seed({ 'posts/p1/comments/c4': comment('bob') });
      await assertSucceeds(deleteDoc(doc(as('root'), 'posts/p1/comments/c4')));
    });

    it('can be read by signed-in students only', async () => {
      await seed({ 'posts/p1/comments/c5': comment('bob') });
      await assertSucceeds(getDoc(doc(as('carol'), 'posts/p1/comments/c5')));
      await assertFails(getDoc(doc(visitor(), 'posts/p1/comments/c5')));
    });
  });
});

describe('direct messages', () => {
  const thread = { participants: ['alice', 'bob'], lastMessage: '', lastTimestamp: 1, participantNames: { alice: 'Alice', bob: 'Bob' } };
  const message = (senderId: string, extra: object = {}) => ({ senderId, chatId: 'chat1', text: 'hi', timestamp: 1, ...extra });

  beforeEach(() => seed({ 'chats/chat1': thread }));

  it('threads can be read by their two participants only', async () => {
    await assertSucceeds(getDoc(doc(as('alice'), 'chats/chat1')));
    await assertSucceeds(getDoc(doc(as('bob'), 'chats/chat1')));
    await assertFails(getDoc(doc(as('carol'), 'chats/chat1')));
  });

  it('a thread can be started by one of its two participants', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'chats/new1'), { participants: ['alice', 'carol'], lastMessage: '', lastTimestamp: 1 }));
    await assertFails(setDoc(doc(as('alice'), 'chats/new2'), { participants: ['bob', 'carol'], lastMessage: '', lastTimestamp: 1 }));
    await assertFails(setDoc(doc(as('alice'), 'chats/new3'), { participants: ['alice', 'bob', 'carol'], lastMessage: '', lastTimestamp: 1 }));
  });

  it('a thread cannot be started with someone who blocked you', async () => {
    await seed({ 'users/carol/blocks/alice': { name: 'Alice', blockedAt: 1 } });
    await assertFails(setDoc(doc(as('alice'), 'chats/new4'), { participants: ['alice', 'carol'], lastMessage: '', lastTimestamp: 1 }));
  });

  it('only the last-message fields of a thread can change, never the participants', async () => {
    await assertSucceeds(updateDoc(doc(as('alice'), 'chats/chat1'), { lastMessage: 'hi', lastTimestamp: 2 }));
    await assertFails(updateDoc(doc(as('alice'), 'chats/chat1'), { participants: ['alice', 'carol'] }));
    await assertFails(updateDoc(doc(as('carol'), 'chats/chat1'), { lastMessage: 'x' }));
  });

  it('messages can be sent by a participant as themselves', async () => {
    await assertSucceeds(setDoc(doc(as('alice'), 'chats/chat1/messages/m1'), message('alice')));
    await assertFails(setDoc(doc(as('alice'), 'chats/chat1/messages/m2'), message('bob'))); // pretending to be bob
    await assertFails(setDoc(doc(as('alice'), 'chats/chat1/messages/m3'), message('alice', { chatId: 'other' })));
    await assertFails(setDoc(doc(as('alice'), 'chats/chat1/messages/m4'), message('alice', { text: '' })));
    await assertFails(setDoc(doc(as('alice'), 'chats/chat1/messages/m5'), message('alice', { text: 'x'.repeat(2001) })));
    await assertFails(setDoc(doc(as('carol'), 'chats/chat1/messages/m6'), message('carol'))); // not in the chat
  });

  it('messages can be read by the two participants only', async () => {
    await seed({ 'chats/chat1/messages/m1': message('alice') });
    await assertSucceeds(getDoc(doc(as('bob'), 'chats/chat1/messages/m1')));
    await assertFails(getDoc(doc(as('carol'), 'chats/chat1/messages/m1')));
    await assertFails(getDoc(doc(visitor(), 'chats/chat1/messages/m1')));
  });

  it('a blocked person cannot send messages any more', async () => {
    await seed({ 'users/bob/blocks/alice': { name: 'Alice', blockedAt: 1 } });
    await assertFails(setDoc(doc(as('alice'), 'chats/chat1/messages/m7'), message('alice')));
    await assertSucceeds(setDoc(doc(as('bob'), 'chats/chat1/messages/m8'), message('bob')));
  });
});

describe('server-only collections', () => {
  const closed = ['family_codes', 'family_links', 'classes', 'class_members', 'teachers', 'teacher_requests', 'analytics_events', 'promo_claims', 'referrals', 'some_future_collection'];

  it.each(closed)('%s cannot be read or written from a browser, not even by an admin', async (name) => {
    await seed({ [`${name}/x`]: { childUid: 'alice', uid: 'alice' }, 'users/root': student('root', { role: 'admin' }) });
    for (const db of [as('alice'), as('root'), asOwnerEmail(), visitor()]) {
      await assertFails(getDoc(doc(db, `${name}/x`)));
      await assertFails(setDoc(doc(db, `${name}/y`), { childUid: 'alice' }));
      await assertFails(deleteDoc(doc(db, `${name}/x`)));
    }
  });
});
