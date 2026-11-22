import { authedPost } from './http';
import { familyErrorText, type ChildSummary } from './family';

export type TeacherStatus = 'approved' | 'pending' | 'none';

export interface ClassRow {
  classId: string;
  name: string;
  code: string;
  createdAt: number;
  students: number;
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

export interface Roster {
  classId: string;
  name: string;
  code: string;
  students: RosterStudent[];
}

export interface MyClass {
  classId: string;
  name: string;
  teacherName: string;
  joinedAt: number;
}

export interface TeacherAdminData {
  requests: { uid: string; name: string; email: string; school: string; note: string; createdAt: number }[];
  teachers: { uid: string; name: string; email: string; approvedAt: number }[];
}

// Teacher
export const fetchTeacherStatus = async () => (await authedPost<{ status: TeacherStatus }>('/api/teacher/status', {})).status;
export const requestTeacher = (school: string, note: string) => authedPost<{ status: 'pending' }>('/api/teacher/request', { school, note });
export const fetchClasses = async () => (await authedPost<{ classes: ClassRow[] }>('/api/class/list', {})).classes;
export const createClass = (name: string) => authedPost<ClassRow>('/api/class/create', { name });
export const rotateClassCode = (classId: string) => authedPost<{ code: string }>('/api/class/rotate', { classId });
export const deleteClass = (classId: string) => authedPost<{ ok: true }>('/api/class/delete', { classId });
export const fetchRoster = (classId: string) => authedPost<Roster>('/api/class/roster', { classId });
export const fetchStudentDetail = (classId: string, studentUid: string) => authedPost<ChildSummary>('/api/class/student', { classId, studentUid });

// Student
export const joinClass = (code: string) => authedPost<{ classId: string; name: string }>('/api/class/join', { code });
export const fetchMyClasses = async () => (await authedPost<{ classes: MyClass[] }>('/api/class/mine', {})).classes;
export const leaveClass = (classId: string, studentUid: string) => authedPost<{ ok: true }>('/api/class/leave', { classId, studentUid });

// Admin
export const fetchTeacherAdmin = () => authedPost<TeacherAdminData>('/api/admin/teachers', {});
export const teacherAction = (action: 'approve' | 'decline' | 'revoke', uid: string) => authedPost<{ ok: true }>(`/api/admin/teacher/${action}`, { uid });

/** Message for an API error code, in the caller's language. */
export function classErrorText(err: unknown, tr: (en: string, ru: string, uz: string) => string): string {
  switch (String((err as Error)?.message || '')) {
    case 'NOT_TEACHER':
      return tr('Teacher access has not been approved for this account.', 'Для этого аккаунта доступ учителя не подтверждён.', "Bu akkaunt uchun o'qituvchi huquqi tasdiqlanmagan.");
    case 'SCHOOL_REQUIRED':
      return tr('Enter your school.', 'Укажите школу.', 'Maktabingizni kiriting.');
    case 'NAME_REQUIRED':
      return tr('Enter a class name.', 'Введите название класса.', 'Sinf nomini kiriting.');
    case 'ALREADY_TEACHER':
      return tr('You already have teacher access.', 'У вас уже есть доступ учителя.', "Sizda o'qituvchi huquqi allaqachon bor.");
    case 'TOO_MANY_CLASSES':
      return tr('You can have up to 5 classes.', 'Можно создать не больше 5 классов.', "5 tagacha sinf yaratish mumkin.");
    case 'ALREADY_MEMBER':
      return tr('You are already in this class.', 'Вы уже в этом классе.', "Siz bu sinfdasiz.");
    case 'CLASS_FULL':
      return tr('This class is full.', 'Класс заполнен.', "Bu sinf to'lgan.");
    case 'TOO_MANY_CLASSES_JOINED':
      return tr('You are already in 10 classes.', 'Вы уже состоите в 10 классах.', "Siz allaqachon 10 ta sinfdasiz.");
    case 'NO_SUCH_CLASS':
    case 'NOT_MEMBER':
      return tr('That class or student was not found.', 'Класс или ученик не найден.', 'Sinf yoki o‘quvchi topilmadi.');
    case 'INVALID_CODE':
      return tr('This class code is wrong or no longer valid.', 'Код класса неверный или больше не действует.', "Sinf kodi noto'g'ri yoki endi amal qilmaydi.");
    default:
      return familyErrorText(err, tr);
  }
}
