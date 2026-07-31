import assert from "node:assert/strict";
import test from "node:test";
import { formatOCRDetections } from "./ocrLayout.js";
import { extractTextFromCVResponse } from "./nvidiaBuild.js";

function box(left: number, top: number, right: number, bottom: number) {
  return {
    points: [
      { x: left, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: left, y: bottom },
    ],
  };
}

test("preserves visual line order when detections arrive out of order", () => {
  const text = formatOCRDetections([
    { text: "line 3", boundingBox: box(0, 80, 120, 100) },
    { text: "line 1", boundingBox: box(0, 10, 120, 30) },
    { text: "line 4", boundingBox: box(0, 115, 120, 135) },
    { text: "line 2", boundingBox: box(0, 45, 120, 65) },
  ]);

  assert.equal(text, "line 1\nline 2\nline 3\nline 4");
});

test("reads the complete left column before the right column", () => {
  const text = formatOCRDetections([
    { text: "right 2", boundingBox: box(300, 45, 420, 65) },
    { text: "left 1", boundingBox: box(0, 10, 120, 30) },
    { text: "right 1", boundingBox: box(300, 10, 420, 30) },
    { text: "left 2", boundingBox: box(0, 45, 120, 65) },
  ]);

  assert.equal(text, "left 1\nleft 2\n\nright 1\nright 2");
});

test("joins fragments on the same visual line from left to right", () => {
  const text = formatOCRDetections([
    { text: "world", boundingBox: box(70, 10, 120, 30) },
    { text: "Hello", boundingBox: box(0, 10, 55, 30) },
    { text: "!", boundingBox: box(125, 10, 132, 30) },
  ]);

  assert.equal(text, "Hello world!");
});

test("does not split a normal line into columns because of word spacing", () => {
  const text = formatOCRDetections([
    { text: "Alpha", boundingBox: box(0, 10, 45, 30) },
    { text: "Beta", boundingBox: box(75, 10, 120, 30) },
  ]);

  assert.equal(text, "Alpha Beta");
});

test("keeps provider text when bounding boxes are unavailable", () => {
  const text = formatOCRDetections([
    { text: "first line" },
    { text: "second line" },
  ]);

  assert.equal(text, "first line\nsecond line");
});

test("preserves embedded line breaks in a detection", () => {
  const text = formatOCRDetections([
    { text: "first\r\nsecond", boundingBox: box(0, 10, 120, 35) },
  ]);

  assert.equal(text, "first\nsecond");
});

test("maps the NVIDIA response shape into the visual layout formatter", () => {
  const text = extractTextFromCVResponse({
    data: [
      {
        index: 0,
        text_detections: [
          { text_prediction: { text: "second" }, bounding_box: box(0, 45, 100, 65) },
          { text_prediction: { text: "first" }, bounding_box: box(0, 10, 100, 30) },
        ],
      },
    ],
  });

  assert.equal(text, "first\nsecond");
});
