"use client";

import { useCallback } from "react";
import { Upload, X, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

type ImageUploadProps = {
  imageUrl: string;
  onUrlChange: (url: string) => void;
  onFileSelect?: (file: File) => void;
};

export default function ImageUpload({
  imageUrl,
  onUrlChange,
  onFileSelect,
}: ImageUploadProps) {
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

      onUrlChange(preview);

      toast.success("Image selected successfully.");
    },
    [onFileSelect, onUrlChange]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      "image/*": [],
    },
    multiple: false,
    noClick: true,
    onDrop,
  });

  return (
    <div className="space-y-6">

      {/* Upload Card */}
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200
        ${
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

        <p className="text-sm text-stone-500">
          or
        </p>

        <button
          type="button"
          onClick={open}
          className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
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

      {/* Preview */}
      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="relative">

            <img
              src={imageUrl}
              alt="Preview"
              className="h-48 w-full object-cover"
            />

            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow transition hover:bg-white"
            >
              <X className="h-4 w-4" />
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

            <p className="mt-3 text-sm text-stone-500">
              No image selected
            </p>

          </div>

        </div>
      )}

    </div>
  );
}