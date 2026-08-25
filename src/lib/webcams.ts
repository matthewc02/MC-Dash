import { WebcamMeta } from "@/lib/types";

export type WebcamDef = {
  id: string;
  label: string;
  location: string;
  sourcePage: string;
  candidates: string[];
  note?: string;
};

export const WEBCAMS: WebcamDef[] = [
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
    note: "Sundial Hotel webcam is a YouTube live stream, not a public still JPG. Open https://www.sundialhotel.com/webcam",
  },
];

export function listWebcams(): { cams: WebcamMeta[]; fetchedAt: string } {
  const capturedAt = new Date().toISOString();
  const cams: WebcamMeta[] = WEBCAMS.map((cam) => {
    const primary = cam.candidates[0] ?? null;
    if (!primary) {
      return {
        id: cam.id,
        label: cam.label,
        location: cam.location,
        sourcePage: cam.sourcePage,
        imageUrl: null,
        upstream: null,
        ok: false,
        contentType: null,
        error: cam.note || "Camera still unavailable (no public still JPG)",
        capturedAt,
      };
    }
    return {
      id: cam.id,
      label: cam.label,
      location: cam.location,
      sourcePage: cam.sourcePage,
      imageUrl: primary,
      upstream: primary,
      ok: true,
      contentType: "image/jpeg",
      error: null,
      capturedAt,
    };
  });
  return { cams, fetchedAt: capturedAt };
}

export function cacheBust(url: string, tick: number) {
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}t=${tick}`;
}
