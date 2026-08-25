import { DEFAULT_WATCHLIST } from "@/lib/constants";
import { Quote } from "@/lib/types";
import { explainFetchError } from "@/lib/browserFetch";

const STOOQ: Record<string, string> = {
  AAPL: "aapl.us",
  MSFT: "msft.us",
  GOOGL: "googl.us",
  AMZN: "amzn.us",
  NVDA: "nvda.us",
  TSLA: "tsla.us",
  "^GSPC": "^spx",
  "^IXIC": "^ndq",
  "^GSPTSE": "^tsx",
  "BTC-USD": "btcusd",
};

async function yahoo(symbol: string): Promise<Quote> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`yahoo ${res.status}`);
  const j = await res.json();
  const result = j.chart?.result?.[0];
  if (!result) throw new Error("no chart");
  const meta = result.meta ?? {};
  const closes: Array<number | null> = result.indicators?.quote?.[0]?.close ?? [];
  const spark = closes.filter((n: number | null): n is number => typeof n === "number" && Number.isFinite(n));
  const price = typeof meta.regularMarketPrice === "number" ? meta.regularMarketPrice : spark.at(-1) ?? null;
  const prev = typeof meta.chartPreviousClose === "number" ? meta.chartPreviousClose : spark.at(-2) ?? null;
  const changePct =
    price != null && prev ? ((price - prev) / prev) * 100 : typeof meta.regularMarketChangePercent === "number" ? meta.regularMarketChangePercent : null;
  return {
    symbol,
    name: meta.shortName || meta.longName || symbol,
    price,
    changePct,
    currency: meta.currency || "USD",
    spark,
    ok: true,
  };
}

async function stooq(symbol: string): Promise<Quote> {
  const s = STOOQ[symbol] ?? `${symbol.replace("^", "").toLowerCase()}.us`;
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(s)}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`stooq ${res.status}`);
  const text = await res.text();
  const line = text.trim().split("\n")[1];
  if (!line) throw new Error("empty stooq");
  const parts = line.split(",");
  const close = Number(parts[6]);
  const open = Number(parts[3]);
  if (!Number.isFinite(close)) throw new Error("bad stooq");
  const changePct = Number.isFinite(open) && open ? ((close - open) / open) * 100 : null;
  return {
    symbol,
    name: symbol,
    price: close,
    changePct,
    currency: "USD",
    spark: [],
    ok: true,
  };
}

async function one(symbol: string): Promise<Quote> {
  try {
    return await yahoo(symbol);
  } catch (e) {
    try {
      return await stooq(symbol);
    } catch {
      return {
        symbol,
        name: symbol,
        price: null,
        changePct: null,
        currency: "USD",
        spark: [],
        ok: false,
        error: explainFetchError(e, `Quote ${symbol}`),
      };
    }
  }
}

export async function fetchQuotes(symbolsInput?: string[]) {
  const symbols = (symbolsInput && symbolsInput.length ? symbolsInput : [...DEFAULT_WATCHLIST])
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 16);
  try {
    const quotes = await Promise.all(symbols.map(one));
    const allFailed = quotes.length > 0 && quotes.every((q) => !q.ok);
    return {
      quotes,
      fetchedAt: new Date().toISOString(),
      error: allFailed
        ? "Quotes blocked by browser CORS (Yahoo/Stooq are not CORS-open; GitHub Pages has no API proxy)."
        : null as string | null,
    };
  } catch (e) {
    return {
      quotes: [] as Quote[],
      fetchedAt: new Date().toISOString(),
      error: explainFetchError(e, "Quotes"),
    };
  }
}
