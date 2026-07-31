import { describe, it, expect, beforeEach, vi } from "vitest";
import { runExtraction, type ExtractionDeps, type ExtractionOutcome } from "./useOCR";
import { useAreaStore } from "@/stores/areaStore";
import { useOCRStore } from "@/stores/ocrStore";
import { setAreaImage, clearAllImages } from "@/stores/imageStore";
import type { Area } from "@/types/area";
import type { AppSettings } from "@/types/settings";
import type { DocumentFile } from "@/types/document";

const TEST_TIMEOUT = 50;

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
  setAreaImage(area.id, "processed", "data:image/png;base64,FAKE");
}

function makeDoc(): DocumentFile {
  return {
    id: "doc-1",
    name: "doc.pdf",
    type: "pdf",
    file: new File(["fake"], "doc.pdf", { type: "application/pdf" }),
    url: "blob:fake",
    pageCount: 1,
  };
}

function makeSettings(overrides: Partial<AppSettings> = {}): AppSettings {
  return {
    ocrEnabled: true,
    preprocessingEnabled: true,
    language: "es",
    ocrModel: "test-model",
    ...overrides,
  };
}

function buildDeps(overrides: Partial<ExtractionDeps> = {}): {
  deps: ExtractionDeps;
  mocks: {
    ocrExtract: ReturnType<typeof vi.fn>;
    saveExtraction: ReturnType<typeof vi.fn>;
    updateAreaStatus: ReturnType<typeof vi.fn>;
    updateAreaExtractedText: ReturnType<typeof vi.fn>;
    setProcessing: ReturnType<typeof vi.fn>;
    setAbortController: ReturnType<typeof vi.fn>;
  };
} {
  const mocks = {
    ocrExtract: vi.fn(async () => ({ text: "extracted", provider: "test" })),
    saveExtraction: vi.fn(async () => {}),
    updateAreaStatus: vi.fn(),
    updateAreaExtractedText: vi.fn(),
    setProcessing: vi.fn(),
    setAbortController: vi.fn(),
  };

  const deps: ExtractionDeps = {
    getSettings: () => makeSettings(),
    getDocument: () => makeDoc(),
    getActiveArea: () => useAreaStore.getState().getActiveArea(),
    updateAreaStatus: mocks.updateAreaStatus as ExtractionDeps["updateAreaStatus"],
    updateAreaExtractedText: mocks.updateAreaExtractedText as ExtractionDeps["updateAreaExtractedText"],
    setProcessing: mocks.setProcessing as ExtractionDeps["setProcessing"],
    setAbortController: mocks.setAbortController as ExtractionDeps["setAbortController"],
    ocrExtract: mocks.ocrExtract as ExtractionDeps["ocrExtract"],
    saveExtraction: mocks.saveExtraction as ExtractionDeps["saveExtraction"],
    dataUrlToJpegDataUrl: async (dataUrl) => dataUrl,
    getAreaImage: (id, kind) => {
      const map: Record<string, string | null> = {
        "area-1:processed": "data:image/png;base64,FAKE",
        "area-1:raw": null,
      };
      return map[`${id}:${kind}`] ?? null;
    },
    getTimeoutMessage: () => "Timeout",
    timeoutMs: TEST_TIMEOUT,
    debug: false,
    ...overrides,
  };

  return { deps, mocks };
}

