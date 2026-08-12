"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { extractStoragePath } from "@/lib/storagePath";

export default function DeleteLogButton({
  logId,
  photoUrls,
}: {
  logId: string;
  photoUrls: string[];
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "이 기록을 삭제할까요? 사진도 함께 삭제되고 되돌릴 수 없어요."
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

      const { error } = await supabase.from("logs").delete().eq("id", logId);
      if (error) throw error;

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
      className="text-xs text-red-500 disabled:opacity-50"
    >
      {deleting ? "삭제 중..." : "삭제"}
    </button>
  );
}
