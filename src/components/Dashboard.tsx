"use client";

import { ArtifactProvider } from "@/context/ArtifactContext";
import { WorkProvider } from "@/context/WorkContext";
import ArtifactRing from "./ArtifactRing";
import CalendarPanel from "./CalendarPanel";
import DetailDrawer from "./DetailDrawer";
import DmcaPanel from "./DmcaPanel";
import EmailsPanel from "./EmailsPanel";
import FamilyWorkPanel from "./FamilyWorkPanel";
import NetworksStrip from "./NetworksStrip";
import NewsPanel from "./NewsPanel";
import { CatPanels, FamilyPanels } from "./PeopleNotes";
import StocksPanel from "./StocksPanel";
import TasksPanel from "./TasksPanel";
import TopBar from "./TopBar";
import WeatherPanel from "./WeatherPanel";
import WebcamsPanel from "./WebcamsPanel";

export default function Dashboard() {
  return (
    <ArtifactProvider>
      <WorkProvider>
        <div className="relative min-h-screen bg-ink-950 bg-grid text-white">
          <div className="vignette pointer-events-none absolute inset-0" />
          <div className="scanlines pointer-events-none absolute inset-0" />
          <main className="relative mx-auto max-w-[1680px] space-y-4 px-4 py-4 md:px-6 md:py-5">
            <TopBar />
            <div className="grid items-start gap-4 lg:grid-cols-12">
              <div className="order-first lg:col-span-7">
                <ArtifactRing />
              </div>
              <div className="space-y-4 lg:col-span-5">
                <TasksPanel />
                <EmailsPanel />
                <CalendarPanel />
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <StocksPanel />
              <DmcaPanel />
            </div>
            <FamilyWorkPanel />
            <NetworksStrip />
            <div className="grid gap-4 lg:grid-cols-2">
              <NewsPanel />
              <WeatherPanel />
            </div>
            <WebcamsPanel />
            <FamilyPanels />
            <CatPanels />
            <footer className="pb-6 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              Matthews Global Dashboard-Tuesday · 25 Aug 2026 · local persistence · live feeds never fabricate inbox or calendar
            </footer>
          </main>
          <DetailDrawer />
        </div>
      </WorkProvider>
    </ArtifactProvider>
  );
}
