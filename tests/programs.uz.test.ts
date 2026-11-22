import { describe, expect, it } from 'vitest';
import { PROGRAMS } from '../src/data/programs';

describe('Uzbek lesson texts', () => {
  it('cover every lesson, with the same number of paragraphs-to-practice items as the original', () => {
    for (const program of PROGRAMS) {
      for (const lesson of program.lessons) {
        const where = `${program.id}/${lesson.id}`;
        expect(lesson.uz, `${where} has no Uzbek text`).toBeTruthy();
        expect(lesson.uz!.teach.length, `${where} teach`).toBe(lesson.teach.en.length);
        expect(lesson.uz!.teach.every((p) => p.trim().length > 20), `${where} teach text`).toBe(true);
        expect(lesson.uz!.example.trim().length, `${where} example`).toBeGreaterThan(10);
        for (const [i, item] of lesson.practice.entries()) {
          expect(item.uz, `${where} practice ${i + 1}`).toBeTruthy();
          expect(item.uz!.q.trim().length, `${where} practice ${i + 1} question`).toBeGreaterThan(5);
          expect(item.uz!.explain.trim().length, `${where} practice ${i + 1} solution`).toBeGreaterThan(3);
        }
      }
    }
  });

  it('keeps the numbers of the original (an Uzbek question never changes the task)', () => {
    const numbers = (s: string) => (s.replace(/−/g, '-').match(/-?\d+([.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort();
    for (const program of PROGRAMS) {
      for (const lesson of program.lessons) {
        for (const [i, item] of lesson.practice.entries()) {
          if (!item.uz) continue;
          // The Russian and English questions share their numbers; Uzbek must too.
          expect(numbers(item.uz.q), `${program.id}/${lesson.id} question ${i + 1}`).toEqual(numbers(item.q.en));
        }
      }
    }
  });
});
