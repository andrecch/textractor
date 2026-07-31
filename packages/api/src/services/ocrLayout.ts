export interface OCRPoint {
  x: number;
  y: number;
}

export interface OCRTextDetection {
  text?: string;
  boundingBox?: {
    points?: OCRPoint[];
  };
}

interface TextFragment {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerY: number;
  height: number;
}

interface TextLine {
  fragments: TextFragment[];
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerY: number;
  height: number;
}

interface TextColumn {
  lines: TextLine[];
  left: number;
  right: number;
}

const MIN_VERTICAL_OVERLAP = 0.2;
const SAME_LINE_GAP_FACTOR = 3;
const SAME_COLUMN_GAP_FACTOR = 6;

export function formatOCRDetections(detections: OCRTextDetection[]): string {
  const candidates = detections
    .map((detection) => ({
      text: normalizeText(detection.text),
      fragment: toTextFragment(detection),
    }))
    .filter(({ text }) => text.length > 0);

  if (candidates.length === 0) return "";

  const positioned = candidates.flatMap(({ text, fragment }) => {
    if (!fragment) return [];
    return [{ ...fragment, text }];
  });
  const unpositioned = candidates
    .filter(({ fragment }) => !fragment)
    .map(({ text }) => text);

  if (positioned.length === 0) {
    return unpositioned.join("\n");
  }

  const medianHeight = median(positioned.map((fragment) => fragment.height));
  const lines = groupIntoLines(positioned, medianHeight);
  const columns = groupIntoColumns(lines, medianHeight);
  const formatted = columns
    .map((column) =>
      column.lines
        .map((line) => joinInlineText(line.fragments))
        .filter(Boolean)
        .join("\n")
    )
    .filter(Boolean)
    .join("\n\n");

  if (unpositioned.length === 0) return formatted;
  return [formatted, ...unpositioned].filter(Boolean).join("\n");
}

function normalizeText(text: string | undefined): string {
  return (text ?? "").replace(/\r\n?/g, "\n").trim();
}

function toTextFragment(detection: OCRTextDetection): TextFragment | null {
  const points = detection.boundingBox?.points;
  if (!points || points.length < 2) return null;

  const validPoints = points.filter(
    (point) => Number.isFinite(point.x) && Number.isFinite(point.y)
  );
  if (validPoints.length < 2) return null;

  const xs = validPoints.map((point) => point.x);
  const ys = validPoints.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const right = Math.max(...xs);
  const bottom = Math.max(...ys);
  const height = bottom - top;

  if (right <= left || height <= 0) return null;

  return {
    text: "",
    left,
    top,
    right,
    bottom,
    centerY: (top + bottom) / 2,
    height,
  };
}

function groupIntoLines(fragments: TextFragment[], medianHeight: number): TextLine[] {
  const sameLineGap = Math.max(medianHeight * SAME_LINE_GAP_FACTOR, 1);
  const lines: TextLine[] = [];

  const sorted = [...fragments].sort(
    (a, b) => a.centerY - b.centerY || a.left - b.left
  );

  for (const fragment of sorted) {
    const candidates = lines
      .map((line, index) => ({
        index,
        score: lineMatchScore(fragment, line, sameLineGap),
      }))
      .filter(({ score }) => score !== null)
      .sort((a, b) => a.score! - b.score!);

    if (candidates.length === 0) {
      lines.push(createLine(fragment));
      continue;
    }

    addToLine(lines[candidates[0]!.index]!, fragment);
  }

  return lines.map((line) => {
    line.fragments.sort((a, b) => a.left - b.left || a.top - b.top);
    return line;
  });
}

