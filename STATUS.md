# Matthews Global Dashboard — STATUS (Tuesday)

- Path: /workspace/matthews-global-dashboard
- Port: 3000 (bound 0.0.0.0)
- URL: http://127.0.0.1:3000
- Title: Matthews Global Dashboard-Tuesday
- Date: Tuesday 25 Aug 2026 (America/Vancouver)
- Stack: Next.js 16.3.2 App Router + TypeScript + Tailwind 3
- Dev server: 0.0.0.0:3000

## Tuesday 25 Aug 2026 changes

- UI title is exactly Matthews Global Dashboard-Tuesday. Header badge: Tuesday · 25 Aug 2026.
- Artifact ring is task-centric: today’s local tasks plus Deck / Bathroom / Shop activity. Click a node for detail. Empty/awaiting if nothing is logged. Gentle orbit + node float. No generic news/stock/weather dump on the ring.
- New Family work panel with three streams named exactly Deck, Bathroom, Shop. Each shows latest timestamp + note + optional owner, add-line form, localStorage persist (`mgd.familyWork.v1`). Seeded empty/awaiting — Dusty confirmed no sourced items. No invented jobs, owners, or last actions. family-work.json was not present.

## Live right now

- Weather: Open-Meteo for Vancouver, BC (49.2827, -123.1207) and Whistler, BC. Current + hourly today + 7-day. Times as America/Vancouver wall clock. Refresh 10 min.
- Stocks: Yahoo chart API (Stooq fallback). Default watchlist ^GSPC ^IXIC ^GSPTSE AAPL MSFT GOOGL AMZN NVDA TSLA BTC-USD. Price, change %, sparkline. Editable, localStorage. Refresh 60s.
- News: Reuters, AP, BBC World, CBC RSS. Source + time + link. Refresh 5 min.
- Universal networks: CBC, BBC, Reuters, AP, CNN, NYT latest headline.
- dmca.com monitor: live GET. HTTP status, TTFB/total ms, homepage title scrape, session latency sparkline. No invented uptime %.
- Whistler cameras (proxied stills):
  - Creekside Base — https://live9.brownrice.com/cam-images/whistlercreekside.jpg (Whistler Peak / Tourism Whistler)
  - Whistler Village — https://live9.brownrice.com/cam-images/whistlervillage.jpg (Tourism Whistler webcams)
  - Roundhouse Lodge — https://live9.brownrice.com/cam-images/whistlerroundhouse.jpg
  - DriveBC fallbacks if brownrice is down: cache.drivebc.ca cameras 519 (Village Gate) and 829 (Lake Placid / Creekside)

## Honest empty-state (on purpose)

- Top emails: Gmail is not connected. No messages invented. Optional local priority notes.
- Calendar: empty until a public ICS URL is pasted. Live Pacific clock is shown. No meetings invented.
- Artifact ring: awaiting until a local task or family-work line exists.
- Family work (Deck, Bathroom, Shop): awaiting first activity. No sourced jobs for Tuesday.
- Sundial Hotel cam: page is a YouTube live stream, not a public still JPG. Panel reports that and links https://www.sundialhotel.com/webcam
- Family (Brillianna, Aurora, Matthison, Ryker, Linda, Laura) and cats (Jax, Atom, Mau): name + editable local note only. No photos, ages, or invented facts.

## APIs

- GET /api/weather
- GET /api/quotes?symbols=
- GET /api/news
- GET /api/networks
- GET /api/health
- GET /api/webcam and /api/webcam?id=creekside&img=1
- GET /api/calendar?url=

## How to run later

From /workspace/matthews-global-dashboard: install dependencies, start the dev script (0.0.0.0:3000), or run the production build then start.
