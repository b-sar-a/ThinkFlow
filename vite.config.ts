import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Link previews (Telegram, WhatsApp, social networks) need absolute URLs. Set SITE_URL in Vercel when
// the site gets its own domain; until then the current Vercel address is used.
const SITE_URL = (process.env.SITE_URL || 'https://mussthinkflow.vercel.app').replace(/[/]+$/, '');

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      { name: 'site-url', transformIndexHtml: (html: string) => html.split('__SITE_URL__').join(SITE_URL) },
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          // Big libraries get their own files: the browser caches them between deploys and loads
          // them in parallel, instead of one 970 kB bundle that changes with every release.
          manualChunks(id: string) {
            if (!id.includes('/node_modules/')) return undefined;
            const inPackage = (...names: string[]) => names.some((name) => id.includes(`/node_modules/${name}/`));
            if (inPackage('@firebase', 'firebase')) return 'firebase';
            if (inPackage('framer-motion', 'motion', 'motion-dom', 'motion-utils')) return 'motion';
            if (inPackage('lucide-react')) return 'icons';
            if (inPackage('react', 'react-dom', 'scheduler')) return 'react';
            return undefined;
          },
        },
      },
    },
  };
});
