import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { errorHandler } from "./middlewares/errorHandler";
import { logger } from "./middlewares/logger";
import { notFound } from "./middlewares/notFound";
import { requestId } from "./middlewares/requestId";
import metasRoutes from "./routes/metas.routes";
import partidasRoutes from "./routes/partidas.routes";
import videojuegosRoutes from "./routes/videojuegos.routes";

export const app = express();

app.disable("x-powered-by");
app.use(requestId);
app.use(logger);
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    exposedHeaders: ["X-Request-Id"],
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, servicio: "diario-gamer-api" });
});

app.use("/api/videojuegos", videojuegosRoutes);
app.use("/api/partidas", partidasRoutes);
app.use("/api/metas", metasRoutes);

app.use(notFound);
app.use(errorHandler);
