export const GROWTH_TYPES = ["여름형", "봄가을형", "여름휴면형"] as const;
export type GrowthType = (typeof GROWTH_TYPES)[number];

export const LIGHT_LEVELS = ["강한 직사광", "밝은 간접광", "약한 빛"] as const;
export type LightLevel = (typeof LIGHT_LEVELS)[number];

export const EVENT_TAGS = [
  "물주기",
  "분갈이",
  "순지르기",
  "개화",
  "상태변화",
  "기록",
] as const;
export type EventTag = (typeof EVENT_TAGS)[number];

export type Plant = {
  id: string;
  created_at: string;
  nickname: string;
  species_common: string | null;
  species_scientific: string | null;
  origin: string | null;
  growth_type: GrowthType | null;
  watering_criteria: string | null;
  light_level: LightLevel | null;
  location: string | null;
  photo_url: string | null;
  last_watered_at: string | null;
};

export type PlantLog = {
  id: string;
  created_at: string;
  plant_id: string;
  log_date: string;
  event_tags: EventTag[];
  photos: string[];
  memo: string | null;
  weather: Record<string, unknown> | null;
};
