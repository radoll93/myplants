import type { GrowthType, LightLevel } from "./types";

export type GenusDefaults = {
  koreanName: string;
  growthType: GrowthType;
  lightLevel: LightLevel;
  wateringCriteria: string;
  origin: string;
};

const DRY_WAIT = "흙이 마른 뒤에도 며칠 더 기다렸다가 급수";
const DRY_NORMAL = "흙이 완전히 마르면 급수";

const GENUS_DEFAULTS: Record<string, GenusDefaults> = {
  // 여름형 (여름 성장기)
  pachypodium: { koreanName: "파키포디움", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "마다가스카르·아프리카" },
  portulacaria: { koreanName: "사랑목", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  crassula: { koreanName: "크라슐라", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  echinopsis: { koreanName: "에키놉시스", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  mammillaria: { koreanName: "마밀라리아", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "멕시코·중남미" },
  gymnocalycium: { koreanName: "짐노칼리시움", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  astrophytum: { koreanName: "아스트로피툼", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "멕시코" },
  opuntia: { koreanName: "부채선인장(오푼티아)", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "아메리카 대륙" },
  rebutia: { koreanName: "레부티아", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  parodia: { koreanName: "파로디아", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  ferocactus: { koreanName: "페로칵투스", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "멕시코·미국 남서부" },
  cereus: { koreanName: "세레우스", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  trichocereus: { koreanName: "트리코세레우스", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  cleistocactus: { koreanName: "클레이스토칵투스", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "남아메리카" },
  euphorbia: { koreanName: "유포르비아", growthType: "여름형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "아프리카·마다가스카르" },

  // 여름휴면형 (더위에 약함, 여름 휴면)
  lithops: { koreanName: "리톱스", growthType: "여름휴면형", lightLevel: "강한 직사광", wateringCriteria: DRY_WAIT, origin: "남아프리카" },
  conophytum: { koreanName: "코노피텀", growthType: "여름휴면형", lightLevel: "밝은 간접광", wateringCriteria: DRY_WAIT, origin: "남아프리카" },
  titanopsis: { koreanName: "티타놉시스", growthType: "여름휴면형", lightLevel: "강한 직사광", wateringCriteria: DRY_WAIT, origin: "남아프리카" },
  pleiospilos: { koreanName: "플레이오스필로스", growthType: "여름휴면형", lightLevel: "강한 직사광", wateringCriteria: DRY_WAIT, origin: "남아프리카" },
  echeveria: { koreanName: "에케베리아", growthType: "여름휴면형", lightLevel: "밝은 간접광", wateringCriteria: DRY_WAIT, origin: "멕시코" },
  senecio: { koreanName: "세네시오(녹영)", growthType: "여름휴면형", lightLevel: "밝은 간접광", wateringCriteria: DRY_WAIT, origin: "아프리카" },
  curio: { koreanName: "세네시오(녹영)", growthType: "여름휴면형", lightLevel: "밝은 간접광", wateringCriteria: DRY_WAIT, origin: "아프리카" },

  // 봄가을형 (그 외 대부분)
  haworthia: { koreanName: "하월시아", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  haworthiopsis: { koreanName: "하월시옵시스", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  gasteria: { koreanName: "가스테리아", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  sedum: { koreanName: "세덤", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "멕시코·유럽" },
  graptopetalum: { koreanName: "그랍토페탈룸", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "멕시코" },
  graptoveria: { koreanName: "그랍토베리아", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "원예 교배종" },
  aeonium: { koreanName: "아이오니움", growthType: "봄가을형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "카나리아 제도" },
  sempervivum: { koreanName: "셈페르비붐", growthType: "봄가을형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "유럽" },
  kalanchoe: { koreanName: "칼랑코에", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "마다가스카르" },
  aloe: { koreanName: "알로에", growthType: "봄가을형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "아프리카" },
  adromischus: { koreanName: "아드로미스쿠스", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  cotyledon: { koreanName: "코틸레돈", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "남아프리카" },
  pachyphytum: { koreanName: "파키피툼", growthType: "봄가을형", lightLevel: "밝은 간접광", wateringCriteria: DRY_NORMAL, origin: "멕시코" },
  dudleya: { koreanName: "더들리야", growthType: "봄가을형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "북아메리카" },
  agave: { koreanName: "아가베", growthType: "봄가을형", lightLevel: "강한 직사광", wateringCriteria: DRY_NORMAL, origin: "아메리카 대륙" },
  sansevieria: { koreanName: "산세베리아", growthType: "봄가을형", lightLevel: "약한 빛", wateringCriteria: DRY_NORMAL, origin: "아프리카" },
};

export function getGenusDefaults(scientificName: string): GenusDefaults | null {
  const genus = scientificName.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
  if (!genus) return null;
  return GENUS_DEFAULTS[genus] ?? null;
}
