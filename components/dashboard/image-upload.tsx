"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2, RotateCcw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { useElementSize } from "@/lib/use-element-size";
import {
  MIN_SCALE,
  clampPixelPosition,
  getImageTransform,
  normalizedToPixels,
  pixelsToNormalized,
} from "@/lib/image-framing";

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

const MAX_SCALE = 3;
const SCALE_STEP = 0.05;

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
 const {
    ref: containerRef,
    size: containerSize,
    node: containerNode,
} = useElementSize<HTMLDivElement>();

  const [isDragging, setIsDragging] = useState(false);

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
  (event: React.PointerEvent<HTMLDivElement>) => {

      if (!imageUrl) return;

      event.preventDefault();

const rect =
containerNode!.getBoundingClientRect();

const currentContainer = {
    width: rect.width,
    height: rect.height,
};

const startPx = normalizedToPixels(
    { x: imagePositionX, y: imagePositionY },
    imageScale,
    currentContainer
);


      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosX: startPx.x,
        startPosY: startPx.y,
      };

      event.currentTarget.setPointerCapture(event.pointerId);

      setIsDragging(true);
    },
[
  imageUrl,
  imagePositionX,
  imagePositionY,
  imageScale,
  containerNode,
]
);

 const handlePointerMove = useCallback(
  (event: React.PointerEvent<HTMLDivElement>) => {


      const dragState = dragStateRef.current;

      if (!dragState || dragState.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - dragState.startClientX;
      const deltaY = event.clientY - dragState.startClientY;

const rect =
containerNode!.getBoundingClientRect();

const currentContainer = {
  width: rect.width,
  height: rect.height,
};

const nextPx = clampPixelPosition(
  {
    x: dragState.startPosX + deltaX,
    y: dragState.startPosY + deltaY,
  },
  imageScale,
  currentContainer,
);

const nextNormalized = pixelsToNormalized(
  nextPx,
  imageScale,
  currentContainer,
);



onImagePositionXChange(nextNormalized.x);
onImagePositionYChange(nextNormalized.y);



    },
 [
  imageScale,
  containerNode,
  onImagePositionXChange,
  onImagePositionYChange,
],
  );

 const endDrag = useCallback(
  (event: React.PointerEvent<HTMLDivElement>) => {
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
    },
    [onImageScaleChange],
  );

  const handleReset = useCallback(() => {
    onImageScaleChange(1);
    onImagePositionXChange(0);
    onImagePositionYChange(0);
  }, [onImageScaleChange, onImagePositionXChange, onImagePositionYChange]);

 
const previewTransform = getImageTransform(
  {
    x: imagePositionX,
    y: imagePositionY,
  },
  imageScale,
  containerSize,
);





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
    onPointerDown={handlePointerDown}
    onPointerMove={handlePointerMove}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Preview"
                draggable={false}
               
                className={`absolute inset-0 h-full w-full select-none object-cover ${
                  isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                  transform: previewTransform,
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