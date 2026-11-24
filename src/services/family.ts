import { authedPost } from './http';

export interface WeekDay {
  date: string;
  active: boolean;
}

/** Everything a parent can see about a child (the server sends nothing else). */
export interface ChildSummary {
  childUid: string;
  linkedAt: number;
  name: string;
  grade: string;
  goal: string;
  xp: number;
  level: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string;
  tasksCompleted: number;
  lessonsCompleted: number;
  week: WeekDay[];
}

export interface LinkedParent {
  parentUid: string;
  name: string;
  linkedAt: number;
}

export const createFamilyCode = () => authedPost<{ code: string; expiresAt: number }>('/api/family/code', {});
export const linkChild = (code: string) => authedPost<{ childUid: string }>('/api/family/link', { code });
export const fetchChildren = async () => (await authedPost<{ children: ChildSummary[] }>('/api/family/children', {})).children;
export const fetchParents = async () => (await authedPost<{ parents: LinkedParent[] }>('/api/family/parents', {})).parents;
export const unlinkFamily = (childUid: string, parentUid: string) => authedPost<{ ok: true }>('/api/family/unlink', { childUid, parentUid });

export interface DigestState {
  enabled: boolean;
  lastSentAt: number;
  /** False until the owner has set the email keys on the server. */
  available: boolean;
}
export const fetchDigest = () => authedPost<DigestState>('/api/family/digest', {});
export const setDigest = (enabled: boolean, lang: string) => authedPost<DigestState>('/api/family/digest', { enabled, lang });

/** Human message for an API error code, in the caller's language. */
export function familyErrorText(err: unknown, tr: (en: string, ru: string, uz: string) => string): string {
  switch (String((err as Error)?.message || '')) {
    case 'INVALID_CODE':
      return tr('This code is wrong or has expired. Ask your child to create a new one.', 'Код неверный или устарел. Попросите ребёнка создать новый.', "Kod noto'g'ri yoki muddati tugagan. Farzandingizdan yangisini yaratishni so'rang.");
    case 'OWN_CODE':
      return tr('This is your own code. Enter it in the parent account.', 'Это ваш собственный код. Введите его в аккаунте родителя.', "Bu sizning o'z kodingiz. Uni ota-ona akkauntida kiriting.");
    case 'ALREADY_LINKED':
      return tr('You already have access to this student.', 'У вас уже есть доступ к этому ученику.', "Sizda bu o'quvchiga kirish allaqachon bor.");
    case 'TOO_MANY_PARENTS':
      return tr('This student already has the maximum number of parents (4).', 'У ученика уже максимальное число родителей (4).', "Bu o'quvchida ota-onalar soni maksimal (4).");
    case 'TOO_MANY_CHILDREN':
      return tr('You have reached the limit of 10 linked students.', 'Достигнут лимит в 10 учеников.', "10 ta o'quvchi chegarasiga yetdingiz.");
    case 'RATE_LIMITED':
      return tr('Too many attempts. Wait a few minutes and try again.', 'Слишком много попыток. Подождите несколько минут.', "Urinishlar juda ko'p. Bir necha daqiqa kuting.");
    case 'FAMILY_UNAVAILABLE':
      return tr('Parent access is not available right now.', 'Родительский доступ сейчас недоступен.', "Ota-ona kirishi hozir mavjud emas.");
    case 'AUTH_REQUIRED':
    case 'AUTH_INVALID':
      return tr('Sign in with a real account to use this. The demo account cannot.', 'Войдите в настоящий аккаунт. В демо-режиме это недоступно.', "Haqiqiy akkaunt bilan kiring. Demo rejimida bu mavjud emas.");
    default:
      return tr('Something went wrong. Try again.', 'Что-то пошло не так. Попробуйте ещё раз.', "Xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}
