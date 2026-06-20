import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./db/database.js";
import ocrRoutes from "./routes/ocr.js";
import historyRoutes from "./routes/history.js";
import configRoutes from "./routes/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app: Express = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/ocr", ocrRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/config", configRoutes);

runMigrations();

app.listen(PORT, () => {
  console.log(`[textractor-api] running on http://127.0.0.1:${PORT}`);
});

export default app;
