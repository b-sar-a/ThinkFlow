export type ProgramLang = 'en' | 'ru' | 'uz';

/** Text in the two languages the lessons are written in. Uzbek falls back to Russian. */
export interface Bi<T> {
  en: T;
  ru: T;
}

export const bi = (en: string, ru: string): Bi<string> => ({ en, ru });
export const biList = (en: string[], ru: string[]): Bi<string[]> => ({ en, ru });

export interface PracticeItem {
  q: Bi<string>;
  /**
   * number: checked numerically (1% tolerance, "," or "." as decimal mark);
   * string[]: any of these texts counts (case, spaces and punctuation ignored);
   * omitted: self-check, the student compares with the model answer.
   */
  answer?: number | string[];
  /** Shown after answering: the worked solution or the model answer. */
  explain: Bi<string>;
  /** Uzbek text of the question and of the solution (Russian is shown where this is missing). */
  uz?: { q: string; explain: string };
}

export interface Lesson {
  id: string;
  title: Bi<string> & { uz?: string };
  teach: Bi<string[]>;
  example: Bi<string>;
  practice: PracticeItem[];
  /** Pre-fills the Genius Lab when the student wants a deeper dive. */
  labTopic: Bi<string>;
  /** Uzbek explanation and example (Russian is shown where this is missing). */
  uz?: { teach: string[]; example: string };
}

export type ProgramKind = 'school' | 'exam';
export type ProgramIcon = 'calculator' | 'target' | 'pen' | 'atom' | 'flask' | 'code';

export interface Program {
  id: string;
  kind: ProgramKind;
  icon: ProgramIcon;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple';
  title: Record<ProgramLang, string>;
  summary: Record<ProgramLang, string>;
  audience: Record<ProgramLang, string>;
  lessons: Lesson[];
}

/** Lesson XP: the same for every lesson so the reward is predictable. */
export const LESSON_XP = 40;

const normalize = (s: string) => s.toLowerCase().replace(/[\s.,;:!?"'`´’()]+/g, '');

/** Pulls the first number out of text like "5 m/s" or "−3,5". */
export const parseNumber = (s: string): number | null => {
  let t = s.replace(/−/g, '-');
  // "30 000" and "30,000" are thousands; a lone "7,5" is a decimal comma.
  t = t.replace(/(\d)[\s ](?=\d{3}(?!\d))/g, '$1');
  t = /\d{1,3}(,\d{3})+(?!\d)/.test(t) ? t.replace(/,(?=\d{3})/g, '') : t.replace(',', '.');
  const m = t.match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
};

export type CheckResult = 'correct' | 'wrong' | 'self';

export const checkAnswer = (item: PracticeItem, input: string): CheckResult => {
  if (item.answer === undefined) return 'self';
  if (typeof item.answer === 'number') {
    const n = parseNumber(input);
    if (n === null) return 'wrong';
    const tol = Math.max(Math.abs(item.answer) * 0.01, 0.01);
    return Math.abs(n - item.answer) <= tol ? 'correct' : 'wrong';
  }
  const got = normalize(input);
  return got && item.answer.some((a) => normalize(a) === got) ? 'correct' : 'wrong';
};

/** What an Uzbek overlay file provides for one lesson. */
export interface UzOverlay {
  teach: string[];
  example: string;
  practice: { q: string; explain: string }[];
}

/** Returns the program with the Uzbek texts attached to its lessons (matched by lesson id). */
export function withUzbek(program: Program, overlay: Record<string, UzOverlay>): Program {
  return {
    ...program,
    lessons: program.lessons.map((lesson) => {
      const uz = overlay[lesson.id];
      if (!uz) return lesson;
      return {
        ...lesson,
        uz: { teach: uz.teach, example: uz.example },
        practice: lesson.practice.map((item, i) => (uz.practice[i] ? { ...item, uz: uz.practice[i] } : item)),
      };
    }),
  };
}
