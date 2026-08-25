import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { fetchText, parseFeed } from "@/lib/rss";

export const dynamic = "force-dynamic";

const NETWORKS: { id: string; name: string; site: string; feeds: string[] }[] = [
  { id: "cbc", name: "CBC", site: "https://www.cbc.ca", feeds: ["https://www.cbc.ca/webfeed/rss/rss-topstories"] },
  { id: "bbc", name: "BBC", site: "https://www.bbc.com/news", feeds: ["https://feeds.bbci.co.uk/news/rss.xml"] },
  {
    id: "reuters",
    name: "Reuters",
    site: "https://www.reuters.com",
    feeds: ["https://news.google.com/rss/search?q=site:reuters.com&hl=en-CA&gl=CA&ceid=CA:en"],
  },
  {
    id: "ap",
    name: "AP",
    site: "https://apnews.com",
    feeds: ["https://news.google.com/rss/search?q=site:apnews.com&hl=en-CA&gl=CA&ceid=CA:en"],
  },
  { id: "cnn", name: "CNN", site: "https://www.cnn.com", feeds: ["http://rss.cnn.com/rss/cnn_topstories.rss"] },
  { id: "nyt", name: "NYT", site: "https://www.nytimes.com", feeds: ["https://rss.nytimes.com/services/xml/rss/nyt/World.xml"] },
];

export async function GET() {
  const payload = await cached("networks:v2", 2 * 60 * 1000, async () => {
    const networks = await Promise.all(
      NETWORKS.map(async (n) => {
        for (const feed of n.feeds) {
          try {
            const r = await fetchText(feed, 10000);
            if (!r.ok) continue;
            const items = parseFeed(r.text, n.name, 1);
            if (items[0]) {
              return {
                ...n,
                up: true,
                headline: items[0].title,
                link: items[0].link,
                publishedAt: items[0].publishedAt,
                error: null as string | null,
              };
            }
          } catch {
            /* try next */
          }
        }
        try {
          const ping = await fetchText(n.site, 8000);
          return {
            ...n,
            up: ping.ok,
            headline: ping.ok ? "Site reachable — no RSS headline" : "Unreachable",
            link: n.site,
            publishedAt: null as string | null,
            error: ping.ok ? "rss empty" : `HTTP ${ping.status}`,
          };
        } catch (e) {
          return {
            ...n,
            up: false,
            headline: "Unreachable",
            link: n.site,
            publishedAt: null as string | null,
            error: e instanceof Error ? e.message : "fail",
          };
        }
      }),
    );
    return { networks, fetchedAt: new Date().toISOString() };
  });
  return NextResponse.json(payload);
}
