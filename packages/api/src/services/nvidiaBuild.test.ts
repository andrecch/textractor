import assert from "node:assert/strict";
import test, { after } from "node:test";
import { runMigrations, closeDatabase } from "../db/database.js";
import { callNvidiaBuildVision } from "./nvidiaBuild.js";

process.env.TEXTRACTOR_DB_PATH = ":memory:";
runMigrations();

after(() => {
  closeDatabase();
});

const TINY_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function mockFetch(response: unknown) {
  const original = global.fetch;
  global.fetch = (async () => ({
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => response,
    text: async () => "",
  })) as unknown as typeof fetch;
  return () => {
    global.fetch = original;
  };
}

test("VLM route preserves line breaks from chat completions", async () => {
  const restore = mockFetch({
    choices: [{ message: { content: "line 1\nline 2\nline 3" } }],
  });
  try {
    const text = await callNvidiaBuildVision(TINY_PNG, "fake-key", "meta/llama-3.2-11b-vision-instruct");
    assert.equal(text, "line 1\nline 2\nline 3");
  } finally {
    restore();
  }
});

test("VLM route trims outer whitespace but keeps inner newlines", async () => {
  const restore = mockFetch({
    choices: [{ message: { content: "  line 1\nline 2  \n  line 3  " } }],
  });
  try {
    const text = await callNvidiaBuildVision(TINY_PNG, "fake-key", "meta/llama-3.2-11b-vision-instruct");
    assert.equal(text, "line 1\nline 2  \n  line 3");
  } finally {
    restore();
  }
});

test("VLM route returns empty string when content is empty", async () => {
  const restore = mockFetch({
    choices: [{ message: { content: "" } }],
  });
  try {
    const text = await callNvidiaBuildVision(TINY_PNG, "fake-key", "meta/llama-3.2-11b-vision-instruct");
    assert.equal(text, "");
  } finally {
    restore();
  }
});

test("CV route uses geometric parser with bounding boxes", async () => {
  const restore = mockFetch({
    data: [
      {
        index: 0,
        text_detections: [
          {
            text_prediction: { text: "second", confidence: 0.9 },
            bounding_box: {
              points: [
                { x: 0, y: 45 },
                { x: 100, y: 45 },
                { x: 100, y: 65 },
                { x: 0, y: 65 },
              ],
            },
          },
          {
            text_prediction: { text: "first", confidence: 0.95 },
            bounding_box: {
              points: [
                { x: 0, y: 10 },
                { x: 100, y: 10 },
                { x: 100, y: 30 },
                { x: 0, y: 30 },
              ],
            },
          },
        ],
      },
    ],
  });
  try {
    const text = await callNvidiaBuildVision(TINY_PNG, "fake-key", "nvidia/nemotron-ocr-v2");
    assert.equal(text, "first\nsecond");
  } finally {
    restore();
  }
});

test("CV route falls back to newline join when no bounding boxes", async () => {
  const restore = mockFetch({
    data: [
      {
        index: 0,
        text_detections: [
          { text_prediction: { text: "block 1", confidence: 0.9 } },
          { text_prediction: { text: "block 2", confidence: 0.85 } },
        ],
      },
    ],
  });
  try {
    const text = await callNvidiaBuildVision(TINY_PNG, "fake-key", "nvidia/nemotron-ocr-v2");
    assert.equal(text, "block 1\nblock 2");
  } finally {
    restore();
  }
});

test("throws when no API key is configured", async () => {
  const originalEnv = process.env.NVIDIA_API_KEY;
  delete process.env.NVIDIA_API_KEY;
  try {
    await assert.rejects(
      () => callNvidiaBuildVision(TINY_PNG, undefined, "meta/llama-3.2-11b-vision-instruct"),
      /No API key configured/
    );
  } finally {
    process.env.NVIDIA_API_KEY = originalEnv;
  }
});

test("throws when response is not ok", async () => {
  const restore = mockFetch(null);
  global.fetch = (async () => ({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    text: async () => "error details",
    json: async () => ({}),
  })) as unknown as typeof fetch;
  try {
    await assert.rejects(
      () => callNvidiaBuildVision(TINY_PNG, "fake-key", "meta/llama-3.2-11b-vision-instruct"),
      /NVIDIA API error \(500\)/
    );
  } finally {
    restore();
  }
});
