"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image";
import { generateId } from "@/lib/id";
import { GROWTH_TYPES, LIGHT_LEVELS } from "@/lib/types";
import type { GrowthType, LightLevel, Plant } from "@/lib/types";
import type { SpeciesCandidate } from "@/app/api/identify-species/route";
import ImageCropper from "./ImageCropper";
import { extractStoragePath } from "@/lib/storagePath";

export default function PlantForm({ plant }: { plant?: Plant }) {
  const isEdit = Boolean(plant);
  const router = useRouter();

  const [nickname, setNickname] = useState(plant?.nickname ?? "");
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(
    plant?.photo_url ?? null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    plant?.photo_url ?? null
  );
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("저장 중...");
  const [error, setError] = useState<string | null>(null);

  const [speciesCommon, setSpeciesCommon] = useState(plant?.species_common ?? "");
  const [speciesScientific, setSpeciesScientific] = useState(
    plant?.species_scientific ?? ""
  );
  const [growthType, setGrowthType] = useState<GrowthType | "">(
    plant?.growth_type ?? ""
  );
  const [lightLevel, setLightLevel] = useState<LightLevel | "">(
    plant?.light_level ?? ""
  );
  const [wateringCriteria, setWateringCriteria] = useState(
    plant?.watering_criteria ?? ""
  );
  const [origin, setOrigin] = useState(plant?.origin ?? "");
  const [location, setLocation] = useState(plant?.location ?? "");

  const [identifying, setIdentifying] = useState(false);
  const [candidates, setCandidates] = useState<SpeciesCandidate[] | null>(null);
  const [identifyError, setIdentifyError] = useState<string | null>(null);

  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState("photo.jpg");

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    setCropFileName(file.name);
    e.target.value = "";
  }

  function handleCropDone(file: File) {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setCandidates(null);
    setIdentifyError(null);
    setCropSrc(null);
  }

  async function handleIdentify() {
    if (!photoFile && !existingPhotoUrl) return;
    setIdentifying(true);
    setIdentifyError(null);
    setCandidates(null);

    try {
      let sourceFile = photoFile;
      if (!sourceFile && existingPhotoUrl) {
        const res = await fetch(existingPhotoUrl);
        const blob = await res.blob();
        sourceFile = new File([blob], "existing-photo.jpg", {
          type: blob.type || "image/jpeg",
        });
      }
      if (!sourceFile) return;

      const compressed = await compressImage(sourceFile);
      const body = new FormData();
      body.append("image", compressed, "photo.jpg");

      const res = await fetch("/api/identify-species", { method: "POST", body });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "식별에 실패했어요.");
      if (!data.candidates || data.candidates.length === 0) {
        setIdentifyError("비슷한 종을 찾지 못했어요. 직접 입력해주세요.");
        return;
      }
      setCandidates(data.candidates);
    } catch (err) {
      setIdentifyError(
        err instanceof Error ? err.message : "식별 중 오류가 발생했어요."
      );
    } finally {
      setIdentifying(false);
    }
  }

  function applyCandidate(c: SpeciesCandidate) {
    setSpeciesScientific(c.scientificName);
    setSpeciesCommon(c.koreanName || c.commonName || "");
    if (c.growthType) setGrowthType(c.growthType);
    if (c.lightLevel) setLightLevel(c.lightLevel);
    if (c.wateringCriteria) setWateringCriteria(c.wateringCriteria);
    if (c.origin) setOrigin(c.origin);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!nickname.trim()) {
      setError("별명은 꼭 입력해주세요.");
      return;
    }
    setSubmitting(true);

    try {
      let photoUrl: string | null = existingPhotoUrl;

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

        if (isEdit && existingPhotoUrl) {
          const oldPath = extractStoragePath(existingPhotoUrl);
          if (oldPath) {
            await supabase.storage.from("plant-photos").remove([oldPath]);
          }
        }
        photoUrl = publicUrlData.publicUrl;
      }

      setStatusText("저장 중...");
      const payload = {
        nickname: nickname.trim(),
        species_common: speciesCommon.trim() || null,
        species_scientific: speciesScientific.trim() || null,
        origin: origin.trim() || null,
        growth_type: growthType || null,
        watering_criteria: wateringCriteria.trim() || null,
        light_level: lightLevel || null,
        location: location.trim() || null,
        photo_url: photoUrl,
      };

      if (isEdit && plant) {
        const { error: updateError } = await supabase
          .from("plants")
          .update(payload)
          .eq("id", plant.id);
        if (updateError) throw updateError;

        router.push(`/plants/${plant.id}`);
      } else {
        const { data, error: insertError } = await supabase
          .from("plants")
          .insert(payload)
          .select()
          .single();
        if (insertError) throw insertError;

        router.push(`/plants/${data.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 중 오류가 발생했어요.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold text-stone-800">
        {isEdit ? "화분 정보 수정" : "화분 등록"}
      </h1>

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

          {(photoFile || existingPhotoUrl) && (
            <button
              type="button"
              onClick={handleIdentify}
              disabled={identifying}
              className="mt-2 w-full rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 disabled:opacity-60"
            >
              {identifying ? "종 식별 중..." : "🔍 AI로 종 추천받기"}
            </button>
          )}

          {identifyError && (
            <p className="mt-2 text-sm text-red-600">{identifyError}</p>
          )}

          {candidates && (
            <div className="mt-2 flex flex-col gap-2">
              <p className="text-xs text-stone-500">
                다육·선인장은 AI 정확도가 낮을 수 있어요. 종 이름과 관리
                정보는 참고용이니 꼭 확인 후 수정해주세요.
              </p>
              {candidates.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyCandidate(c)}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 text-left text-sm hover:border-emerald-400"
                >
                  <span>
                    <span className="italic text-stone-800">
                      {c.scientificName}
                    </span>
                    {(c.koreanName || c.commonName) && (
                      <span className="text-stone-500">
                        {" "}
                        · {c.koreanName || c.commonName}
                      </span>
                    )}
                  </span>
                  <span className="ml-2 flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                    {Math.round(c.score * 100)}%
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Field label="별명 *">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            placeholder="예: 첫째 에케베리아"
            className={inputClass}
          />
        </Field>

        <Field label="일반명 / 학명">
          <input
            value={speciesCommon}
            onChange={(e) => setSpeciesCommon(e.target.value)}
            placeholder="예: 에케베리아 노바"
            className={inputClass}
          />
          <input
            value={speciesScientific}
            onChange={(e) => setSpeciesScientific(e.target.value)}
            placeholder="예: Echeveria 'Nova'"
            className={`${inputClass} mt-2`}
          />
        </Field>

        <Field label="생장기 타입">
          <select
            value={growthType}
            onChange={(e) => setGrowthType(e.target.value as GrowthType)}
            className={inputClass}
          >
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
          <select
            value={lightLevel}
            onChange={(e) => setLightLevel(e.target.value as LightLevel)}
            className={inputClass}
          >
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
            value={wateringCriteria}
            onChange={(e) => setWateringCriteria(e.target.value)}
            placeholder="예: 흙이 완전히 마르면"
            className={inputClass}
          />
        </Field>

        <Field label="원산지">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="예: 남아프리카"
            className={inputClass}
          />
        </Field>

        <Field label="위치">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
          {submitting ? statusText : isEdit ? "수정 완료" : "등록하기"}
        </button>
      </form>

      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          fileName={cropFileName}
          onCancel={() => setCropSrc(null)}
          onDone={handleCropDone}
        />
      )}
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
