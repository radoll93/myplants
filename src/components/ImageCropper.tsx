"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/cropImage";

export default function ImageCropper({
  imageSrc,
  fileName,
  onCancel,
  onDone,
  cancelLabel = "취소",
  title,
}: {
  imageSrc: string;
  fileName: string;
  onCancel: () => void;
  onDone: (file: File) => void;
  cancelLabel?: string;
  title?: string;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  async function handleUseCropped() {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedArea);
      onDone(new File([blob], fileName, { type: "image/jpeg" }));
    } finally {
      setProcessing(false);
    }
  }

  async function handleUseOriginal() {
    setProcessing(true);
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      onDone(new File([blob], fileName, { type: blob.type || "image/jpeg" }));
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {title && (
        <p className="bg-black px-4 pt-3 text-center text-sm text-white">
          {title}
        </p>
      )}
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex flex-col gap-3 bg-black p-4">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 rounded-lg bg-stone-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleUseOriginal}
            disabled={processing}
            className="flex-1 rounded-lg bg-stone-700 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            전체 사진 사용
          </button>
          <button
            type="button"
            onClick={handleUseCropped}
            disabled={processing}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {processing ? "처리 중..." : "자르기 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
