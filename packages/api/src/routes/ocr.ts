import { Router } from "express";
import {
  callNvidiaBuildVision,
  validateNvidiaBuildKey,
} from "../services/nvidiaBuild.js";
import { getCachedOcr, setCachedOcr } from "../services/ocrCache.js";

const router = Router();
const DEBUG_OCR = true;

router.post("/extract", async (req, res) => {
  const tRouteStart = performance.now();
  const { imageBase64, apiKey } = req.body;
  if (DEBUG_OCR) {
    const sizeKB = imageBase64 ? (new Blob([imageBase64]).size / 1024).toFixed(1) : "0";
    console.log(`[OCR-API] /extract received, image size: ${sizeKB} KB`);
  }

  try {
    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const cached = getCachedOcr(imageBase64);
    if (cached) {
      if (DEBUG_OCR) console.log(`[OCR-API] Cache hit, returning immediately`);
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
      if (DEBUG_OCR) console.log(`[OCR-API] Request aborted by client`);
      return;
    }
    if (DEBUG_OCR) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.log(`[OCR-API] Error: ${errMsg}`);
    }
    const message = err instanceof Error ? err.message : "OCR failed";
    res.status(500).json({ error: message });
  } finally {
    if (DEBUG_OCR) {
      const totalMs = performance.now() - tRouteStart;
      console.log(`[OCR-API] /extract finished in ${(totalMs / 1000).toFixed(1)}s`);
    }
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
