"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image";
import { generateId } from "@/lib/id";
import { GROWTH_TYPES, LIGHT_LEVELS } from "@/lib/types";

export default function NewPlantPage() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("저장 중...");
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const nickname = String(formData.get("nickname") || "").trim();

    if (!nickname) {
      setError("별명은 꼭 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        setStatusText("사진 압축 중...");
        const compressed = await compressImage(photoFile);
        const path = `${generateId()}.jpg`;
        setStatusText("사진 업로드 중...");
        const { error: uploadError } = await supabase.storage
          .from("plant-photos")
          .upload(path, compressed);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("plant-photos")
          .getPublicUrl(path);
        photoUrl = publicUrlData.publicUrl;
      }

      setStatusText("저장 중...");
      const { data, error: insertError } = await supabase
        .from("plants")
        .insert({
          nickname,
          species_common: String(formData.get("species_common") || "") || null,
          species_scientific:
            String(formData.get("species_scientific") || "") || null,
          origin: String(formData.get("origin") || "") || null,
          growth_type: String(formData.get("growth_type") || "") || null,
          watering_criteria:
            String(formData.get("watering_criteria") || "") || null,
          light_level: String(formData.get("light_level") || "") || null,
          location: String(formData.get("location") || "") || null,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      router.push(`/plants/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했어요.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold text-stone-800">화분 등록</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            사진
          </label>
          <label className="mt-2 flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-400">
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm">눌러서 사진 촬영/선택</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        </div>

        <Field label="별명 *">
          <input
            name="nickname"
            required
            placeholder="예: 첫째 에케베리아"
            className={inputClass}
          />
        </Field>

        <Field label="일반명 / 학명">
          <input
            name="species_common"
            placeholder="예: 에케베리아 노바"
            className={inputClass}
          />
          <input
            name="species_scientific"
            placeholder="예: Echeveria 'Nova'"
            className={`${inputClass} mt-2`}
          />
        </Field>

        <Field label="생장기 타입">
          <select name="growth_type" className={inputClass} defaultValue="">
            <option value="" disabled>
              선택해주세요
            </option>
            {GROWTH_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="광량">
          <select name="light_level" className={inputClass} defaultValue="">
            <option value="" disabled>
              선택해주세요
            </option>
            {LIGHT_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>

        <Field label="물주기 기준">
          <input
            name="watering_criteria"
            placeholder="예: 흙이 완전히 마르면"
            className={inputClass}
          />
        </Field>

        <Field label="원산지">
          <input name="origin" placeholder="예: 남아프리카" className={inputClass} />
        </Field>

        <Field label="위치">
          <input
            name="location"
            placeholder="예: 거실 창가"
            className={inputClass}
          />
        </Field>

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
          {submitting ? statusText : "등록하기"}
        </button>
      </form>
    </main>
  );
}

const inputClass =
  "w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-800 outline-none focus:border-emerald-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
