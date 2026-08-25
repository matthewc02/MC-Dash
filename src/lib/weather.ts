import { HOME_WEATHER, WHISTLER_WEATHER, TZ } from "@/lib/constants";
import { WeatherBundle } from "@/lib/types";
import { explainFetchError } from "@/lib/browserFetch";

const CURRENT =
  "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,pressure_msl,uv_index,weather_code";
const HOURLY = "temperature_2m,precipitation_probability,weather_code";
const DAILY =
  "weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,sunrise,sunset";

async function loadPlace(place: { id: string; name: string; lat: number; lon: number }): Promise<WeatherBundle> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}` +
    `&current=${CURRENT}&hourly=${HOURLY}&daily=${DAILY}` +
    `&timezone=${encodeURIComponent(TZ)}&forecast_days=7`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const j = await res.json();
  const hourly: WeatherBundle["hourly"] = [];
  const times: string[] = j.hourly?.time ?? [];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  for (let i = 0; i < times.length; i++) {
    if (!times[i].startsWith(today)) continue;
    hourly.push({
      time: times[i],
      temp: j.hourly.temperature_2m?.[i] ?? null,
      pop: j.hourly.precipitation_probability?.[i] ?? null,
      code: j.hourly.weather_code?.[i] ?? null,
    });
  }
  const daily: WeatherBundle["daily"] = (j.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    tmax: j.daily.temperature_2m_max?.[i] ?? null,
    tmin: j.daily.temperature_2m_min?.[i] ?? null,
    uv: j.daily.uv_index_max?.[i] ?? null,
    precip: j.daily.precipitation_sum?.[i] ?? null,
    code: j.daily.weather_code?.[i] ?? null,
    sunrise: j.daily.sunrise?.[i] ?? null,
    sunset: j.daily.sunset?.[i] ?? null,
  }));
  return {
    id: place.id,
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    timezone: j.timezone ?? TZ,
    current: {
      temp: j.current?.temperature_2m ?? null,
      feels: j.current?.apparent_temperature ?? null,
      humidity: j.current?.relative_humidity_2m ?? null,
      wind: j.current?.wind_speed_10m ?? null,
      windDir: j.current?.wind_direction_10m ?? null,
      pressure: j.current?.pressure_msl ?? null,
      uv: j.current?.uv_index ?? null,
      weatherCode: j.current?.weather_code ?? null,
      time: j.current?.time ?? null,
    },
    hourly,
    daily,
  };
}

export async function fetchWeather() {
  try {
    const [vancouver, whistler] = await Promise.all([
      loadPlace(HOME_WEATHER),
      loadPlace(WHISTLER_WEATHER),
    ]);
    return { vancouver, whistler, fetchedAt: new Date().toISOString(), error: null as string | null };
  } catch (e) {
    return {
      vancouver: null,
      whistler: null,
      fetchedAt: new Date().toISOString(),
      error: explainFetchError(e, "Weather"),
    };
  }
}
