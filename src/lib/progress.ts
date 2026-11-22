/**
 * One level formula for the whole app. It is the same one the Genius Lab uses when it
 * awards XP: level L starts at 25 * (L - 1)^2 XP (level 2 at 25, level 3 at 100, level 8 at 1225).
 */
export function levelInfo(xp: number) {
  const total = Math.max(0, Math.floor(xp || 0));
  const level = Math.floor(Math.sqrt(total) / 5) + 1;
  const start = 25 * (level - 1) ** 2;
  const next = 25 * level ** 2;
  const span = next - start;
  return {
    level,
    total,
    into: total - start,
    span,
    remaining: next - total,
    percent: Math.min(100, ((total - start) / span) * 100),
  };
}
