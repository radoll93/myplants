import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Plant, PlantLog } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: plant, error: plantError }, { data: logs }] = await Promise.all([
    supabase.from("plants").select("*").eq("id", id).single(),
    supabase
      .from("logs")
      .select("*")
      .eq("plant_id", id)
      .order("log_date", { ascending: false }),
  ]);

  if (plantError || !plant) notFound();

  const p = plant as Plant;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <Link href="/" className="text-sm text-stone-500">
        ← 목록으로
      </Link>

      <div className="mt-3 aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
        {p.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo_url}
            alt={p.nickname}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <h1 className="mt-4 text-2xl font-semibold text-stone-800">
        {p.nickname}
      </h1>
      {p.species_common && (
        <p className="text-stone-500">
          {p.species_common}
          {p.species_scientific ? ` · ${p.species_scientific}` : ""}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-stone-50 p-4 text-sm">
        <InfoItem label="생장기 타입" value={p.growth_type} />
        <InfoItem label="광량" value={p.light_level} />
        <InfoItem label="물주기 기준" value={p.watering_criteria} />
        <InfoItem label="위치" value={p.location} />
        <InfoItem label="원산지" value={p.origin} />
        <InfoItem label="마지막 급수" value={p.last_watered_at} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-800">성장 타임라인</h2>
        <Link
          href={`/plants/${p.id}/logs/new`}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
        >
          + 기록 추가
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {(!logs || logs.length === 0) && (
          <p className="text-sm text-stone-500">아직 기록이 없어요.</p>
        )}
        {logs?.map((log: PlantLog) => (
          <div
            key={log.id}
            className="rounded-xl border border-stone-200 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-stone-700">
                {log.log_date}
              </p>
              <div className="flex gap-1">
                {log.event_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {log.photos.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {log.photos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt=""
                    className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            {log.memo && (
              <p className="mt-2 text-sm text-stone-600">{log.memo}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-stone-400">{label}</p>
      <p className="text-stone-700">{value || "-"}</p>
    </div>
  );
}
