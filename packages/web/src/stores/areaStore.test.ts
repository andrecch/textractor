import { describe, it, expect, beforeEach } from "vitest";
import { useAreaStore } from "./areaStore";
import { clearAllImages, setAreaImage, getAreaImage } from "./imageStore";
import type { Area } from "@/types/area";

function makeArea(overrides: Partial<Area> = {}): Area {
  const now = new Date().toISOString();
  return {
    id: "area-1",
    name: "Area 1",
    documentName: "doc.pdf",
    pageIndex: 0,
    zone: { x: 0, y: 0, width: 100, height: 100 },
    extractedText: null,
    status: "zone-defined",
    errorMessage: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function seedArea(area: Area): void {
  useAreaStore.setState({
    areas: [area],
    activeAreaId: area.id,
    areaCounter: 1,
  });
}

describe("areaStore", () => {
  beforeEach(() => {
    clearAllImages();
    useAreaStore.setState({
      areas: [],
      activeAreaId: null,
      areaCounter: 0,
      autoExtractPendingId: null,
    });
  });

  describe("updateAreaExtractedText", () => {
    it("writes the extracted text", () => {
      seedArea(makeArea());
      useAreaStore.getState().updateAreaExtractedText("area-1", "Hello");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.extractedText).toBe("Hello");
    });

    it("does NOT mutate the status (data-only setter)", () => {
      seedArea(makeArea({ status: "processing" }));
      useAreaStore.getState().updateAreaExtractedText("area-1", "Hello");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.status).toBe("processing");
    });

    it("preserves any existing errorMessage (data-only setter)", () => {
      seedArea(makeArea({ status: "error", errorMessage: "boom" }));
      useAreaStore.getState().updateAreaExtractedText("area-1", "Hello");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.status).toBe("error");
      expect(area.errorMessage).toBe("boom");
    });

    it("updates the updatedAt timestamp", () => {
      const old = "2020-01-01T00:00:00.000Z";
      seedArea(makeArea({ updatedAt: old }));
      useAreaStore.getState().updateAreaExtractedText("area-1", "Hello");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.updatedAt).not.toBe(old);
    });
  });

  describe("updateAreaStatus", () => {
    it("transitions to 'extracted' and clears the error message", () => {
      seedArea(makeArea({ status: "processing", errorMessage: "old" }));
      useAreaStore.getState().updateAreaStatus("area-1", "extracted");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.status).toBe("extracted");
      expect(area.errorMessage).toBeNull();
    });

    it("stores the provided error message", () => {
      seedArea(makeArea({ status: "processing" }));
      useAreaStore.getState().updateAreaStatus("area-1", "error", "boom");
      const area = useAreaStore.getState().areas[0]!;
      expect(area.status).toBe("error");
      expect(area.errorMessage).toBe("boom");
    });
  });

  describe("imageStore integration", () => {
    it("setAreaCroppedImageProcessed stores an image retrievable by getAreaImage", () => {
      seedArea(makeArea());
      useAreaStore.getState().setAreaCroppedImageProcessed("area-1", "data:image/png;base64,AAA");
      expect(getAreaImage("area-1", "processed")).toBe("data:image/png;base64,AAA");
    });

    it("removeArea clears the area images", () => {
      seedArea(makeArea());
      setAreaImage("area-1", "raw", "data:image/png;base64,RAW");
      setAreaImage("area-1", "processed", "data:image/png;base64,PROC");
      useAreaStore.getState().removeArea("area-1");
      expect(getAreaImage("area-1", "raw")).toBeNull();
      expect(getAreaImage("area-1", "processed")).toBeNull();
    });
  });

  describe("auto extract queue", () => {
    const newZone = { x: 5, y: 5, width: 50, height: 50 };

    it("updateAreaZone queues the area and clears stale crops", () => {
      seedArea(makeArea());
      setAreaImage("area-1", "raw", "data:image/png;base64,RAW");
      setAreaImage("area-1", "processed", "data:image/png;base64,PROC");
      useAreaStore.getState().updateAreaZone("area-1", 0, newZone);
      expect(useAreaStore.getState().autoExtractPendingId).toBe("area-1");
      expect(getAreaImage("area-1", "raw")).toBeNull();
      expect(getAreaImage("area-1", "processed")).toBeNull();
    });

    it("consumeAutoExtract is id-matched and one-shot", () => {
      seedArea(makeArea());
      useAreaStore.getState().updateAreaZone("area-1", 0, newZone);
      expect(useAreaStore.getState().consumeAutoExtract("area-2")).toBe(false);
      expect(useAreaStore.getState().consumeAutoExtract("area-1")).toBe(true);
      expect(useAreaStore.getState().consumeAutoExtract("area-1")).toBe(false);
    });

    it("removeArea unqueues a pending extraction", () => {
      seedArea(makeArea());
      useAreaStore.getState().updateAreaZone("area-1", 0, newZone);
      useAreaStore.getState().removeArea("area-1");
      expect(useAreaStore.getState().autoExtractPendingId).toBeNull();
    });
  });
});
