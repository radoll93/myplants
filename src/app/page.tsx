import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Plant } from "@/lib/types";
import { getSeoulWeather } from "@/lib/weather";
import { generateCoaching } from "@/lib/coaching";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ data: plants, error }, weather] = await Promise.all([
    supabase.from("plants").select("*").order("created_at", { ascending: false }),
    getSeoulWeather(),
  ]);

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

      {plants && plants.length > 0 && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-stone-700">
              오늘의 코칭
            </h2>
            {weather && (
              <p className="text-xs text-stone-400">
                서울 {weather.tempNow}°C (최고 {weather.tempMax}°C) ·{" "}
                {weather.description}
              </p>
            )}
          </div>
          <div className="mt-2 flex gap-3 overflow-x-auto pb-1">
            {plants.map((plant: Plant) => {
              const tips = generateCoaching(plant, weather);
              return (
                <div
                  key={plant.id}
                  className="w-56 flex-shrink-0 rounded-xl border border-emerald-100 bg-emerald-50 p-3"
                >
                  <p className="text-sm font-medium text-emerald-900">
                    {plant.nickname}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    {tips[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
