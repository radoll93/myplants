import { GROWTH_TYPES, LIGHT_LEVELS, type Plant } from "./types";

export type GroupKey = "growth_type" | "origin" | "light_level";

const UNSPECIFIED = "미지정";

export function groupPlants(
  plants: Plant[],
  key: GroupKey
): [string, Plant[]][] {
  const groups = new Map<string, Plant[]>();

  for (const plant of plants) {
    const raw = plant[key];
    const label = raw && raw.trim() !== "" ? raw : UNSPECIFIED;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(plant);
  }

  const entries = [...groups.entries()];

  if (key === "growth_type") {
    const order = [...GROWTH_TYPES, UNSPECIFIED];
    entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  } else if (key === "light_level") {
    const order = [...LIGHT_LEVELS, UNSPECIFIED];
    entries.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  } else {
    entries.sort((a, b) => {
      if (a[0] === UNSPECIFIED) return 1;
      if (b[0] === UNSPECIFIED) return -1;
      return a[0].localeCompare(b[0], "ko");
    });
  }

  return entries;
}
