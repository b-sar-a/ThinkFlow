import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Vercel serverless entry. All routes live in server/apiRouter.ts (shared with server.ts).
 *
 * The app is loaded on the first request instead of when the file is imported. If loading fails
 * (a missing module, a bad import), the request gets a JSON answer that says so and the cause is
 * written to the function log, instead of Vercel's opaque FUNCTION_INVOCATION_FAILED page.
 */
type Handler = (req: IncomingMessage, res: ServerResponse) => unknown;

let loading: Promise<Handler> | null = null;

async function loadApp(): Promise<Handler> {
  const [{ default: express }, { default: cors }, { createApiRouter }] = await Promise.all([
    import("express"),
    import("cors"),
    import("../server/apiRouter.js"),
  ]);

  const app = express();
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
  if (allowedOrigins.length) app.use(cors({ origin: allowedOrigins }));
  app.use(createApiRouter());
  return app as unknown as Handler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    loading ??= loadApp();
    const app = await loading;
    app(req, res);
  } catch (error) {
    loading = null; // try again on the next request
    console.error("[API] could not start:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "API_START_FAILED", node: process.version, detail: String((error as Error)?.message ?? error).slice(0, 400) }));
  }
}
