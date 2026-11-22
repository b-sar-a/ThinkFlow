import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import type { Server } from 'node:http';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildSync } from 'esbuild';
import express from 'express';
import { createApiRouter } from '../server/apiRouter';

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, '.tmp-boot');

describe('the API starts', () => {
  afterAll(() => fs.rmSync(outDir, { recursive: true, force: true }));

  // The live site once answered 500 on every route: a dependency (jose, via firebase-admin) became
  // ESM-only and the platform's Node could not require() it. Node 22.12+/24 can require(esm); older
  // ones cannot. So the server is compiled like the platform does (own code bundled, packages left
  // as they are) and started in plain Node with that feature switched off. tsx is deliberately NOT
  // used here: it patches require() and would hide exactly this kind of failure.
  it('loads on a Node that cannot require() ES modules', () => {
    fs.rmSync(outDir, { recursive: true, force: true });
    buildSync({
      entryPoints: [path.join(root, 'server/apiRouter.ts')],
      outfile: path.join(outDir, 'apiRouter.mjs'),
      bundle: true,
      platform: 'node',
      format: 'esm',
      packages: 'external',
      logLevel: 'silent',
    });

    const script = "import('./.tmp-boot/apiRouter.mjs').then(async (m) => { m.createApiRouter(); const a = await import('firebase-admin/auth'); a.getAuth; console.log('BOOT_OK'); }).catch((e) => { console.error(e.message); process.exit(1); })";
    const run = spawnSync(process.execPath, ['--no-experimental-require-module', '-e', script], { cwd: root, encoding: 'utf8', timeout: 60_000 });
    expect(run.stderr, run.stderr).not.toMatch(/require\(\) of ES Module/);
    expect(run.stdout, run.stderr).toContain('BOOT_OK');
  }, 70_000);

  it('can verify tokens without require(esm): the firebase-admin auth chain loads', () => {
    const script = "const { getAuth } = require('firebase-admin/auth'); require('firebase-admin/firestore'); require('firebase-admin/app'); console.log(typeof getAuth)";
    const run = spawnSync(process.execPath, ['--no-experimental-require-module', '-e', script], { cwd: root, encoding: 'utf8', timeout: 60_000 });
    expect(run.stderr, run.stderr).toBe('');
    expect(run.stdout.trim()).toBe('function');
  }, 70_000);

  describe('routes answer without Firebase or an AI key', () => {
    let server: Server;
    let base = '';

    beforeAll(async () => {
      const app = express();
      app.use(createApiRouter());
      await new Promise<void>((resolve) => {
        server = app.listen(0, '127.0.0.1', resolve);
      });
      const address = server.address();
      base = `http://127.0.0.1:${typeof address === 'object' && address ? address.port : 0}`;
    });

    afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

    it('health reports what is configured, and the Node version', async () => {
      const body = await (await fetch(`${base}/api/health`)).json();
      expect(body).toMatchObject({ status: 'ok', node: process.version });
      expect(typeof body.aiKeyLoaded).toBe('boolean');
      expect(typeof body.quotaEnforced).toBe('boolean');
    });

    it('accepts an analytics event from a visitor (204) and rejects junk quietly', async () => {
      const good = await fetch(`${base}/api/track`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'landing_view', anonId: 'probe-0000-aaaa' }) });
      expect(good.status).toBe(204);
      const junk = await fetch(`${base}/api/track`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"name":"nope"}' });
      expect(junk.status).toBe(204);
    });

    it.each([
      ['/api/ai/chat'],
      ['/api/family/code'],
      ['/api/class/list'],
      ['/api/account/delete'],
      ['/api/admin/funnel'],
    ])('%s needs a signed-in user', async (route) => {
      const response = await fetch(`${base}${route}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'AUTH_REQUIRED' });
    });
  });
});
