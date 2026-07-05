import { Router } from "express";
import { getDatabase } from "../db/database.js";
import type { ExtractionRow } from "../types/index.js";

const router = Router();

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

function mapRow(row: ExtractionRow) {
  return {
    id: row.id,
    documentName: row.document_name,
    sectionName: row.section_name,
    pageIndex: row.page_index,
    zone: {
      x: row.zone_x,
      y: row.zone_y,
      width: row.zone_width,
      height: row.zone_height,
    },
    extractedText: row.extracted_text,
    provider: row.provider,
    createdAt: row.created_at,
  };
}

router.get("/", (req, res) => {
  try {
    const db = getDatabase();

    const wantPaged = req.query.paged === "true" || req.query.paged === "1";

    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(
        1,
        Number.parseInt(String(req.query.limit ?? DEFAULT_PAGE_SIZE), 10) ||
          DEFAULT_PAGE_SIZE
      )
    );
    const offset = Math.max(
      0,
      Number.parseInt(String(req.query.offset ?? 0), 10) || 0
    );

    const rows = db
      .prepare(
        "SELECT * FROM extractions ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?"
      )
      .all(limit, offset) as ExtractionRow[];

    const records = rows.map(mapRow);

    if (!wantPaged) {
      res.json(records);
      return;
    }

    const totalRow = db
      .prepare("SELECT COUNT(*) as count FROM extractions")
      .get() as { count: number };

    res.json({
      records,
      total: totalRow.count,
      limit,
      offset,
      hasMore: offset + records.length < totalRow.count,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    res.status(500).json({ error: message });
  }
});

router.post("/", (req, res) => {
  try {
    const { documentName, sectionName, pageIndex, zone, extractedText, provider } =
      req.body;

    if (!documentName || !extractedText) {
      res.status(400).json({ error: "documentName and extractedText required" });
      return;
    }

    const db = getDatabase();
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO extractions (id, document_name, section_name, page_index, zone_x, zone_y, zone_width, zone_height, extracted_text, provider)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      documentName,
      sectionName ?? "Unknown",
      pageIndex ?? 0,
      zone?.x ?? 0,
      zone?.y ?? 0,
      zone?.width ?? 0,
      zone?.height ?? 0,
      extractedText,
      provider ?? "unknown"
    );

    res.status(201).json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save";
    res.status(500).json({ error: message });
  }
});

router.delete("/", (_req, res) => {
  try {
    const db = getDatabase();
    db.prepare("DELETE FROM extractions").run();
    res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to clear";
    res.status(500).json({ error: message });
  }
});

export default router;
