export const TZ = "America/Vancouver";
export const OWNER = "Matthew Carson";
export const APP_NAME = "Matthews Global Dashboard-Tuesday";
export const COMMAND_DATE_LABEL = "Tuesday · 25 Aug 2026";
export const COMMAND_WEEKDAY = "Tuesday";

export const HOME_WEATHER = {
  id: "vancouver",
  name: "Vancouver, BC — Home",
  lat: 49.2827,
  lon: -123.1207,
};

export const WHISTLER_WEATHER = {
  id: "whistler",
  name: "Whistler, BC",
  lat: 50.1163,
  lon: -122.9574,
};

export const DEFAULT_WATCHLIST = [
  "^GSPC",
  "^IXIC",
  "^GSPTSE",
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "NVDA",
  "TSLA",
  "BTC-USD",
] as const;

export const FAMILY = [
  "Brillianna",
  "Aurora",
  "Matthison",
  "Ryker",
  "Linda",
  "Laura",
] as const;

export const CATS = ["Jax", "Atom", "Mau"] as const;

export const FAMILY_STREAMS = ["Deck", "Bathroom", "Shop"] as const;
export type FamilyStream = (typeof FAMILY_STREAMS)[number];

export const STORAGE = {
  tasks: "mgd.tasks.v1",
  notes: "mgd.priorityNotes.v1",
  family: "mgd.familyNotes.v1",
  cats: "mgd.catNotes.v1",
  watchlist: "mgd.watchlist.v1",
  ics: "mgd.icsUrl.v1",
  dmcaSpark: "mgd.dmcaSpark.session",
  familyWork: "mgd.familyWork.v1",
} as const;

export const REFRESH_MS = {
  weather: 10 * 60 * 1000,
  stocks: 60 * 1000,
  news: 5 * 60 * 1000,
  dmca: 30 * 1000,
  webcams: 5 * 60 * 1000,
  clock: 1000,
  networks: 5 * 60 * 1000,
  calendar: 5 * 60 * 1000,
} as const;
