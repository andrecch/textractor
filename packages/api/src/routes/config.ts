import { Router } from "express";

const router = Router();

router.get("/api-key", (_req, res) => {
  const apiKey = process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    res.json({ hasKey: false, preview: "" });
    return;
  }

  const preview = apiKey.substring(0, 15) + "***";
  res.json({ hasKey: true, preview });
});

export default router;
