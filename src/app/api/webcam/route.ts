import { NextRequest, NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { WebcamMeta } from "@/lib/types";

export const dynamic = "force-dynamic";

type CamDef = {
  id: string;
  label: string;
  location: string;
  sourcePage: string;
  candidates: string[];
};

const CAMS: CamDef[] = [
  {
    id: "creekside",
    label: "Creekside Base",
    location: "Whistler Creekside",
    sourcePage: "https://whistlerpeak.com/cams/creekside/",
    candidates: [
      "https://live9.brownrice.com/cam-images/whistlercreekside.jpg",
      "https://cache.drivebc.ca/bchighwaycam/pub/cameras/829.jpg",
    ],
  },
  {
    id: "village",
    label: "Whistler Village",
    location: "Skier’s Plaza / Village",
    sourcePage: "https://www.whistler.com/webcams/",
    candidates: [
      "https://live9.brownrice.com/cam-images/whistlervillage.jpg",
      "https://cache.drivebc.ca/bchighwaycam/pub/cameras/519.jpg",
    ],
  },
  {
    id: "roundhouse",
    label: "Roundhouse Lodge",
    location: "Whistler Mountain",
    sourcePage: "https://www.whistler.com/webcams/",
    candidates: ["https://live9.brownrice.com/cam-images/whistlerroundhouse.jpg"],
  },
  {
    id: "sundial",
    label: "Sundial Hotel rooftop",
    location: "Whistler Village",
    sourcePage: "https://www.sundialhotel.com/webcam",
    candidates: [],
  },
];

const UA = {
  "User-Agent": "MatthewsGlobalDashboard/1.0 webcam-proxy",
  Accept: "image/jpeg,image/png,image/webp,image/*;q=0.8,*/*;q=0.5",
};

async function firstLiveImage(candidates: string[]) {
  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store", headers: UA, redirect: "follow" });
      if (!res.ok) continue;
      const type = res.headers.get("content-type") || "";
      if (!type.startsWith("image/")) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 2000) continue;
      return { url, type, buf };
    } catch {
      /* next */
    }
  }
  return null;
}

async function sundialStill(): Promise<{ url: string; type: string; buf: Buffer } | { error: string }> {
  try {
    const page = await fetch("https://www.sundialhotel.com/webcam", {
      cache: "no-store",
      headers: { "User-Agent": UA["User-Agent"], Accept: "text/html" },
    });
    const html = await page.text();
    const yt = html.match(/youtube\.com\/embed\/live_stream\?channel=([A-Za-z0-9_-]+)/);
    const jpgs = [...html.matchAll(/https?:\/\/[^"' ]+\.(?:jpg|jpeg|png)/gi)].map((m) => m[0]);
    const liveish = jpgs.filter((u) => /webcam|live|current|snapshot/i.test(u) && !u.includes("Sundial_Hotel_Whistler_Webcam"));
    const hit = await firstLiveImage(liveish);
    if (hit) return hit;
    if (yt) {
      return {
        error:
          "Sundial publishes a YouTube live stream, not a public still JPG. Live video: https://www.sundialhotel.com/webcam",
      };
    }
    return { error: "Sundial Hotel webcam is a YouTube live stream, not a public still JPG. Open https://www.sundialhotel.com/webcam" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "sundial scrape failed" };
  }
}

async function metaFor(cam: CamDef): Promise<WebcamMeta> {
  if (cam.id === "sundial") {
    const still = await sundialStill();
    if ("buf" in still) {
      return {
        id: cam.id,
        label: cam.label,
        location: cam.location,
        sourcePage: cam.sourcePage,
        imageUrl: `/api/webcam?id=${cam.id}&img=1`,
        upstream: still.url,
        ok: true,
        contentType: still.type,
        error: null,
        capturedAt: new Date().toISOString(),
      };
    }
    return {
      id: cam.id,
      label: cam.label,
      location: cam.location,
      sourcePage: cam.sourcePage,
      imageUrl: null,
      upstream: null,
      ok: false,
      contentType: null,
      error: still.error,
      capturedAt: new Date().toISOString(),
    };
  }
  const hit = await firstLiveImage(cam.candidates);
  if (!hit) {
    return {
      id: cam.id,
      label: cam.label,
      location: cam.location,
      sourcePage: cam.sourcePage,
      imageUrl: null,
      upstream: null,
      ok: false,
      contentType: null,
      error: "Camera still unavailable (upstream image missing or blocked)",
      capturedAt: new Date().toISOString(),
    };
  }
  return {
    id: cam.id,
    label: cam.label,
    location: cam.location,
    sourcePage: cam.sourcePage,
    imageUrl: `/api/webcam?id=${cam.id}&img=1`,
    upstream: hit.url,
    ok: true,
    contentType: hit.type,
    error: null,
    capturedAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const img = req.nextUrl.searchParams.get("img");

  if (id && img) {
    const cam = CAMS.find((c) => c.id === id);
    if (!cam) return NextResponse.json({ error: "unknown cam" }, { status: 404 });
    if (cam.id === "sundial") {
      const still = await sundialStill();
      if (!("buf" in still)) return NextResponse.json({ error: still.error }, { status: 502 });
      return new NextResponse(new Uint8Array(still.buf), {
        headers: {
          "Content-Type": still.type,
          "Cache-Control": "public, max-age=30",
        },
      });
    }
    const hit = await firstLiveImage(cam.candidates);
    if (!hit) return NextResponse.json({ error: "cam down" }, { status: 502 });
    return new NextResponse(new Uint8Array(hit.buf), {
      headers: {
        "Content-Type": hit.type,
        "Cache-Control": "public, max-age=30",
      },
    });
  }

  const cams = await cached("webcams:meta", 30 * 1000, () => Promise.all(CAMS.map(metaFor)));
  return NextResponse.json({ cams, fetchedAt: new Date().toISOString() });
}