describe("runExtraction", () => {
  beforeEach(() => {
    clearAllImages();
    useAreaStore.setState({ areas: [], activeAreaId: null, areaCounter: 0 });
    useOCRStore.setState({ isProcessing: false, abortController: null });
  });

  it("skips when ocrEnabled is false", async () => {
    seedArea(makeArea());
    const { deps, mocks } = buildDeps({
      getSettings: () => makeSettings({ ocrEnabled: false }),
    });
    const outcome = await runExtraction(deps);
    expect(outcome.reason).toBe("skipped");
    expect(mocks.ocrExtract).not.toHaveBeenCalled();
  });

  it("skips when there is no document", async () => {
    seedArea(makeArea());
    const { deps, mocks } = buildDeps({ getDocument: () => null });
    const outcome = await runExtraction(deps);
    expect(outcome.reason).toBe("skipped");
    expect(mocks.ocrExtract).not.toHaveBeenCalled();
  });

  it("skips when there is no active area or zone", async () => {
    useAreaStore.setState({ areas: [], activeAreaId: null, areaCounter: 0 });
    const { deps, mocks } = buildDeps();
    const outcome = await runExtraction(deps);
    expect(outcome.reason).toBe("skipped");
    expect(mocks.ocrExtract).not.toHaveBeenCalled();
  });

  it("happy path: transitions to 'extracted' and clears processing", async () => {
    seedArea(makeArea({ status: "zone-defined" }));
    const { deps, mocks } = buildDeps();
    const outcome: ExtractionOutcome = await runExtraction(deps);

    expect(outcome.status).toBe("extracted");
    expect(outcome.reason).toBe("success");

    expect(mocks.updateAreaStatus).toHaveBeenCalledWith("area-1", "processing");
    expect(mocks.updateAreaExtractedText).toHaveBeenCalledWith("area-1", "extracted");
    expect(mocks.updateAreaStatus).toHaveBeenLastCalledWith("area-1", "extracted");
    expect(mocks.saveExtraction).toHaveBeenCalledOnce();
    expect(mocks.setProcessing).toHaveBeenCalledWith(true);
    expect(mocks.setProcessing).toHaveBeenLastCalledWith(false);
    expect(mocks.setAbortController).toHaveBeenLastCalledWith(null);
  });

  it("error: ocrExtract throws -> area ends in 'error'", async () => {
    seedArea(makeArea());
    const { deps, mocks } = buildDeps({
      ocrExtract: vi.fn(async () => {
        throw new Error("backend down");
      }) as ExtractionDeps["ocrExtract"],
    });
    const outcome = await runExtraction(deps);

    expect(outcome.reason).toBe("error");
    expect(mocks.updateAreaStatus).toHaveBeenLastCalledWith("area-1", "error", "backend down");
    expect(mocks.updateAreaExtractedText).not.toHaveBeenCalled();
    expect(mocks.saveExtraction).not.toHaveBeenCalled();
    expect(mocks.setProcessing).toHaveBeenLastCalledWith(false);
  });

  it("error: saveExtraction throws -> area ends in 'error' with text preserved", async () => {
    seedArea(makeArea());
    const { deps, mocks } = buildDeps();
    mocks.saveExtraction.mockImplementationOnce(async () => {
      throw new Error("history down");
    });
    const outcome = await runExtraction(deps);

    expect(outcome.reason).toBe("error");
    expect(mocks.updateAreaStatus).toHaveBeenLastCalledWith("area-1", "error", "history down");
    expect(mocks.updateAreaExtractedText).toHaveBeenCalledWith("area-1", "extracted");
    expect(mocks.saveExtraction).toHaveBeenCalledOnce();
    expect(mocks.setProcessing).toHaveBeenLastCalledWith(false);
  });

  it("timeout: aborts after timeoutMs -> area ends in 'error' with timeout message", async () => {
    seedArea(makeArea());
    let capturedSignal: AbortSignal | undefined;
    const { deps, mocks } = buildDeps({
      timeoutMs: 10,
    });
    mocks.ocrExtract.mockImplementationOnce(async (_img, _model, signal) => {
      capturedSignal = signal;
      return await new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          const reason = signal.reason;
          if (reason instanceof DOMException && reason.name === "TimeoutError") {
            reject(reason);
          } else {
            reject(new DOMException("aborted", "AbortError"));
          }
        });
      });
    });
    const outcome = await runExtraction(deps);

    expect(outcome.reason).toBe("timeout");
    expect(capturedSignal).toBeDefined();
    expect(mocks.updateAreaStatus).toHaveBeenLastCalledWith("area-1", "error", "Timeout");
    expect(mocks.setProcessing).toHaveBeenLastCalledWith(false);
  });

  it("missing crop image: area ends in 'error' without calling ocr", async () => {
    useAreaStore.setState({ areas: [], activeAreaId: null, areaCounter: 0 });
    seedArea(makeArea());
    clearAllImages();
    const { deps, mocks } = buildDeps({
      getAreaImage: () => null,
    });
    const outcome = await runExtraction(deps);

    expect(outcome.reason).toBe("error");
    expect(mocks.updateAreaStatus).toHaveBeenLastCalledWith("area-1", "error", "No crop image available");
    expect(mocks.ocrExtract).not.toHaveBeenCalled();
  });
});
