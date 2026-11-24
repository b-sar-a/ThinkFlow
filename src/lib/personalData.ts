export type PersonalKind = 'phone' | 'email' | 'handle' | 'messenger' | 'secret';

/**
 * Looks for contact details and secrets in a text a student is about to post or send.
 * It is only a nudge ("are you sure?"): it never blocks, and it can be wrong in both directions.
 */
export function detectPersonalData(text: string): PersonalKind[] {
  const found: PersonalKind[] = [];
  if (!text) return found;

  // A run of 9 to 13 digits with spaces, dashes or brackets between them; "3.14159" and dates have dots between digits.
  const runs: string[] = text.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [];
  if (runs.some((run) => !/\d\.\d/.test(run) && run.replace(/\D/g, '').length >= 9 && run.replace(/\D/g, '').length <= 13)) {
    found.push('phone');
  }
  if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text)) found.push('email');
  if (/(^|[\s(])@[A-Za-z0-9_.]{4,}/.test(text)) found.push('handle');
  if (/\b(?:t\.me|wa\.me|instagram\.com|tiktok\.com|snapchat\.com|discord\.(?:gg|com)|facebook\.com|vk\.com)\b/i.test(text)) found.push('messenger');
  if (/(?:password|passcode|parol|пароль)\s*(?:is\s+|[:=\-—]\s*)\S{3,}/i.test(text)) found.push('secret');
  return found;
}
