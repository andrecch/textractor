export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function downloadPng(dataUrl: string, fileName: string): void {
  const blob = dataUrlToBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  if (!meta || !base64) {
    throw new Error("Invalid data URL");
  }
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch?.[1] ?? "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
