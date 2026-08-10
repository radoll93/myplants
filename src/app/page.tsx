import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Plant } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: plants, error } = await supabase
    .from("plants")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-800">내 다육이들</h1>
        <Link
          href="/plants/new"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
        >
          + 등록
        </Link>
      </div>

      {error && (
        <p className="mt-6 text-sm text-red-600">
          목록을 불러오지 못했어요: {error.message}
        </p>
      )}

      {!error && plants && plants.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-stone-500">
          <p>아직 등록된 화분이 없어요.</p>
          <Link
            href="/plants/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            첫 화분 등록하기
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        {plants?.map((plant: Plant) => (
          <Link
            key={plant.id}
            href={`/plants/${plant.id}`}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white"
          >
            <div className="aspect-square w-full bg-stone-100">
              {plant.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={plant.photo_url}
                  alt={plant.nickname}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium text-stone-800">
                {plant.nickname}
              </p>
              {plant.species_common && (
                <p className="truncate text-xs text-stone-500">
                  {plant.species_common}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
