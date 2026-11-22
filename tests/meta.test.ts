import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

/** Reads width and height from the first JPEG "start of frame" marker. */
function jpegSize(file: string) {
  const b = fs.readFileSync(file);
  expect(b[0]).toBe(0xff);
  expect(b[1]).toBe(0xd8);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) throw new Error('not a JPEG');
    const marker = b[i + 1];
    const length = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7), bytes: b.length };
    }
    i += 2 + length;
  }
  throw new Error('no size found');
}

describe('link preview (Telegram, WhatsApp, social networks)', () => {
  it('has the tags a preview needs, with absolute URLs filled in at build time', () => {
    for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
      expect(html, tag).toContain(tag);
    }
    expect(html).toContain('content="summary_large_image"');
    expect(html).toContain('property="og:image" content="__SITE_URL__/og.jpg"');
  });

  it('points at an image that exists, is a JPEG of 1200x630 and stays small', () => {
    const { width, height, bytes } = jpegSize(path.join(root, 'public/og.jpg'));
    expect({ width, height }).toEqual({ width: 1200, height: 630 });
    expect(bytes).toBeLessThan(300_000); // some apps ignore larger preview images
  });
});
