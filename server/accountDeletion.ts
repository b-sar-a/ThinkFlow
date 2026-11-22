import type { Db, DocRef, QueryLike } from "./family.js";

/**
 * Real account deletion. Removes everything that belongs to the student from Firestore; the
 * caller then removes the Firebase Auth user. Runs with the Admin SDK, so it is not limited by the
 * Firestore rules, and it is safe to run again after a partial failure (every step is idempotent).
 *
 * Kept on purpose: abuse reports (the reporter's and the reported person's), because they protect
 * other students. The privacy policy says so.
 */

export interface DeletionDb extends Db {
  /** Deletes a document and everything below it (Admin SDK: db.recursiveDelete). */
  recursiveDelete(ref: DocRef): Promise<unknown>;
  collectionGroup(id: string): { where(field: string, op: "==", value: any): QueryLike };
}

export interface DeletionReport {
  deleted: Record<string, number>;
  /** Parts that could not be fully cleaned (for example a missing index); the caller may retry. */
  skipped: string[];
}

const PAGE = 200;
const MAX_PASSES = 50;
const DELETED_NAME = "Deleted user";

/** Collections where every document with `field == uid` is the student's own data. */
const OWNED: { collection: string; field: string }[] = [
  { collection: "posts", field: "userId" }, // recursive: takes the comments under each post
  { collection: "sessions", field: "userId" },
  { collection: "tasks", field: "userId" },
  { collection: "todos", field: "userId" },
  { collection: "reviews", field: "userId" },
  { collection: "genius_lab_activities", field: "userId" },
  { collection: "promo_claims", field: "uid" },
  { collection: "analytics_events", field: "uid" },
  { collection: "family_codes", field: "childUid" },
  { collection: "family_links", field: "childUid" },
  { collection: "family_links", field: "parentUid" },
  { collection: "class_members", field: "studentUid" }, // the student leaves every class
  { collection: "class_members", field: "teacherUid" }, // a teacher's classes go, so do their rows
  { collection: "classes", field: "teacherUid" },
];

/** Deletes every match, page by page, until none are left. */
async function purge(db: DeletionDb, makeQuery: () => QueryLike, label: string, report: DeletionReport) {
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const page = await makeQuery().limit(PAGE).get();
    if (page.docs.length === 0) return;
    for (const d of page.docs) await db.recursiveDelete(d.ref);
    report.deleted[label] = (report.deleted[label] ?? 0) + page.docs.length;
  }
  report.skipped.push(label);
}

export async function deleteAccountData(db: DeletionDb, uid: string): Promise<DeletionReport> {
  if (!uid || uid.includes("/")) throw new Error("INVALID_UID");
  const report: DeletionReport = { deleted: {}, skipped: [] };

  for (const { collection, field } of OWNED) {
    await purge(db, () => db.collection(collection).where(field, "==", uid), collection, report);
  }

  // Comments the student wrote under other people's posts. Needs a collection-group index on
  // comments.userId; if it is missing we say so instead of failing the whole deletion.
  try {
    await purge(db, () => db.collectionGroup("comments").where("userId", "==", uid), "comments", report);
  } catch {
    report.skipped.push("comments");
  }

  // Direct messages: remove what the student wrote and hide the name in the shared thread.
  const threads = await db.collection("chats").where("participants", "array-contains", uid).limit(500).get();
  for (const thread of threads.docs) {
    await purge(db, () => db.collection(`chats/${thread.id}/messages`).where("senderId", "==", uid), "messages", report);
    await thread.ref.set(
      { participantNames: { [uid]: DELETED_NAME }, participantPhotos: { [uid]: "" } },
      { merge: true }
    );
  }
  if (threads.size >= 500) report.skipped.push("chats");

  await db.doc(`referrals/${uid}`).delete();
  await db.doc(`teachers/${uid}`).delete();
  await db.doc(`teacher_requests/${uid}`).delete();
  await db.doc(`publicProfiles/${uid}`).delete();
  // Last, so that a retry after a failure still finds the account and can finish the job.
  await db.recursiveDelete(db.doc(`users/${uid}`)); // includes users/{uid}/blocks
  report.deleted.account = 1;

  return report;
}
