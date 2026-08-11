"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function extractStoragePath(url: string): string | null {
  const marker = "/plant-photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export default function DeletePlantButton({
  plantId,
  nickname,
  photoUrls,
}: {
  plantId: string;
  nickname: string;
  photoUrls: string[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `"${nickname}"을(를) 삭제할까요? 기록과 사진도 함께 삭제되고 되돌릴 수 없어요.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const paths = photoUrls
        .map(extractStoragePath)
        .filter((p): p is string => Boolean(p));
      if (paths.length > 0) {
        await supabase.storage.from("plant-photos").remove(paths);
      }

      const { error } = await supabase.from("plants").delete().eq("id", plantId);
      if (error) throw error;

      router.push("/");
      router.refresh();
    } catch {
      window.alert("삭제 중 문제가 발생했어요. 다시 시도해주세요.");
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="text-sm text-red-500 disabled:opacity-50"
    >
      {deleting ? "삭제 중..." : "이 화분 삭제"}
    </button>
  );
}