function lineMatchScore(
  fragment: TextFragment,
  line: TextLine,
  sameLineGap: number
): number | null {
  const verticalOverlap = overlapLength(
    fragment.top,
    fragment.bottom,
    line.top,
    line.bottom
  );
  const minimumHeight = Math.min(fragment.height, line.height);
  const overlapRatio = verticalOverlap / minimumHeight;
  const centerDistance = Math.abs(fragment.centerY - line.centerY);
  const verticalTolerance = Math.max(fragment.height, line.height) * 0.55;
  const horizontalGap = intervalGap(
    fragment.left,
    fragment.right,
    line.left,
    line.right
  );
  const horizontalOverlap = overlapLength(
    fragment.left,
    fragment.right,
    line.left,
    line.right
  );

  const verticallyAligned =
    overlapRatio >= MIN_VERTICAL_OVERLAP || centerDistance <= verticalTolerance;
  const horizontallyAdjacent =
    horizontalOverlap > 0 || horizontalGap <= sameLineGap;

  if (!verticallyAligned || !horizontallyAdjacent) return null;
  return centerDistance + horizontalGap * 0.01;
}

function createLine(fragment: TextFragment): TextLine {
  return {
    fragments: [fragment],
    left: fragment.left,
    top: fragment.top,
    right: fragment.right,
    bottom: fragment.bottom,
    centerY: fragment.centerY,
    height: fragment.height,
  };
}

function addToLine(line: TextLine, fragment: TextFragment): void {
  line.fragments.push(fragment);
  line.left = Math.min(line.left, fragment.left);
  line.top = Math.min(line.top, fragment.top);
  line.right = Math.max(line.right, fragment.right);
  line.bottom = Math.max(line.bottom, fragment.bottom);
  line.centerY = (line.top + line.bottom) / 2;
  line.height = line.bottom - line.top;
}

function groupIntoColumns(lines: TextLine[], medianHeight: number): TextColumn[] {
  const sameColumnGap = Math.max(medianHeight * SAME_COLUMN_GAP_FACTOR, 1);
  const columns: TextColumn[] = [];

  const sorted = [...lines].sort((a, b) => a.left - b.left || a.top - b.top);
  for (const line of sorted) {
    const candidates = columns
      .map((column, index) => ({
        index,
        score: columnMatchScore(line, column, sameColumnGap),
      }))
      .filter(({ score }) => score !== null)
      .sort((a, b) => a.score! - b.score!);

    if (candidates.length === 0) {
      columns.push({ lines: [line], left: line.left, right: line.right });
      continue;
    }

    const column = columns[candidates[0]!.index]!;
    column.lines.push(line);
    column.left = Math.min(column.left, line.left);
    column.right = Math.max(column.right, line.right);
  }

  return columns
    .sort((a, b) => a.left - b.left)
    .map((column) => ({
      ...column,
      lines: column.lines.sort((a, b) => a.top - b.top || a.left - b.left),
    }));
}

function columnMatchScore(
  line: TextLine,
  column: TextColumn,
  sameColumnGap: number
): number | null {
  const horizontalOverlap = overlapLength(
    line.left,
    line.right,
    column.left,
    column.right
  );
  const horizontalGap = intervalGap(
    line.left,
    line.right,
    column.left,
    column.right
  );

  if (horizontalOverlap > 0) {
    return horizontalGap;
  }
  if (horizontalGap <= sameColumnGap) {
    return sameColumnGap + horizontalGap;
  }
  return null;
}

function joinInlineText(fragments: TextFragment[]): string {
  let result = "";

  for (const fragment of fragments) {
    const text = fragment.text.trim();
    if (!text) continue;
    if (!result) {
      result = text;
      continue;
    }

    if (
      result.endsWith("\n") ||
      text.startsWith("\n") ||
      /^[,.;:!?%)\]}]/.test(text) ||
      /[(\[{¿¡$]$/.test(result)
    ) {
      result += text;
    } else {
      result += ` ${text}`;
    }
  }

  return result;
}

function overlapLength(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

function intervalGap(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  if (aEnd < bStart) return bStart - aEnd;
  if (bEnd < aStart) return aStart - bEnd;
  return 0;
}

function median(values: number[]): number {
  if (values.length === 0) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }
  return sorted[middle]!;
}
