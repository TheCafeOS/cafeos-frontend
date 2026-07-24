"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2, RotateCcw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type ImageUploadProps = {
  imageUrl: string;

  imageScale: number;
  imagePositionX: number;
  imagePositionY: number;

  onImageScaleChange: (value: number) => void;
  onImagePositionXChange: (value: number) => void;
  onImagePositionYChange: (value: number) => void;

  onUrlChange: (url: string) => void;

  onFileSelect?: (file: File) => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.05;

/**
 * Clamp a translation offset so the (scaled) image can never be dragged
 * far enough to reveal empty space inside the preview frame.
 *
 * Because the image is rendered with object-cover, at scale === 1 it
 * already fully covers the container, so no movement is allowed. As the
 * scale grows, the amount of "extra" image around the edges grows too,
 * which is what we allow the user to pan across.
 */
function clampOffset(
  value: number,
  scale: number,
  containerSize: number,
): number {
  const maxOffset = (Math.max(scale, MIN_SCALE) - 1) * (containerSize / 2);

  if (maxOffset <= 0) return 0;

  return Math.min(maxOffset, Math.max(-maxOffset, value));
}

export default function ImageUpload({
  imageUrl,
  imageScale,
  imagePositionX,
  imagePositionY,
  onImageScaleChange,
  onImagePositionXChange,
  onImagePositionYChange,
  onUrlChange,
  onFileSelect,
}: ImageUploadProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  // Drag bookkeeping lives in a ref so it never triggers rerenders while
  // the pointer is moving — only the resulting position updates do.
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5 MB.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image.");
        return;
      }

      onFileSelect?.(file);

      const preview = URL.createObjectURL(file);

      // Intentionally does NOT touch imageScale / imagePositionX/Y so a
      // replacement image keeps whatever framing was already dialed in.
      onUrlChange(preview);

      toast.success("Image selected successfully.");
    },
    [onFileSelect, onUrlChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [],
    },
    multiple: false,
    noClick: true,
    onDrop,
  });

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      if (!imageUrl) return;

      event.preventDefault();

      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosX: imagePositionX,
        startPosY: imagePositionY,
      };

      // Pointer capture routes subsequent pointer events to this element
      // even if the pointer leaves it, so we don't need window listeners
      // or manual cleanup effects.
      event.currentTarget.setPointerCapture(event.pointerId);

      setIsDragging(true);
    },
    [imageUrl, imagePositionX, imagePositionY],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const container = containerRef.current;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;

      const nextX = clampOffset(
        dragState.startPosX + deltaX,
        imageScale,
        width,
      );
      const nextY = clampOffset(
        dragState.startPosY + deltaY,
        imageScale,
        height,
      );

      onImagePositionXChange(nextX);
      onImagePositionYChange(nextY);
    },
    [imageScale, onImagePositionXChange, onImagePositionYChange],
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLImageElement>) => {
      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) return;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      dragStateRef.current = null;
      setIsDragging(false);
    },
    [],
  );

  const handleScaleChange = useCallback(
    (nextScale: number) => {
      onImageScaleChange(nextScale);

      const container = containerRef.current;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();

      const clampedX = clampOffset(imagePositionX, nextScale, width);
      const clampedY = clampOffset(imagePositionY, nextScale, height);

      if (clampedX !== imagePositionX) onImagePositionXChange(clampedX);
      if (clampedY !== imagePositionY) onImagePositionYChange(clampedY);
    },
    [
      imagePositionX,
      imagePositionY,
      onImageScaleChange,
      onImagePositionXChange,
      onImagePositionYChange,
    ],
  );

  const handleReset = useCallback(() => {
    onImageScaleChange(1);
    onImagePositionXChange(0);
    onImagePositionYChange(0);
  }, [onImageScaleChange, onImagePositionXChange, onImagePositionYChange]);

  // If the preview frame is resized (e.g. responsive breakpoint change)
  // while a non-default offset is active, re-clamp so the image can't be
  // left showing empty space.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();

      const clampedX = clampOffset(imagePositionX, imageScale, width);
      const clampedY = clampOffset(imagePositionY, imageScale, height);

      if (clampedX !== imagePositionX) onImagePositionXChange(clampedX);
      if (clampedY !== imagePositionY) onImagePositionYChange(clampedY);
    });

    observer.observe(container);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageScale]);

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
          isDragActive
            ? "border-amber-500 bg-amber-50 scale-[1.02]"
            : "border-stone-300 hover:border-amber-400 hover:bg-stone-50"
        }`}
      >
        <input {...getInputProps()} />

        <Upload className="mx-auto mb-4 h-8 w-8 text-amber-600" />

        <h3 className="text-sm font-semibold text-stone-900">
          Upload Food Image
        </h3>

        <p className="mt-2 text-sm text-stone-500">
          Drag & Drop your image here
        </p>

        <p className="text-sm text-stone-500">or</p>

        <button
          type="button"
          onClick={open}
          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Choose Image
        </button>

        <p className="mt-4 text-xs text-stone-400">
          PNG • JPG • WEBP • Maximum 5 MB
        </p>
      </div>

      {/* URL */}
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700">
          Or use an Image URL
        </label>

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500"
        />
      </div>

      {/* Preview / Editor */}
      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="relative">
            <div
              ref={containerRef}
              className="relative h-[280px] w-full touch-none overflow-hidden rounded-xl bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                draggable={false}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`absolute inset-0 h-full w-full select-none object-cover ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  transform: `translate(${imagePositionX}px, ${imagePositionY}px) scale(${imageScale})`,
                  transformOrigin: "center",
                  touchAction: "none",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2 border-t p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-700">Zoom</span>

              <span className="text-stone-500">{imageScale.toFixed(2)}x</span>
            </div>

            <input
              type="range"
              min={MIN_SCALE}
              max={MAX_SCALE}
              step={SCALE_STEP}
              value={imageScale}
              onChange={(e) => handleScaleChange(Number(e.target.value))}
              className="w-full accent-amber-600"
            />

            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-amber-400 hover:text-amber-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Position
            </button>
          </div>

          <div className="flex items-center gap-2 border-t px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Image ready for upload
          </div>
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-stone-200 bg-stone-50">
          <div className="text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-stone-400" />

            <p className="mt-3 text-sm text-stone-500">No image selected</p>
          </div>
        </div>
      )}
    </div>
  );
}