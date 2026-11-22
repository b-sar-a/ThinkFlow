import express from "express";
import path from "path";
import cors from "cors";
import * as dotenv from "dotenv";
import { createApiRouter } from "./server/apiRouter.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Same-origin by default. Set ALLOWED_ORIGINS=https://a.com,https://b.com to allow others.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
if (allowedOrigins.length) app.use(cors({ origin: allowedOrigins }));

app.use(createApiRouter());

// Important for Vercel: Export the app
export default app;

if (process.env.NODE_ENV !== "production") {
  // Dynamic import so 'vite' is not bundled in production
  import("vite")
    .then(async (viteModule) => {
      const vite = await viteModule.createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`[SERVER] Dev running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Failed to load Vite:", err);
    });
} else if (!process.env.VERCEL) {
  // Production server but NOT on Vercel
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Production listening on port ${PORT}`);
  });
}
