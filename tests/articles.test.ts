import { describe, expect, it } from 'vitest';
import { LEARNING_ARTICLES } from '../src/data/articles';
import { ARTICLES_UZ } from '../src/data/articlesUz';

// Centuries are "18th" in English and "XVIII" in Uzbek, so ordinals are left out of the comparison.
const numbers = (s: string) =>
  (s.replace(/−/g, '-').replace(/\b\d+(st|nd|rd|th)\b/g, '').match(/\d+([.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort();

describe('learning articles', () => {
  it('have English and Russian text with the same number of paragraphs', () => {
    for (const a of LEARNING_ARTICLES) {
      expect(a.en.body.length, a.id).toBe(a.ru.body.length);
      expect(a.en.body.length, a.id).toBeGreaterThanOrEqual(3);
      for (const lang of ['en', 'ru', 'uz'] as const) {
        expect(a[lang].title.trim().length, `${a.id} ${lang} title`).toBeGreaterThan(5);
        expect(a[lang].summary.trim().length, `${a.id} ${lang} summary`).toBeGreaterThan(15);
      }
    }
  });

  it('have a full Uzbek text for every article, paragraph for paragraph', () => {
    expect(Object.keys(ARTICLES_UZ).sort()).toEqual(LEARNING_ARTICLES.map((a) => a.id).sort());
    for (const a of LEARNING_ARTICLES) {
      const uz = ARTICLES_UZ[a.id];
      expect(uz.body.length, a.id).toBe(a.en.body.length);
      expect(uz.body.every((p) => p.trim().length > 40), a.id).toBe(true);
      expect(uz.tryIt.question.trim().length, a.id).toBeGreaterThan(15);
      expect(uz.tryIt.answer.trim().length, a.id).toBeGreaterThan(15);
    }
  });

  it('keep the numbers of the English worked examples and exercises in Uzbek', () => {
    for (const a of LEARNING_ARTICLES) {
      const uz = ARTICLES_UZ[a.id];
      expect(numbers(uz.body.join(' ')), `${a.id} body`).toEqual(numbers(a.en.body.join(' ')));
      expect(numbers(uz.tryIt.question), `${a.id} question`).toEqual(numbers(a.en.tryIt.question));
      expect(numbers(uz.tryIt.answer), `${a.id} answer`).toEqual(numbers(a.en.tryIt.answer));
    }
  });
});
