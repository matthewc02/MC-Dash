# Matthews Global Dashboard

Dark cinematic daily command center for Matthew Carson (America/Vancouver). Desktop wall display first.

## Run

From this directory:

1. install dependencies with the Node package manager
2. start the dev script (binds 0.0.0.0:3000)
3. production: run the build script, then the start script

Open http://127.0.0.1:3000

## Live vs empty-state

Live: Open-Meteo weather (Vancouver + Whistler), Yahoo/Stooq quotes, RSS news (Reuters, AP, BBC World, CBC), network strip (CBC, BBC, Reuters, AP, CNN, NYT), dmca.com HTTP probe, Whistler webcam stills via /api/webcam.

Local (day one): tasks, family notes, cat notes, stock watchlist in localStorage.

Empty on purpose: Gmail inbox is not connected (local priority notes only). Calendar stays empty until a public ICS URL is pasted. No invented emails, meetings, or uptime percentages.

## Webcam stills

- Creekside: https://live9.brownrice.com/cam-images/whistlercreekside.jpg (Whistler Peak / Tourism Whistler)
- Village: https://live9.brownrice.com/cam-images/whistlervillage.jpg
- Roundhouse: https://live9.brownrice.com/cam-images/whistlerroundhouse.jpg
- DriveBC fallbacks: Hwy 99 Village Gate camera 519 and Lake Placid / Creekside camera 829
- Sundial Hotel: YouTube live stream only, no public still JPG; the panel reports that

## API

- GET /api/weather
- GET /api/quotes?symbols=
- GET /api/news
- GET /api/networks
- GET /api/health
- GET /api/webcam and /api/webcam?id=creekside&img=1
- GET /api/calendar?url=

Refresh: weather 10m, stocks 60s, news 5m, dmca 30s, webcams 5m, clock 1s.
