import { randomInt } from "node:crypto";
import { FamilyError, generateCode, isValidCode, normalizeCode, summarize, type Db } from "./family.js";

/**
 * Teacher cabinet. Only teachers approved by an admin can create classes; students join a class
 * with its code (their own consent), and the teacher sees a light summary of each student.
 * Same server-only approach as parent access: collections teachers, teacher_requests, classes and
 * class_members are used only through the Admin SDK and stay closed to clients.
 *
 * Why approval: a class code gives access to children's progress, so "anyone can be a teacher"
 * would let a classmate collect it. An admin checks every request first.
 */

export const MAX_CLASSES_PER_TEACHER = 5;
export const MAX_STUDENTS_PER_CLASS = 200;
export const MAX_CLASSES_PER_STUDENT = 10;

const clean = (value: unknown, max: number) =>
  String(value ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const newId = () => Array.from({ length: 12 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[randomInt(36)]).join("");
const memberId = (classId: string, studentUid: string) => `${classId}_${studentUid}`;

// ---------- teacher approval ----------

export type TeacherStatus = "approved" | "pending" | "none";

export async function teacherStatus(db: Db, uid: string): Promise<TeacherStatus> {
  if ((await db.doc(`teachers/${uid}`).get()).exists) return "approved";
  if ((await db.doc(`teacher_requests/${uid}`).get()).exists) return "pending";
  return "none";
}

async function requireTeacher(db: Db, uid: string) {
  if ((await teacherStatus(db, uid)) !== "approved") throw new FamilyError(403, "NOT_TEACHER");
}

export async function requestTeacher(db: Db, uid: string, input: { school?: unknown; note?: unknown }, now = Date.now()) {
  if ((await teacherStatus(db, uid)) === "approved") throw new FamilyError(409, "ALREADY_TEACHER");
  const school = clean(input.school, 80);
  if (!school) throw new FamilyError(400, "SCHOOL_REQUIRED");
  await db.doc(`teacher_requests/${uid}`).set({ uid, school, note: clean(input.note, 300), status: "pending", createdAt: now });
}

/** Admin: pending requests and active teachers, with the account name and email. */
export async function listTeacherAdmin(db: Db) {
  const [requests, teachers] = await Promise.all([
    db.collection("teacher_requests").where("status", "==", "pending").limit(200).get(),
    db.collection("teachers").where("active", "==", true).limit(500).get(),
  ]);
  const who = async (uid: string) => {
    const u = (await db.doc(`users/${uid}`).get()).data() || {};
    return { name: String(u.name || "").slice(0, 60), email: String(u.email || "").slice(0, 120) };
  };
  return {
    requests: await Promise.all(
      requests.docs.map(async (d) => ({ uid: d.id, school: d.data().school, note: d.data().note, createdAt: d.data().createdAt, ...(await who(d.id)) }))
    ),
    teachers: await Promise.all(
      teachers.docs.map(async (d) => ({ uid: d.id, approvedAt: d.data().approvedAt, ...(await who(d.id)) }))
    ),
  };
}

export async function approveTeacher(db: Db, adminUid: string, uid: string, now = Date.now()) {
  if (!uid || uid.includes("/")) throw new FamilyError(400, "INVALID_UID");
  if (!(await db.doc(`users/${uid}`).get()).exists) throw new FamilyError(404, "NO_SUCH_USER");
  await db.doc(`teachers/${uid}`).set({ active: true, approvedAt: now, approvedBy: adminUid });
  await db.doc(`teacher_requests/${uid}`).delete();
}

export async function declineTeacher(db: Db, uid: string) {
  if (!uid || uid.includes("/")) throw new FamilyError(400, "INVALID_UID");
  await db.doc(`teacher_requests/${uid}`).delete();
}

/** Revoking ends access at once: every teacher endpoint and every class code checks this. */
export async function revokeTeacher(db: Db, uid: string) {
  if (!uid || uid.includes("/")) throw new FamilyError(400, "INVALID_UID");
  await db.doc(`teachers/${uid}`).delete();
}

// ---------- classes (teacher side) ----------

async function uniqueCode(db: Db): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateCode();
    const taken = await db.collection("classes").where("code", "==", code).limit(1).get();
    if (taken.size === 0) return code;
  }
  throw new FamilyError(500, "CODE_FAILED");
}

