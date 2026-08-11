export type SeoulWeather = {
  tempNow: number;
  tempMax: number;
  humidity: number;
  description: string;
  isHeatwave: boolean;
};

export async function getSeoulWeather(): Promise<SeoulWeather | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Seoul,KR&appid=${apiKey}&units=metric&lang=kr`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const tempNow = Math.round(data.main.temp);
    const tempMax = Math.round(data.main.temp_max);

    return {
      tempNow,
      tempMax,
      humidity: data.main.humidity,
      description: data.weather?.[0]?.description ?? "",
      isHeatwave: tempMax >= 33,
    };
  } catch {
    return null;
  }
}
