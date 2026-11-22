# ThinkFlow

AI tutor for school students (Russian, English, Uzbek). React + Vite on the front, an Express API (also served as a Vercel function), Firebase (Auth, Firestore) and Gemini.

## Run it locally

```bash
npm ci
cp .env.example .env   # then fill in the values below
npm run dev            # http://localhost:3000
```

Environment variables (see `.env.example`):

| Variable | What it does |
| --- | --- |
| `GEMINI_API_KEY` | The AI. Without it the AI routes answer with an error. |
| `FIREBASE_SERVICE_ACCOUNT` | Service-account JSON (one line or base64). Needed for everything the server does with Firestore: token quota, promo codes, invites, parent access, the teacher cabinet, analytics, account deletion. Without it those routes answer `*_UNAVAILABLE`. |

## Checks

```bash
npm run lint    # TypeScript (tsc --noEmit)
npm test        # unit tests (vitest)
npm run build   # production build
npm run check   # all three
```

The same three run on every pull request in GitHub Actions (`.github/workflows/ci.yml`).

Tests live in `tests/`. The server modules are tested against a small in-memory fake of the Firestore Admin API (`tests/helpers/fakeDb.ts`), so no Firebase project is needed. The fake runs the logic; it does not prove the real Firestore behaves the same, so the flows that need `FIREBASE_SERVICE_ACCOUNT` should still be tried once on a test account after a deploy.

## Launch

The step-by-step launch checklist (server keys, Firestore rules and index, admin account, a manual test run) is in [docs/LAUNCH.md](docs/LAUNCH.md). What is on and off right now is shown in Admin > Status.

## Layout

- `src/` the React app (`components/Dashboard` for screens, `data/programs` for the lessons, `lib` and `services` for helpers).
- `server/` the API: `apiRouter.ts` (all routes), plus `family.ts`, `classes.ts`, `analytics.ts`, `accountDeletion.ts`. Collections used only by the server are closed to clients in `firestore.rules`.
- `api/index.ts` the Vercel entry point; `server.ts` the local dev server.

## Adding a program

Write a file in `src/data/programs/` (see `algebra.ts`), add it to `PROGRAMS` in `index.ts`. `tests/programs.test.ts` checks that every lesson has English and Russian text and that every stored answer is accepted by the checker.
