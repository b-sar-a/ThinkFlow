import { useCallback, useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from '../context/AuthContext';

export const REPORT_REASONS = ['spam', 'bullying', 'personal_data', 'inappropriate', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export type ReportTarget = 'post' | 'comment' | 'message' | 'user';

export interface ReportInput {
  targetType: ReportTarget;
  targetId: string;
  /** The person being reported. */
  targetUserId: string;
  reason: ReportReason;
  details?: string;
  /** A copy of the reported text, so a moderator can read it even if it is deleted later. */
  text?: string;
  /** For comments: the post they belong to. */
  postId?: string;
}

const DEMO_UID = 'demo-uid-123';

/**
 * Blocking and reporting. Blocks live in a private sub-collection (users/{me}/blocks/{them}),
 * so nobody else can see who blocked whom. Reports go to a collection only moderators can read.
 */
export function useSafety() {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || user.uid === DEMO_UID) {
      setBlocked({});
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'blocks'),
      (snapshot) => {
        const next: Record<string, string> = {};
        snapshot.docs.forEach((d) => {
          next[d.id] = String(d.data().name || '');
        });
        setBlocked(next);
      },
      (error) => console.warn('Could not load blocked users:', error)
    );
    return () => unsubscribe();
  }, [user?.uid]);

  const isBlocked = useCallback((uid?: string) => !!uid && uid in blocked, [blocked]);

  const block = useCallback(
    async (uid: string, name: string) => {
      if (!user) return;
      await setDoc(doc(db, 'users', user.uid, 'blocks', uid), { name: name.slice(0, 80), blockedAt: Date.now() });
    },
    [user]
  );

  const unblock = useCallback(
    async (uid: string) => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'blocks', uid));
    },
    [user]
  );

  const report = useCallback(
    async (input: ReportInput) => {
      if (!user) throw new Error('AUTH_REQUIRED');
      await addDoc(collection(db, 'reports'), {
        reporterId: user.uid,
        targetType: input.targetType,
        targetId: input.targetId,
        targetUserId: input.targetUserId,
        reason: input.reason,
        details: (input.details || '').slice(0, 500),
        text: (input.text || '').slice(0, 300),
        ...(input.postId ? { postId: input.postId } : {}),
        status: 'open',
        createdAt: Date.now(),
      });
    },
    [user]
  );

  return { blocked, isBlocked, block, unblock, report };
}
