"use client";

import { useState } from "react";
import Link from "next/link";
import type { Plant } from "@/lib/types";
import { groupPlants, type GroupKey } from "@/lib/groupPlants";

const TABS: { key: GroupKey; label: string }[] = [
  { key: "growth_type", label: "생장기 타입" },
  { key: "origin", label: "원산지" },
  { key: "light_level", label: "광량" },
];

export default function PlantGroups({ plants }: { plants: Plant[] }) {
  const [groupBy, setGroupBy] = useState<GroupKey>("growth_type");
  const groups = groupPlants(plants, groupBy);

  return (
    <div className="mt-6">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setGroupBy(tab.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              groupBy === tab.key
                ? "bg-emerald-600 text-white"
                : "bg-stone-100 text-stone-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {groups.map(([label, groupPlantsList]) => (
          <div key={label}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              {label}
              <span className="text-xs font-normal text-stone-400">
                {groupPlantsList.length}개
              </span>
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {groupPlantsList.map((plant) => (
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
          </div>
        ))}
      </div>
    </div>
  );
}
