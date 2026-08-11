import type { GrowthType, Plant } from "./types";
import { seoulMonth, isSummerMonth, isWinterMonth } from "./season";

type Interval = { summer: number; winter: number; other: number };

const INTERVALS: Record<GrowthType, Interval> = {
  여름형: { summer: 7, winter: 21, other: 10 },
  여름휴면형: { summer: 30, winter: 14, other: 14 },
  봄가을형: { summer: 14, winter: 21, other: 10 },
};

const DEFAULT_INTERVAL: Interval = { summer: 10, winter: 14, other: 10 };

function daysSince(dateStr: string): number {
  const then = new Date(dateStr + "T00:00:00+09:00").getTime();
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export function needsWateringToday(plant: Plant): boolean {
  const month = seoulMonth();
  const interval = plant.growth_type
    ? INTERVALS[plant.growth_type]
    : DEFAULT_INTERVAL;
  const days = isSummerMonth(month)
    ? interval.summer
    : isWinterMonth(month)
      ? interval.winter
      : interval.other;

  const baseline = plant.last_watered_at ?? plant.created_at.slice(0, 10);
  return daysSince(baseline) >= days;
}
