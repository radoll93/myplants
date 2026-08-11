import type { Plant, PlantLog } from "./types";

export type TimelinePhoto = {
  url: string;
  date: string;
  label: string;
};

export function buildPhotoTimeline(
  plant: Plant,
  logs: PlantLog[]
): TimelinePhoto[] {
  const items: TimelinePhoto[] = [];

  if (plant.photo_url) {
    items.push({
      url: plant.photo_url,
      date: plant.created_at.slice(0, 10),
      label: "등록 사진",
    });
  }

  for (const log of logs) {
    for (const url of log.photos) {
      items.push({ url, date: log.log_date, label: log.log_date });
    }
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return items;
}
