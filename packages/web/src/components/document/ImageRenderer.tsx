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
  const naturalSizeRef = useRef({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    const { width, height } = naturalSizeRef.current;
    if (width > 0 && height > 0) {
      onPageSizeChange(width * zoom, height * zoom);
    }
  }, [zoom, onPageSizeChange]);

  const handleLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    naturalSizeRef.current = {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
    updateSize();
  }, [updateSize]);

  useEffect(() => {
    updateSize();
  }, [updateSize]);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      handleLoad();
    }
  }, [handleLoad]);

  const scaledWidth = naturalSizeRef.current.width * zoom;
  const scaledHeight = naturalSizeRef.current.height * zoom;

  return (
    <img
      ref={imgRef}
      src={url}
      alt="Document"
      onLoad={handleLoad}
      style={{
        width: scaledWidth > 0 ? `${scaledWidth}px` : "auto",
        height: scaledHeight > 0 ? `${scaledHeight}px` : "auto",
      }}
      className="max-w-none shadow-lg"
      draggable={false}
    />
  );
}
