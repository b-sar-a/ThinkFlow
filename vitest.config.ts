import { defineConfig } from 'vitest/config';

// Tests run in Node against the server modules and the plain data/logic files; the React app
// (and its Vite plugins) is not loaded here.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
