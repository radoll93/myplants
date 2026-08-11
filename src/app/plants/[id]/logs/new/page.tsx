"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image";
import { generateId } from "@/lib/id";
import { EVENT_TAGS, type EventTag } from "@/lib/types";
import ImageCropper from "@/components/ImageCropper";

export default function NewLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: plantId } = use(params);
  const router = useRouter();

  const [selectedTags, setSelectedTags] = useState<EventTag[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("저장 중...");
  const [error, setError] = useState<string | null>(null);

  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropTotal, setCropTotal] = useState(0);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("photo.jpg");

  function toggleTag(tag: EventTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function openNextInQueue(queue: File[]) {
    if (queue.length === 0) {
      setCropSrc(null);
      return;
    }
    setCropSrc(URL.createObjectURL(queue[0]));
    setCropFileName(queue[0].name);
  }

  function handlePhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setCropTotal(files.length);
    setCropQueue(files);
    openNextInQueue(files);
    e.target.value = "";
  }

  function handleCropDone(file: File) {
    setPhotoFiles((prev) => [...prev, file]);
    setPhotoPreviews((prev) => [...prev, URL.createObjectURL(file)]);
    setCropQueue((prev) => {
      const rest = prev.slice(1);
      openNextInQueue(rest);
      return rest;
    });
  }

  function handleCropSkip() {
    setCropQueue((prev) => {
      const rest = prev.slice(1);
      openNextInQueue(rest);
      return rest;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const logDate = String(formData.get("log_date") || "");
    const memo = String(formData.get("memo") || "") || null;

    try {
      const photoUrls: string[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        setStatusText(`사진 업로드 중... (${i + 1}/${photoFiles.length})`);
        const compressed = await compressImage(photoFiles[i]);
        const path = `${generateId()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("plant-photos")
          .upload(path, compressed);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("plant-photos")
          .getPublicUrl(path);
        photoUrls.push(publicUrlData.publicUrl);
      }

      setStatusText("저장 중...");
      const { error: insertError } = await supabase.from("logs").insert({
        plant_id: plantId,
        log_date: logDate,
        event_tags: selectedTags,
        photos: photoUrls,
        memo,
      });
      if (insertError) throw insertError;

      if (selectedTags.includes("물주기")) {
        await supabase
          .from("plants")
          .update({ last_watered_at: logDate })
          .eq("id", plantId);
      }

      router.push(`/plants/${plantId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했어요.");
      setSubmitting(false);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold text-stone-800">기록 추가</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            날짜
          </label>
          <input
            type="date"
            name="log_date"
            defaultValue={today}
            required
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            이벤트
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {EVENT_TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  selectedTags.includes(tag)
                    ? "bg-emerald-600 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            사진 (여러 장 선택 가능)
          </label>
          <label className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-sm text-stone-400">
            {photoPreviews.length > 0
              ? `${photoPreviews.length}장 선택됨`
              : "눌러서 사진 촬영/선택"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotosChange}
            />
          </label>
          {photoPreviews.length > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto">
              {photoPreviews.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700">
            메모
          </label>
          <textarea
            name="memo"
            rows={3}
            placeholder="오늘 상태는 어땠나요?"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 outline-none focus:border-emerald-500"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-70"
        >
          {submitting ? statusText : "기록 저장"}
        </button>
      </form>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          fileName={cropFileName}
          title={`사진 ${cropTotal - cropQueue.length + 1}/${cropTotal}`}
          cancelLabel="이 사진 건너뛰기"
          onCancel={handleCropSkip}
          onDone={handleCropDone}
        />
      )}
    </main>
  );
}
