import { Router } from "express";
import {
  setUserApiKey,
  clearUserApiKey,
  getApiKeySource,
  getApiKeyHint,
} from "../services/settingsStore.js";

const router = Router();

router.get("/api-key", (_req, res) => {
  const source = getApiKeySource();
  const hasKey = source !== "none";
  const keyHint = hasKey ? getApiKeyHint() : null;
  res.json({ hasKey, source, keyHint });
});

router.post("/api-key", (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
    res.status(400).json({ error: "apiKey is required" });
    return;
  }
  setUserApiKey(apiKey.trim());
  res.json({ success: true });
});

router.delete("/api-key", (_req, res) => {
  clearUserApiKey();
  res.json({ success: true });
});

export default router;
