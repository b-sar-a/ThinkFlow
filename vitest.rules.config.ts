import { defineConfig } from 'vitest/config';

// Firestore rules tests. They need the emulator, so they run through `npm run test:rules`
// (firebase emulators:exec starts it and sets FIRESTORE_EMULATOR_HOST), not through `npm test`.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
