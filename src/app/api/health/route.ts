import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TARGET = "https://www.dmca.com";

function extractTitle(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim().slice(0, 160) : null;
}

export async function GET() {
  const started = Date.now();
  let ttfbMs: number | null = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(TARGET, {
      method: "GET",
      cache: "no-store",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": "MatthewsGlobalDashboard/1.0 site-monitor",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    ttfbMs = Date.now() - started;
    const buf = await res.arrayBuffer();
    clearTimeout(timer);
    const totalMs = Date.now() - started;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 80_000));
    return NextResponse.json({
      url: TARGET,
      ok: res.ok,
      status: res.status,
      ttfbMs,
      totalMs,
      bytes: buf.byteLength,
      title: extractTitle(html),
      error: res.ok ? null : `HTTP ${res.status}`,
      checkedAt: new Date().toISOString(),
      note: "Live probe of this session only. No historical uptime percentage is computed or displayed.",
    });
  } catch (e) {
    return NextResponse.json({
      url: TARGET,
      ok: false,
      status: null,
      ttfbMs,
      totalMs: Date.now() - started,
      bytes: 0,
      title: null,
      error: e instanceof Error ? e.message : "request failed",
      checkedAt: new Date().toISOString(),
      note: "Live probe of this session only. No historical uptime percentage is computed or displayed.",
    });
  }
}
