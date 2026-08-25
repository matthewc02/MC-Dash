# Matthews Global Dashboard

Dark cinematic daily command center for Matthew Carson (America/Vancouver). Desktop wall display first.

Public URL: https://matthewc02.github.io/MC-Dash/

Static Next.js export for GitHub Pages (`output: 'export'`, `basePath: /MC-Dash`). No Node server and no `/api` routes.

## Run

From this directory:

1. install dependencies with the Node package manager
2. start the dev script (binds 0.0.0.0:3000)
3. production static export: run the build script (writes `out/`)

Open http://127.0.0.1:3000 locally. GitHub Pages serves the export under `/MC-Dash/`.

## Live vs empty-state

Live: Open-Meteo weather (Vancouver + Whistler), Whistler webcam stills as direct image URLs (brownrice / DriveBC fallbacks).

Browser-fetched, honest empty/error if CORS blocks: Yahoo/Stooq quotes, RSS news (Reuters, AP, BBC World, CBC), network strip (CBC, BBC, Reuters, AP, CNN, NYT), dmca.com HTTP probe, optional public ICS calendar.

Local (day one): tasks, family notes, cat notes, stock watchlist in localStorage.

Empty on purpose: Gmail inbox is not connected (local priority notes only). Calendar stays empty until a public ICS URL is pasted. No invented emails, meetings, quotes, or uptime percentages.

## Webcam stills

- Creekside: https://live9.brownrice.com/cam-images/whistlercreekside.jpg (Whistler Peak / Tourism Whistler)
- Village: https://live9.brownrice.com/cam-images/whistlervillage.jpg
- Roundhouse: https://live9.brownrice.com/cam-images/whistlerroundhouse.jpg
- DriveBC fallbacks: Hwy 99 Village Gate camera 519 and Lake Placid / Creekside camera 829
- Sundial Hotel: YouTube live stream only, no public still JPG; the panel reports that

Refresh: weather 10m, stocks 60s, news 5m, dmca 30s, webcams 5m, clock 1s.
