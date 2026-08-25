import { NewsItem } from "./types";

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  const cdata = block.match(new RegExp(`<${name}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${name}>`, "i"));
  if (cdata) return decode(cdata[1]);
  const plain = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (plain) return decode(plain[1]);
  if (name === "link") {
    const href = block.match(/<link[^>]+href=["']([^"']+)["']/i);
    if (href) return href[1];
  }
  return "";
}

function toIso(raw: string) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d.toISOString();
}

export function parseFeed(xml: string, source: string, limit = 8): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = [
    ...xml.matchAll(/<item[\s\S]*?<\/item>/gi),
    ...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi),
  ];
  for (const m of blocks) {
    const block = m[0];
    const title = tag(block, "title");
    const link = tag(block, "link") || tag(block, "id");
    const published =
      tag(block, "pubDate") ||
      tag(block, "published") ||
      tag(block, "updated") ||
      tag(block, "dc:date");
    if (!title) continue;
    items.push({
      source,
      title: title.replace(/\s+[—–-]\s+(Reuters|AP News|Associated Press|BBC News|CNN|The New York Times)$/i, "").trim(),
      link,
      publishedAt: toIso(published),
    });
    if (items.length >= limit) break;
  }
  return items;
}

export async function fetchText(url: string, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": "MatthewsGlobalDashboard/1.0 (+local command center)",
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.8, */*;q=0.5",
      },
      cache: "no-store",
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, url: res.url };
  } finally {
    clearTimeout(t);
  }
}
