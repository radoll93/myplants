import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Plant, PlantLog } from "@/lib/types";
import { buildPhotoTimeline } from "@/lib/photoTimeline";
import CompareSlider from "@/components/CompareSlider";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: plant, error }, { data: logs }] = await Promise.all([
    supabase.from("plants").select("*").eq("id", id).single(),
    supabase
      .from("logs")
      .select("*")
      .eq("plant_id", id)
      .order("log_date", { ascending: true }),
  ]);

  if (error || !plant) notFound();

  const p = plant as Plant;
  const timeline = buildPhotoTimeline(p, (logs ?? []) as PlantLog[]);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <Link href={`/plants/${p.id}`} className="text-sm text-stone-500">
        ← {p.nickname}
      </Link>
      <h1 className="mt-3 text-xl font-semibold text-stone-800">
        성장 비교
      </h1>
      <CompareSlider photos={timeline} />
    </main>
  );
}
