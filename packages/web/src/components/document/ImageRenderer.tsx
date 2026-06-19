import { useEffect, useRef, useCallback } from "react";

interface ImageRendererProps {
  url: string;
  zoom: number;
  onPageSizeChange: (width: number, height: number) => void;
}

export function ImageRenderer({
  url,
  zoom,
  onPageSizeChange,
}: ImageRendererProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    onPageSizeChange(img.naturalWidth * zoom, img.naturalHeight * zoom);
  }, [zoom, onPageSizeChange]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      handleLoad();
    }
  }, [handleLoad]);

  return (
    <img
      ref={imgRef}
      src={url}
      alt="Document"
      onLoad={handleLoad}
      style={{
        width: "auto",
        height: "auto",
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      className="max-w-none shadow-lg"
      draggable={false}
    />
  );
}
