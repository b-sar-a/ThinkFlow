import express from "express";
import cors from "cors";
import { createApiRouter } from "../server/apiRouter.js";

// Vercel serverless entry. All routes live in server/apiRouter.ts (shared with server.ts).
const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
if (allowedOrigins.length) app.use(cors({ origin: allowedOrigins }));

app.use(createApiRouter());

export default app;
