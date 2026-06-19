import express from "express";
import cors from "cors";
import { runMigrations } from "./db/database.js";
import ocrRoutes from "./routes/ocr.js";
import historyRoutes from "./routes/history.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/ocr", ocrRoutes);
app.use("/api/history", historyRoutes);

runMigrations();

app.listen(PORT, () => {
  console.log(`[textractor-api] running on http://localhost:${PORT}`);
});

export default app;
