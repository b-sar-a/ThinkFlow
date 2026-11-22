import { describe, expect, it } from 'vitest';
import { PROGRAMS, checkAnswer, parseNumber } from '../src/data/programs';
import { levelInfo } from '../src/lib/progress';

describe('programs data', () => {
  it('has unique program and lesson ids', () => {
    const programIds = PROGRAMS.map((p) => p.id);
    expect(new Set(programIds).size).toBe(programIds.length);
    for (const p of PROGRAMS) {
      const lessonIds = p.lessons.map((l) => l.id);
      expect(new Set(lessonIds).size, p.id).toBe(lessonIds.length);
    }
  });

  it('writes every lesson in English and Russian, with practice', () => {
    for (const p of PROGRAMS) {
      for (const lang of ['en', 'ru', 'uz'] as const) {
        expect(p.title[lang], `${p.id} title ${lang}`).toBeTruthy();
        expect(p.summary[lang], `${p.id} summary ${lang}`).toBeTruthy();
        expect(p.audience[lang], `${p.id} audience ${lang}`).toBeTruthy();
      }
      for (const l of p.lessons) {
        const where = `${p.id}/${l.id}`;
        for (const lang of ['en', 'ru'] as const) {
          expect(l.title[lang], `${where} title ${lang}`).toBeTruthy();
          expect(l.teach[lang].length, `${where} teach ${lang}`).toBeGreaterThan(0);
          expect(l.example[lang], `${where} example ${lang}`).toBeTruthy();
          expect(l.labTopic[lang], `${where} labTopic ${lang}`).toBeTruthy();
        }
        expect(l.practice.length, `${where} practice`).toBeGreaterThan(0);
        for (const item of l.practice) {
          expect(item.q.en && item.q.ru && item.explain.en && item.explain.ru, `${where} practice text`).toBeTruthy();
        }
      }
    }
  });

  it('accepts the stored answer of every numeric and text item, and rejects a wrong one', () => {
    for (const p of PROGRAMS) {
      for (const l of p.lessons) {
        for (const item of l.practice) {
          if (typeof item.answer === 'number') {
            expect(checkAnswer(item, String(item.answer)), `${p.id}/${l.id}`).toBe('correct');
            expect(checkAnswer(item, String(item.answer + 1 + Math.abs(item.answer))), `${p.id}/${l.id}`).toBe('wrong');
          } else if (Array.isArray(item.answer)) {
            expect(checkAnswer(item, item.answer[0])).toBe('correct');
          } else {
            expect(checkAnswer(item, 'anything')).toBe('self');
          }
        }
      }
    }
  });
});

describe('parseNumber', () => {
  it.each([
    ['5 m/s', 5],
    ['7,5', 7.5],
    ['−3', -3],
    ['x = -3', -3],
    ['30 000', 30000],
    ['30,000', 30000],
    ['30000', 30000],
  ])('reads %s as %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it('returns null when there is no number', () => {
    expect(parseNumber('abc')).toBeNull();
  });
});

describe('levelInfo', () => {
  it('starts at level 1 and follows level L starts at 25·(L−1)² XP', () => {
    expect(levelInfo(0).level).toBe(1);
    expect(levelInfo(24).level).toBe(1);
    expect(levelInfo(25).level).toBe(2);
    expect(levelInfo(100).level).toBe(3);
    expect(levelInfo(1250).level).toBe(8);
  });
});
