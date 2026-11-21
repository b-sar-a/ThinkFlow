export const VIEWS = [
  'genius_lab',
  'tasks',
  'progress',
  'community',
  'messages',
  'articles',
  'tips',
  'reviews',
  'leaderboard',
  'profile',
  'settings',
  'admin',
] as const;

export type ViewId = (typeof VIEWS)[number];

// Readable URLs: /#/lab, /#/bonuses ...
const SLUG: Record<ViewId, string> = {
  genius_lab: 'lab',
  tasks: 'tasks',
  progress: 'progress',
  community: 'community',
  messages: 'messages',
  articles: 'articles',
  tips: 'tips',
  reviews: 'reviews',
  leaderboard: 'bonuses',
  profile: 'profile',
  settings: 'settings',
  admin: 'admin',
};

export const hashFor = (view: ViewId) => `#/${SLUG[view]}`;

export function viewFromHash(hash: string): ViewId | null {
  const slug = hash.replace(/^#\/?/, '');
  return (VIEWS.find((view) => SLUG[view] === slug) as ViewId | undefined) ?? null;
}
