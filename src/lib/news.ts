import { fetchText, parseFeed } from "@/lib/rss";
import { NewsItem } from "@/lib/types";
import { explainFetchError } from "@/lib/browserFetch";

const FEEDS: { source: string; urls: string[] }[] = [
  { source: "Reuters", urls: ["https://news.google.com/rss/search?q=site:reuters.com&hl=en-CA&gl=CA&ceid=CA:en"] },
  { source: "AP", urls: ["https://news.google.com/rss/search?q=site:apnews.com&hl=en-CA&gl=CA&ceid=CA:en"] },
  { source: "BBC World", urls: ["https://feeds.bbci.co.uk/news/world/rss.xml"] },
  { source: "CBC", urls: ["https://www.cbc.ca/webfeed/rss/rss-topstories", "https://www.cbc.ca/webfeed/rss/rss-world"] },
];

async function loadSource(source: string, urls: string[]) {
  const errors: string[] = [];
  for (const url of urls) {
    try {
      const r = await fetchText(url, 12000);
      if (!r.ok) {
        errors.push(`${url} → ${r.status}`);
        continue;
      }
      const items = parseFeed(r.text, source, 6);
      if (items.length) return { source, items, error: null as string | null };
      errors.push(`${url} → empty feed`);
    } catch (e) {
      errors.push(`${url} → ${explainFetchError(e, source)}`);
    }
  }
  return { source, items: [] as NewsItem[], error: errors.join("; ") || "unavailable" };
}

export async function fetchNews() {
  try {
    const sources = await Promise.all(FEEDS.map((f) => loadSource(f.source, f.urls)));
    const items = sources
      .flatMap((s) => s.items)
      .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
    const failed = sources.every((s) => !s.items.length);
    return {
      sources,
      items,
      fetchedAt: new Date().toISOString(),
      error: failed
        ? "News RSS blocked by browser CORS (GitHub Pages has no API proxy)."
        : null as string | null,
    };
  } catch (e) {
    return {
      sources: [],
      items: [] as NewsItem[],
      fetchedAt: new Date().toISOString(),
      error: explainFetchError(e, "News"),
    };
  }
}
