import { describe, expect, it } from 'vitest';
import { detectPersonalData } from '../src/lib/personalData';

describe('detectPersonalData', () => {
  it('finds phone numbers written in common ways', () => {
    for (const text of ['call me +998 90 123 45 67', 'my number is 90-123-45-67', 'tel (90) 123 45 67', '998901234567', 'Позвони +7 (999) 123-45-67']) {
      expect(detectPersonalData(text), text).toContain('phone');
    }
  });

  it('does not mistake maths, years and dates for phone numbers', () => {
    for (const text of ['pi is 3.14159265358979', 'in 1991 and 2024', 'the date 12.03.2024 10:30', 'x = 150 and y = 30', '2 + 3 = 5', 'ответ 78,5 метров']) {
      expect(detectPersonalData(text), text).not.toContain('phone');
    }
  });

  it('finds emails, handles and messenger links', () => {
    expect(detectPersonalData('write to ali@example.com')).toEqual(['email']);
    expect(detectPersonalData('add me @ali_2010 please')).toEqual(['handle']);
    expect(detectPersonalData('my insta: instagram.com/ali')).toContain('messenger');
    expect(detectPersonalData('join t.me/class9')).toContain('messenger');
  });

  it('finds a password that is written out, not the word alone', () => {
    expect(detectPersonalData('my password is hunter22')).toContain('secret');
    expect(detectPersonalData('пароль: qwerty123')).toContain('secret');
    expect(detectPersonalData('parol=abc123')).toContain('secret');
    expect(detectPersonalData('a strong password should be long')).toEqual([]);
  });

  it('leaves normal school talk alone', () => {
    for (const text of ['Can you explain quadratic equations?', 'Что такое моль?', 'Bugun fizika darsi qiziq edi', 'I solved 12 problems in 45 minutes', '']) {
      expect(detectPersonalData(text), text).toEqual([]);
    }
  });
});
