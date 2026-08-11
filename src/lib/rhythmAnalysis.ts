import type { PlantLog } from "./types";

export type MonthActivity = {
  month: number;
  total: number;
  watering: number;
  bloom: number;
};

export function analyzeMonthlyActivity(logs: PlantLog[]): MonthActivity[] {
  const months: MonthActivity[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: 0,
    watering: 0,
    bloom: 0,
  }));

  for (const log of logs) {
    const m = Number(log.log_date.slice(5, 7));
    if (m < 1 || m > 12) continue;
    const entry = months[m - 1];
    entry.total++;
    if (log.event_tags.includes("물주기")) entry.watering++;
    if (log.event_tags.includes("개화")) entry.bloom++;
  }

  return months;
}

export function dataSpanDays(logs: PlantLog[]): number {
  if (logs.length === 0) return 0;
  const times = logs.map((l) => new Date(l.log_date).getTime());
  return Math.floor((Math.max(...times) - Math.min(...times)) / 86400000);
}
