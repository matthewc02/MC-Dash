export function explainFetchError(e: unknown, what: string) {
  const msg = e instanceof Error ? e.message : String(e);
  if (/failed to fetch|networkerror|load failed|cors|abort/i.test(msg)) {
    return `${what} blocked by browser CORS (GitHub Pages has no API proxy).`;
  }
  return msg || `${what} failed`;
}

export async function fetchText(url: string, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, url: res.url };
  } finally {
    clearTimeout(t);
  }
}
