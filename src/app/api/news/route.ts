import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { fetchText, parseFeed } from "@/lib/rss";
import { NewsItem } from "@/lib/types";

export const dynamic = "force-dynamic";

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
      errors.push(`${url} → ${e instanceof Error ? e.message : "fail"}`);
    }
  }
  return { source, items: [] as NewsItem[], error: errors.join("; ") || "unavailable" };
}

export async function GET() {
  try {
    const payload = await cached("news:world:v2", 2 * 60 * 1000, async () => {
      const sources = await Promise.all(FEEDS.map((f) => loadSource(f.source, f.urls)));
      const items = sources
        .flatMap((s) => s.items)
        .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
      return { sources, items, fetchedAt: new Date().toISOString() };
    });
    return NextResponse.json(payload);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "news failed", fetchedAt: new Date().toISOString() },
      { status: 502 },
    );
  }
}
