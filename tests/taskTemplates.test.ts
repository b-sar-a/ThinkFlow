import { describe, expect, it } from 'vitest';
import { TEMPLATES, knownAnswer } from '../src/data/taskTemplates';
import { bi, checkAnswer } from '../src/data/programs';

// The seven problems in the order they appear in every language, with the answer worked out here.
const WORKED = [150 / 30, (45 - 15) / 3, 10 / 2, 3.14 * 5 * 5, 2 * 1 + 16, 5 + 8, 500 / 10];
const item = (answer: number) => ({ q: bi('', ''), explain: bi('', ''), answer });

describe('daily task templates', () => {
  it('have the same seven problems with the same answers in every language', () => {
    for (const lang of ['en', 'ru', 'uz'] as const) {
      expect(TEMPLATES[lang].map((t) => t.answer), lang).toEqual(WORKED);
      for (const t of TEMPLATES[lang]) {
        expect(t.title.trim().length, `${lang} title`).toBeGreaterThan(3);
        expect(t.desc.trim().length, `${lang} ${t.title}`).toBeGreaterThan(20);
        expect(t.xp).toBeGreaterThan(0);
      }
    }
  });

  it('keep the numbers of the English problem in the other languages', () => {
    const numbers = (s: string) => (s.match(/\d+([.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort();
    TEMPLATES.en.forEach((en, i) => {
      for (const lang of ['ru', 'uz'] as const) {
        expect(numbers(TEMPLATES[lang][i].desc), `${lang} ${en.title}`).toEqual(numbers(en.desc));
      }
    });
  });

  it('have titles that are unique, so a stored task can be matched to its answer', () => {
    const titles = Object.values(TEMPLATES).flatMap((list) => list.map((t) => t.title));
    expect(new Set(titles).size).toBe(titles.length);
    for (const lang of ['en', 'ru', 'uz'] as const) {
      TEMPLATES[lang].forEach((t, i) => expect(knownAnswer(t.title)).toBe(WORKED[i]));
    }
    expect(knownAnswer('A task from the AI that is not built in')).toBeNull();
  });

  it('are checked with decimal commas and units, and wrong answers are rejected', () => {
    const area = item(knownAnswer(TEMPLATES.en[3].title)!);
    expect(checkAnswer(area, '78,5')).toBe('correct');
    expect(checkAnswer(area, '78.5 m²')).toBe('correct');
    expect(checkAnswer(area, '25')).toBe('wrong');
    expect(checkAnswer(item(5), '5 m/s')).toBe('correct');
    expect(checkAnswer(item(5), '6')).toBe('wrong');
    expect(checkAnswer(item(5), 'five')).toBe('wrong');
  });
});
