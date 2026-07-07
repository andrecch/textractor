import { Router } from "express";
import {
  callNvidiaBuildVision,
  validateNvidiaBuildKey,
} from "../services/nvidiaBuild.js";
import { getCachedOcr, setCachedOcr } from "../services/ocrCache.js";

const router = Router();

router.post("/extract", async (req, res) => {
  try {
    const { imageBase64, apiKey } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const cached = getCachedOcr(imageBase64);
    if (cached) {
      res.json({ text: cached, provider: "nvidia-build", cached: true });
      return;
    }

    const abortController = new AbortController();
    req.on("close", () => abortController.abort());

    const text = await callNvidiaBuildVision(imageBase64, apiKey, abortController.signal);

    if (text) {
      setCachedOcr(imageBase64, text);
    }

    res.json({ text, provider: "nvidia-build" });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return;
    }
    const message = err instanceof Error ? err.message : "OCR failed";
    res.status(500).json({ error: message });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      res.status(400).json({ error: "apiKey is required" });
      return;
    }

    const result = await validateNvidiaBuildKey(apiKey);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation failed";
    res.status(500).json({ valid: false, error: message });
  }
});

export default router;
