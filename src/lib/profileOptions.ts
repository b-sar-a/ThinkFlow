import type { Language } from '../types';

/** Stored values stay English (they go into AI prompts); labels are shown in the UI language. */

export const GRADES = ['Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'University'] as const;
export type Grade = (typeof GRADES)[number];

export const GOALS = ['grades', 'exams', 'olympiad', 'curiosity'] as const;
export type Goal = (typeof GOALS)[number];

export const MAX_INTERESTS = 8; // the server reads at most 8 interests

export const GRADE_LABEL: Record<Language, Record<Grade, string>> = {
  ru: { 'Grade 5': '5 класс', 'Grade 6': '6 класс', 'Grade 7': '7 класс', 'Grade 8': '8 класс', 'Grade 9': '9 класс', 'Grade 10': '10 класс', 'Grade 11': '11 класс', University: 'Колледж / вуз' },
  en: { 'Grade 5': 'Grade 5', 'Grade 6': 'Grade 6', 'Grade 7': 'Grade 7', 'Grade 8': 'Grade 8', 'Grade 9': 'Grade 9', 'Grade 10': 'Grade 10', 'Grade 11': 'Grade 11', University: 'College / university' },
  uz: { 'Grade 5': '5-sinf', 'Grade 6': '6-sinf', 'Grade 7': '7-sinf', 'Grade 8': '8-sinf', 'Grade 9': '9-sinf', 'Grade 10': '10-sinf', 'Grade 11': '11-sinf', University: 'Kollej / universitet' },
};

export const GOAL_LABEL: Record<Language, Record<Goal, string>> = {
  ru: { grades: 'Подтянуть оценки', exams: 'Подготовиться к экзаменам', olympiad: 'Олимпиады и конкурсы', curiosity: 'Просто интересно' },
  en: { grades: 'Raise my grades', exams: 'Prepare for exams', olympiad: 'Olympiads & contests', curiosity: 'Just curious' },
  uz: { grades: 'Baholarni yaxshilash', exams: 'Imtihonlarga tayyorlanish', olympiad: 'Olimpiada va tanlovlar', curiosity: 'Shunchaki qiziq' },
};

export const INTEREST_LABEL: Record<Language, Record<string, string>> = {
  ru: { Sports: 'Спорт', Football: 'Футбол', Chess: 'Шахматы', Anime: 'Аниме', Music: 'Музыка', Design: 'Дизайн', Coding: 'Программирование', Cooking: 'Кулинария', Cars: 'Машины', Business: 'Бизнес', Gaming: 'Игры', Movies: 'Кино', Art: 'Искусство', Fitness: 'Фитнес', Science: 'Наука' },
  en: {},
  uz: { Sports: 'Sport', Football: 'Futbol', Chess: 'Shaxmat', Anime: 'Anime', Music: 'Musiqa', Design: 'Dizayn', Coding: 'Dasturlash', Cooking: 'Pazandachilik', Cars: 'Mashinalar', Business: 'Biznes', Gaming: 'O‘yinlar', Movies: 'Kino', Art: 'San’at', Fitness: 'Fitnes', Science: 'Fan' },
};

export const interestLabel = (language: Language, value: string) => INTEREST_LABEL[language][value] ?? value;
