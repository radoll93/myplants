import type { Plant } from "./types";
import type { SeoulWeather } from "./weather";

function seoulMonth(): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
  }).formatToParts(new Date());
  return Number(parts.find((p) => p.type === "month")?.value ?? new Date().getMonth() + 1);
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr + "T00:00:00+09:00").getTime();
  const now = new Date().getTime();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function generateCoaching(
  plant: Plant,
  weather: SeoulWeather | null
): string[] {
  const month = seoulMonth();
  const isSummer = month >= 6 && month <= 8;
  const isWinter = month === 12 || month <= 2;
  const days = daysSince(plant.last_watered_at);

  const tips: string[] = [];

  switch (plant.growth_type) {
    case "여름형":
      if (isSummer) {
        tips.push("지금은 성장기예요. 흙이 완전히 마르면 충분히 물을 주세요.");
      } else if (isWinter) {
        tips.push("겨울엔 휴면기에 가까워요. 물주기를 크게 줄이고, 흙이 마른 뒤에도 며칠 더 기다렸다가 주세요.");
      } else {
        tips.push("생장기 초입/막바지예요. 흙이 마르면 평소보다 약간 적은 양으로 급수하세요.");
      }
      break;
    case "여름휴면형":
      if (isSummer) {
        tips.push("여름 휴면기예요. 물은 거의 끊고 그늘지고 통풍 잘 되는 곳에 두세요.");
      } else {
        tips.push("지금은 생장기예요. 흙이 마르면 급수해주세요.");
      }
      break;
    case "봄가을형":
      if (isSummer || isWinter) {
        tips.push(
          `${isSummer ? "한여름" : "한겨울"}엔 물을 줄일 시기예요. 흙이 마른 뒤에도 여유를 두고 급수하세요.`
        );
      } else {
        tips.push("지금이 주 생장기예요. 흙이 마르면 평소대로 급수하세요.");
      }
      break;
    default:
      tips.push("생장기 타입을 등록하면 더 정확한 코칭을 받을 수 있어요.");
  }

  if (days !== null) {
    if (days >= 14) {
      tips.push(`마지막 급수 후 ${days}일 지났어요. 흙 상태를 한번 확인해보세요.`);
    }
  } else {
    tips.push("아직 급수 기록이 없어요. 물을 준 날 기록을 남겨보세요.");
  }

  if (weather?.isHeatwave) {
    tips.push(
      `오늘 최고기온 ${weather.tempMax}°C, 폭염이에요. 한낮에는 물 주지 말고 해 진 뒤 저녁이나 밤에 주세요.`
    );
  }

  tips.push("받침에 고인 물은 바로 버리고, 통풍을 최우선으로 신경써주세요.");

  return tips;
}
