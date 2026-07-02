"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Mail,
  Newspaper,
  ShieldCheck,
  Trophy,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import AddPlayersToClub from "@/components/admin/AddPlayersToClub";
import AdminLeagueTable from "@/components/admin/AdminLeagueTable";
import CreateClubForm from "@/components/admin/CreateClubForm";
import CreateMatchForm from "@/components/admin/CreateMatchForm";
import CreateNewsForm from "@/components/admin/CreateNewsForm";
import CreateRefereeForm from "@/components/admin/CreateRefereeForm";
import ManageNewsPanel from "@/components/admin/ManageNewsPanel";
import MessagesList from "@/components/admin/MessagesList";
import ManageClubsPanel from "@/components/admin/ManageClubsPanel";
import ManageMatchesPanel from "@/components/admin/ManageMatchesPanel";
import ManagePlayersPanel from "@/components/admin/ManagePlayersPanel";

type AdminTabId =
  | "clubs"
  | "players"
  | "matches"
  | "referees"
  | "news"
  | "messages"
  | "league";

type AdminTab = {
  id: AdminTabId;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const ADMIN_TABS: AdminTab[] = [
  {
    id: "clubs",
    label: "Clubs",
    title: "Club Management",
    description: "Create clubs and manage federation club records.",
    icon: Building2,
  },
  {
    id: "players",
    label: "Players",
    title: "Player Management",
    description: "Add players to clubs and manage player assignments.",
    icon: UsersRound,
  },
  {
    id: "matches",
    label: "Matches",
    title: "Match Management",
    description: "Create fixtures, schedules, and match records.",
    icon: CalendarDays,
  },
  {
    id: "referees",
    label: "Referees",
    title: "Referee Management",
    description: "Create and manage referee profiles.",
    icon: ShieldCheck,
  },
  {
    id: "news",
    label: "News",
    title: "News Management",
    description: "Create, edit, publish, or delete federation news articles.",
    icon: Newspaper,
  },
  {
    id: "messages",
    label: "Messages",
    title: "Messages",
    description: "View contact messages submitted through the website.",
    icon: Mail,
  },
  {
    id: "league",
    label: "League",
    title: "League Table",
    description: "Manage and review the federation league standings.",
    icon: Trophy,
  },
];

export default function Admin() {
  const [activeTabId, setActiveTabId] = useState<AdminTabId>("clubs");

  const activeTab = useMemo(() => {
    const foundTab = ADMIN_TABS.find(
      (tab: AdminTab) => tab.id === activeTabId
    );

    return foundTab ?? ADMIN_TABS[0];
  }, [activeTabId]);

  const ActiveIcon = activeTab.icon;

  return (
    <main className="relative mt-10 min-h-screen overflow-hidden bg-[linear-gradient(135deg,#002b23_0%,#005043_45%,#007a62_80%,#003d34_100%)]">
      {/* Background dot grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:32px_32px]" />

      {/* Background glow blobs */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00c896" stopOpacity="0.13" />
            <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00c896" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#00c896" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="-5%" cy="10%" rx="420" ry="320" fill="url(#blob1)" />
        <ellipse cx="105%" cy="90%" rx="480" ry="340" fill="url(#blob2)" />

        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="white"
          strokeOpacity="0.04"
          strokeWidth="1"
        />
        <line
          x1="50%"
          y1="0"
          x2="50%"
          y2="100%"
          stroke="white"
          strokeOpacity="0.04"
          strokeWidth="1"
        />

        <circle cx="8%" cy="18%" r="38" fill="white" fillOpacity="0.025" />
        <circle cx="92%" cy="12%" r="22" fill="white" fillOpacity="0.03" />
        <circle cx="85%" cy="75%" r="50" fill="white" fillOpacity="0.02" />
        <circle cx="15%" cy="82%" r="28" fill="white" fillOpacity="0.025" />
      </svg>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        {/* Header */}
        <div className="mb-8">
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            STTF Admin Portal
          </p>

          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-[#00e0aa] ring-1 ring-white/[0.12]">
                  <ActiveIcon className="h-5 w-5" />
                </div>

                <h1 className="m-0 text-2xl font-bold tracking-[-0.4px] text-white md:text-[28px]">
                  {activeTab.title}
                </h1>
              </div>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                {activeTab.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 rounded-[24px] border border-white/[0.12] bg-white/[0.07] p-2 shadow-[0_24px_48px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl">
          <div className="flex flex-wrap gap-2">
            {ADMIN_TABS.map((tab: AdminTab) => {
              const Icon = tab.icon;
              const isActive = activeTabId === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className={`flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-[#00c896] to-[#008f6a] text-white shadow-[0_8px_24px_rgba(0,200,150,0.3)]"
                      : "text-white/60 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTabId === "clubs" && (
            <>
            <CreateClubForm />
            <ManageClubsPanel/>
            </>
          )}

          {activeTabId === "players" && (
            <>
              <ManagePlayersPanel />
              <AddPlayersToClub />
            </>
          )}

          {activeTabId === "matches" && (
            <>
              <ManageMatchesPanel />
              <CreateMatchForm />
            </>
          )}

          {activeTabId === "referees" && <CreateRefereeForm />}

          {activeTabId === "news" && (
            <>
              <ManageNewsPanel />
              <CreateNewsForm />
            </>
          )}

          {activeTabId === "messages" && <MessagesList />}

          {activeTabId === "league" && <AdminLeagueTable />}
        </div>
      </div>
    </main>
  );
}