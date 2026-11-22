import { randomInt } from "node:crypto";

/**
 * Parent access. A student creates a short-lived code; a parent enters it and gets a read-only
 * summary of that student's progress. Everything runs on the server with the Admin SDK, so the
 * Firestore rules need no new read access: family_codes and family_links stay closed to clients.
 *
 * What a parent can see is fixed in `summarize` below: name, grade, goal, XP, level, streaks,
 * finished tasks and active days. Never email, messages, community posts or AI conversations.
 */

export class FamilyError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// The slice of the Firestore Admin API this module needs, so it can be tested with a fake.
export interface DocSnap {
  exists: boolean;
  id: string;
  data(): any;
}
export interface DocRef {
  get(): Promise<DocSnap>;
  set(data: any, options?: any): Promise<any> | any;
  delete(): Promise<any> | any;
}
export interface QueryLike {
  limit(n: number): QueryLike;
  get(): Promise<{ docs: (DocSnap & { ref: DocRef })[]; size: number }>;
}
export interface Tx {
  get(ref: DocRef): Promise<DocSnap>;
  set(ref: DocRef, data: any, options?: any): any;
  delete(ref: DocRef): any;
}
export interface Db {
  doc(path: string): DocRef;
  collection(name: string): { where(field: string, op: "==" | "array-contains", value: any): QueryLike };
  runTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
}

export const CODE_TTL_MS = 24 * 60 * 60 * 1000;
export const MAX_PARENTS_PER_CHILD = 4;
export const MAX_CHILDREN_PER_PARENT = 10;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid misreading
const CODE_LENGTH = 8;

export const generateCode = () => Array.from({ length: CODE_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

export const normalizeCode = (raw: unknown) => String(raw ?? "").toUpperCase().replace(/[\s-]/g, "");
export const isValidCode = (code: string) => new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`).test(code);

const linkId = (childUid: string, parentUid: string) => `${childUid}_${parentUid}`;

/** Student side: a new code. Any older code of the same student stops working. */
export async function createCode(db: Db, childUid: string, now = Date.now()) {
  const old = await db.collection("family_codes").where("childUid", "==", childUid).limit(20).get();
  await Promise.all(old.docs.map((d) => d.ref.delete()));

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const ref = db.doc(`family_codes/${code}`);
    if ((await ref.get()).exists) continue;
    const expiresAt = now + CODE_TTL_MS;
    await ref.set({ childUid, createdAt: now, expiresAt });
    return { code, expiresAt };
  }
  throw new FamilyError(500, "CODE_FAILED");
}

/** Parent side: use a code once. The code is consumed, the link stays until someone removes it. */
export async function linkWithCode(db: Db, parentUid: string, rawCode: unknown, now = Date.now()) {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) throw new FamilyError(404, "INVALID_CODE");

  const codeRef = db.doc(`family_codes/${code}`);
  const peek = await codeRef.get();
  const childUid: string | undefined = peek.data()?.childUid;
  if (!peek.exists || !childUid || (peek.data()?.expiresAt ?? 0) < now) throw new FamilyError(404, "INVALID_CODE");
  if (childUid === parentUid) throw new FamilyError(400, "OWN_CODE");

  const [parents, children] = await Promise.all([
    db.collection("family_links").where("childUid", "==", childUid).limit(MAX_PARENTS_PER_CHILD + 1).get(),
    db.collection("family_links").where("parentUid", "==", parentUid).limit(MAX_CHILDREN_PER_PARENT + 1).get(),
  ]);
  if (parents.size >= MAX_PARENTS_PER_CHILD) throw new FamilyError(409, "TOO_MANY_PARENTS");
  if (children.size >= MAX_CHILDREN_PER_PARENT) throw new FamilyError(409, "TOO_MANY_CHILDREN");

  const linkRef = db.doc(`family_links/${linkId(childUid, parentUid)}`);
  await db.runTransaction(async (tx) => {
    const [codeSnap, linkSnap] = await Promise.all([tx.get(codeRef), tx.get(linkRef)]);
    // Re-check inside the transaction: two parents racing for one code must not both win.
    if (!codeSnap.exists || (codeSnap.data()?.expiresAt ?? 0) < now) throw new FamilyError(404, "INVALID_CODE");
    if (linkSnap.exists) throw new FamilyError(409, "ALREADY_LINKED");
    tx.delete(codeRef);
    tx.set(linkRef, { childUid, parentUid, createdAt: now });
  });
  return { childUid };
}

/** Either side can end the link. */
export async function unlink(db: Db, callerUid: string, childUid: unknown, parentUid: unknown) {
  const child = String(childUid ?? "");
  const parent = String(parentUid ?? "");
  if (!child || !parent || (callerUid !== child && callerUid !== parent)) throw new FamilyError(403, "FORBIDDEN");
  const ref = db.doc(`family_links/${linkId(child, parent)}`);
  if (!(await ref.get()).exists) throw new FamilyError(404, "NOT_LINKED");
  await ref.delete();
}

/** Student side: who has access right now. */
export async function listParents(db: Db, childUid: string) {
  const links = await db.collection("family_links").where("childUid", "==", childUid).limit(MAX_PARENTS_PER_CHILD + 1).get();
  return Promise.all(
    links.docs.map(async (l) => {
      const parentUid: string = l.data().parentUid;
      const user = await db.doc(`users/${parentUid}`).get();
      return { parentUid, name: String(user.data()?.name || "").slice(0, 60), linkedAt: l.data().createdAt ?? 0 };
    })
  );
}

const utcDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** The only fields a parent ever receives about a child. */
export async function summarize(db: Db, childUid: string, now = Date.now()) {
  const [user, tasks, activity] = await Promise.all([
    db.doc(`users/${childUid}`).get(),
    db.collection("tasks").where("userId", "==", childUid).limit(500).get(),
    db.collection("genius_lab_activities").where("userId", "==", childUid).limit(500).get(),
  ]);
  const u = user.data() || {};
  const activeDates = new Set<string>(activity.docs.map((d) => d.data().dateString).filter(Boolean));
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = utcDay(now - (6 - i) * 86_400_000);
    return { date, active: activeDates.has(date) };
  });
  return {
    childUid,
    name: String(u.name || "").slice(0, 60),
    grade: typeof u.studentClass === "string" ? u.studentClass : "",
    goal: typeof u.goal === "string" ? u.goal : "",
    xp: Number(u.xp) || 0,
    level: Number(u.level) || 1,
    streakDays: Number(u.streakDays) || 0,
    longestStreak: Number(u.longestStreak) || 0,
    lastActiveDate: typeof u.lastActiveDate === "string" ? u.lastActiveDate : "",
    tasksCompleted: tasks.docs.filter((t) => t.data().status === "completed").length,
    week,
  };
}

/** Parent side: every linked child with the summary. */
export async function listChildren(db: Db, parentUid: string, now = Date.now()) {
  const links = await db.collection("family_links").where("parentUid", "==", parentUid).limit(MAX_CHILDREN_PER_PARENT + 1).get();
  const children = await Promise.all(
    links.docs.map(async (l) => ({ linkedAt: l.data().createdAt ?? 0, ...(await summarize(db, l.data().childUid, now)) }))
  );
  return children.sort((a, b) => a.linkedAt - b.linkedAt);
}
