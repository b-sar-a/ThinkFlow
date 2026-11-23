import { describe, expect, it } from 'vitest';
import { LAB_PRESETS, presetTree } from '../src/data/labPresets';

const LANGS = ['en', 'ru', 'uz'] as const;
const numbers = (s: string) => (s.replace(/−/g, '-').match(/\d+([.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.')).sort();

describe('Genius Lab ready-made courses', () => {
  it('have every text in English, Russian and Uzbek', () => {
    expect(LAB_PRESETS.length).toBeGreaterThan(0);
    for (const p of LAB_PRESETS) {
      for (const lang of LANGS) expect(p.title[lang].trim().length, `${p.id} title ${lang}`).toBeGreaterThan(3);
      for (const n of p.nodes) {
        for (const lang of LANGS) {
          for (const field of ['label', 'description', 'metaphor', 'challenge'] as const) {
            expect(n[field][lang].trim().length, `${p.id}/${n.id} ${field} ${lang}`).toBeGreaterThan(3);
          }
        }
      }
    }
  });

  it('keep the numbers of the original challenge in every language', () => {
    for (const p of LAB_PRESETS) {
      for (const n of p.nodes) {
        for (const lang of ['ru', 'uz'] as const) {
          expect(numbers(n.challenge[lang]), `${p.id}/${n.id} ${lang}`).toEqual(numbers(n.challenge.en));
        }
      }
    }
  });

  it('build a connected tree in each language', () => {
    for (const p of LAB_PRESETS) {
      for (const lang of LANGS) {
        const tree = presetTree(p, lang);
        expect(tree.nodes).toHaveLength(p.nodes.length);
        expect(tree.connections).toHaveLength(p.nodes.length - 1);
        const ids = new Set(tree.nodes.map((n) => n.id));
        expect(ids.size).toBe(tree.nodes.length);
        for (const c of tree.connections) {
          expect(ids.has(c.from) && ids.has(c.to)).toBe(true);
        }
        expect(tree.nodes.every((n) => n.completed === false)).toBe(true);
      }
    }
  });

  it('have unique ids', () => {
    const ids = LAB_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
