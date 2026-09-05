import { describe, it, expect, vi, afterEach } from "vitest";
import { ocrExtract, OcrServerError, OcrModelRetiredError } from "./api";

const IMAGE = "data:image/png;base64,FAKE";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ocrExtract", () => {
  it("returns text and provider on 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ text: "hello", provider: "nvidia-build" }))
    );
    await expect(ocrExtract(IMAGE)).resolves.toEqual({
      text: "hello",
      provider: "nvidia-build",
    });
  });

  it("preserves the server error message on !ok with JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ error: "NVIDIA API error (410): gone" }, 500))
    );
    await expect(ocrExtract(IMAGE)).rejects.toThrow("NVIDIA API error (410): gone");
  });

  it("throws OcrServerError on !ok with empty body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 }))
    );
    await expect(ocrExtract(IMAGE)).rejects.toBeInstanceOf(OcrServerError);
  });

  it("throws OcrServerError on !ok with non-JSON body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("<html>proxy error</html>", {
            status: 502,
            headers: { "Content-Type": "text/html" },
          })
      )
    );
    await expect(ocrExtract(IMAGE)).rejects.toBeInstanceOf(OcrServerError);
  });

  it("throws OcrModelRetiredError on 410 with EOL detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          {
            error:
              "NVIDIA API error (410): {\"title\":\"Gone\",\"detail\":\"The model has reached its end of life.\"}",
          },
          410
        )
      )
    );
    const err = await ocrExtract(IMAGE).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(OcrModelRetiredError);
  });

  it("throws OcrServerError when fetch itself fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );
    await expect(ocrExtract(IMAGE)).rejects.toBeInstanceOf(OcrServerError);
  });
});
