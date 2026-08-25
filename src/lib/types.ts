export type ArtifactType =
  | "email"
  | "note"
  | "calendar"
  | "task"
  | "work"
  | "news"
  | "stock"
  | "monitor"
  | "weather"
  | "webcam"
  | "network";

export type Artifact = {
  id: string;
  type: ArtifactType;
  label: string;
  detail?: string;
  href?: string;
  at: string;
  meta?: Record<string, string | number | boolean | null>;
};

export type NewsItem = {
  source: string;
  title: string;
  link: string;
  publishedAt: string | null;
};

export type Quote = {
  symbol: string;
  name: string;
  price: number | null;
  changePct: number | null;
  currency: string;
  spark: number[];
  ok: boolean;
  error?: string;
};

export type WeatherBundle = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  current: {
    temp: number | null;
    feels: number | null;
    humidity: number | null;
    wind: number | null;
    windDir: number | null;
    pressure: number | null;
    uv: number | null;
    weatherCode: number | null;
    time: string | null;
  };
  hourly: { time: string; temp: number | null; pop: number | null; code: number | null }[];
  daily: {
    date: string;
    tmax: number | null;
    tmin: number | null;
    uv: number | null;
    precip: number | null;
    code: number | null;
    sunrise: string | null;
    sunset: string | null;
  }[];
};

export type HealthSample = {
  url: string;
  ok: boolean;
  status: number | null;
  ttfbMs: number | null;
  totalMs: number | null;
  title: string | null;
  error: string | null;
  checkedAt: string;
};

export type WebcamMeta = {
  id: string;
  label: string;
  location: string;
  sourcePage: string;
  imageUrl: string | null;
  upstream: string | null;
  ok: boolean;
  contentType: string | null;
  error: string | null;
  capturedAt: string;
};

export type Task = { id: string; title: string; done: boolean; createdAt: string };

export type FamilyActivity = {
  id: string;
  stream: "Deck" | "Bathroom" | "Shop";
  note: string;
  owner?: string;
  at: string;
  source?: string;
};

export type FamilyWorkState = {
  Deck: FamilyActivity[];
  Bathroom: FamilyActivity[];
  Shop: FamilyActivity[];
};