async function ownClass(db: Db, teacherUid: string, classId: string) {
  if (!classId || classId.includes("/")) throw new FamilyError(404, "NO_SUCH_CLASS");
  const ref = db.doc(`classes/${classId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new FamilyError(404, "NO_SUCH_CLASS");
  if (snap.data().teacherUid !== teacherUid) throw new FamilyError(403, "FORBIDDEN");
  return { ref, data: snap.data() as { teacherUid: string; name: string; code: string; createdAt: number } };
}

export async function createClass(db: Db, teacherUid: string, rawName: unknown, now = Date.now()) {
  await requireTeacher(db, teacherUid);
  const name = clean(rawName, 60);
  if (!name) throw new FamilyError(400, "NAME_REQUIRED");
  const mine = await db.collection("classes").where("teacherUid", "==", teacherUid).limit(MAX_CLASSES_PER_TEACHER + 1).get();
  if (mine.size >= MAX_CLASSES_PER_TEACHER) throw new FamilyError(409, "TOO_MANY_CLASSES");

  const classId = newId();
  const code = await uniqueCode(db);
  await db.doc(`classes/${classId}`).set({ teacherUid, name, code, createdAt: now });
  return { classId, name, code, createdAt: now, students: 0 };
}

export async function listClasses(db: Db, teacherUid: string) {
  await requireTeacher(db, teacherUid);
  const classes = await db.collection("classes").where("teacherUid", "==", teacherUid).limit(MAX_CLASSES_PER_TEACHER + 1).get();
  const rows = await Promise.all(
    classes.docs.map(async (c) => {
      const members = await db.collection("class_members").where("classId", "==", c.id).limit(MAX_STUDENTS_PER_CLASS + 1).get();
      return { classId: c.id, name: c.data().name, code: c.data().code, createdAt: c.data().createdAt, students: members.size };
    })
  );
  return rows.sort((a, b) => a.createdAt - b.createdAt);
}

/** A leaked or old code can be replaced; students who already joined stay. */
export async function rotateCode(db: Db, teacherUid: string, classId: string) {
  await requireTeacher(db, teacherUid);
  const { ref } = await ownClass(db, teacherUid, classId);
  const code = await uniqueCode(db);
  await ref.set({ code }, { merge: true });
  return { code };
}

export async function deleteClass(db: Db, teacherUid: string, classId: string) {
  await requireTeacher(db, teacherUid);
  const { ref } = await ownClass(db, teacherUid, classId);
  const members = await db.collection("class_members").where("classId", "==", classId).limit(1000).get();
  await Promise.all(members.docs.map((m) => m.ref.delete()));
  await ref.delete();
}

export interface RosterStudent {
  studentUid: string;
  name: string;
  grade: string;
  xp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
  lessonsCompleted: number;
  joinedAt: number;
}

export async function roster(db: Db, teacherUid: string, classId: string) {
  await requireTeacher(db, teacherUid);
  const { data } = await ownClass(db, teacherUid, classId);
  const members = await db.collection("class_members").where("classId", "==", classId).limit(MAX_STUDENTS_PER_CLASS + 1).get();

  const students: RosterStudent[] = [];
  // Small batches keep the number of parallel reads reasonable for a class of 200.
  for (let i = 0; i < members.docs.length; i += 25) {
    const batch = await Promise.all(
      members.docs.slice(i, i + 25).map(async (m) => {
        const studentUid: string = m.data().studentUid;
        const u = (await db.doc(`users/${studentUid}`).get()).data() || {};
        return {
          studentUid,
          name: String(u.name || "").slice(0, 60),
          grade: typeof u.studentClass === "string" ? u.studentClass : "",
          xp: Number(u.xp) || 0,
          level: Number(u.level) || 1,
          streakDays: Number(u.streakDays) || 0,
          longestStreak: Number(u.longestStreak) || 0,
          lastActiveDate: typeof u.lastActiveDate === "string" ? u.lastActiveDate : "",
          lessonsCompleted: Array.isArray(u.lessonsDone) ? Math.min(200, u.lessonsDone.length) : 0,
          joinedAt: m.data().joinedAt ?? 0,
        } satisfies RosterStudent;
      })
    );
    students.push(...batch);
  }
  return { classId, name: data.name, code: data.code, students };
}

/** One student in full detail (week strip and finished tasks), only for the student's own teacher. */
export async function studentDetail(db: Db, teacherUid: string, classId: string, studentUid: string, now = Date.now()) {
  await requireTeacher(db, teacherUid);
  await ownClass(db, teacherUid, classId);
  if (!studentUid || studentUid.includes("/")) throw new FamilyError(404, "NOT_MEMBER");
  if (!(await db.doc(`class_members/${memberId(classId, studentUid)}`).get()).exists) throw new FamilyError(404, "NOT_MEMBER");
  return summarize(db, studentUid, now);
}

// ---------- classes (student side) ----------

export async function joinClass(db: Db, studentUid: string, rawCode: unknown, now = Date.now()) {
  const code = normalizeCode(rawCode);
  if (!isValidCode(code)) throw new FamilyError(404, "INVALID_CODE");

  const found = await db.collection("classes").where("code", "==", code).limit(1).get();
  const cls = found.docs[0];
  // A class whose teacher was revoked can no longer be joined.
  if (!cls || (await teacherStatus(db, cls.data().teacherUid)) !== "approved") throw new FamilyError(404, "INVALID_CODE");
  if (cls.data().teacherUid === studentUid) throw new FamilyError(400, "OWN_CODE");

  const mine = db.doc(`class_members/${memberId(cls.id, studentUid)}`);
  if ((await mine.get()).exists) throw new FamilyError(409, "ALREADY_MEMBER");

  const [inClass, inClasses] = await Promise.all([
    db.collection("class_members").where("classId", "==", cls.id).limit(MAX_STUDENTS_PER_CLASS + 1).get(),
    db.collection("class_members").where("studentUid", "==", studentUid).limit(MAX_CLASSES_PER_STUDENT + 1).get(),
  ]);
  if (inClass.size >= MAX_STUDENTS_PER_CLASS) throw new FamilyError(409, "CLASS_FULL");
  if (inClasses.size >= MAX_CLASSES_PER_STUDENT) throw new FamilyError(409, "TOO_MANY_CLASSES_JOINED");

  await mine.set({ classId: cls.id, teacherUid: cls.data().teacherUid, studentUid, joinedAt: now });
  return { classId: cls.id, name: String(cls.data().name) };
}

export async function listMyClasses(db: Db, studentUid: string) {
  const members = await db.collection("class_members").where("studentUid", "==", studentUid).limit(MAX_CLASSES_PER_STUDENT + 1).get();
  const rows = await Promise.all(
    members.docs.map(async (m) => {
      const cls = (await db.doc(`classes/${m.data().classId}`).get()).data();
      if (!cls) return null;
      const teacher = (await db.doc(`users/${cls.teacherUid}`).get()).data() || {};
      return { classId: String(m.data().classId), name: String(cls.name), teacherName: String(teacher.name || "").slice(0, 60), joinedAt: m.data().joinedAt ?? 0 };
    })
  );
  return rows.filter((r): r is NonNullable<typeof r> => r !== null);
}

/** The student leaves, or the teacher removes a student. Nobody else can. */
export async function leaveClass(db: Db, callerUid: string, classId: string, studentUid: string) {
  if (!classId || !studentUid || classId.includes("/") || studentUid.includes("/")) throw new FamilyError(404, "NOT_MEMBER");
  const cls = (await db.doc(`classes/${classId}`).get()).data();
  const isStudent = callerUid === studentUid;
  const isTeacher = !!cls && cls.teacherUid === callerUid;
  if (!isStudent && !isTeacher) throw new FamilyError(403, "FORBIDDEN");
  const ref = db.doc(`class_members/${memberId(classId, studentUid)}`);
  if (!(await ref.get()).exists) throw new FamilyError(404, "NOT_MEMBER");
  await ref.delete();
}
