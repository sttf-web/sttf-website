"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  Trophy,
  Shield,
} from "lucide-react";

type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

type ClubMini = {
  id: string;
  clubName: string;
  logo: string | null;
};

type Match = {
  id: string;
  clubOneScore: number;
  clubTwoScore: number;
  date: string;
  status: MatchStatus;
  clubOne: ClubMini;
  clubTwo: ClubMini;
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "مجدولة",
  LIVE: "مباشر",
  FINISHED: "انتهت",
  POSTPONED: "مؤجلة",
  CANCELLED: "ملغاة",
};

const STATUS_CLASSES: Record<MatchStatus, string> = {
  SCHEDULED: "bg-white/10 text-white/60 border border-white/15",
  LIVE: "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse",
  FINISHED: "bg-[#0a5c35]/60 text-[#1fd47a] border border-[#1fd47a]/30",
  POSTPONED: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/20 line-through",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/matches", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch matches");
        }

        setMatches(data.matches || []);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch matches"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, []);

  const groupedMatches = useMemo(() => {
    return matches.reduce<Record<string, Match[]>>((acc, match) => {
      const key = formatMonthYear(match.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(match);
      return acc;
    }, {});
  }, [matches]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#060d09] text-white">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-[#04361f] px-5 pb-20 pt-32 text-center text-white">
        <BackgroundEffects />

        <div className="relative mx-auto max-w-5xl">
          {/* Icon badge */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1fd47a]/30 bg-[#1fd47a]/10 shadow-[0_0_32px_rgba(31,212,122,0.2)]">
            <CalendarDays className="h-8 w-8 text-[#1fd47a]" />
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            جميع المباريات
          </h1>

          <p className="mt-4 text-base font-medium text-white/50">
            موسم 2025/2026
          </p>

          {/* Decorative line */}
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#1fd47a]/60 to-transparent" />
        </div>
      </section>

      {/* ══ BODY ══ */}
      <section className="relative mx-auto max-w-4xl px-5 py-14">

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/8 bg-white/4">
            <div className="flex items-center gap-3 text-sm font-medium text-white/40">
              <Loader2 className="h-5 w-5 animate-spin text-[#1fd47a]" />
              جاري تحميل المباريات…
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && matches.length === 0 && (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/3 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Shield className="h-7 w-7 text-white/25" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">لا توجد مباريات حالياً</h2>
              <p className="mt-1 text-sm text-white/35">
                سيتم عرض المباريات هنا بعد إضافتها من لوحة التحكم.
              </p>
            </div>
          </div>
        )}

        {/* Matches grouped by month */}
        {!loading && !error && matches.length > 0 && (
          <div className="space-y-14">
            {Object.entries(groupedMatches).map(([month, monthMatches]) => (
              <section key={month}>
                {/* Month divider */}
                <div className="mb-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <span className="rounded-full border border-[#1fd47a]/25 bg-[#1fd47a]/8 px-5 py-1.5 text-sm font-bold text-[#1fd47a]">
                    {month}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>

                <div className="space-y-3">
                  {monthMatches.map((match, i) => (
                    <MatchCard key={match.id} match={match} index={i} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ══ MATCH CARD ══ */
function MatchCard({ match, index }: { match: Match; index: number }) {
  const isLive = match.status === "LIVE";

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0b1a10] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1fd47a]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Live pulse glow */}
      {isLive && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-red-500/40 animate-pulse" />
      )}

      {/* Left accent bar */}
      <div
        className={`absolute inset-y-0 right-0 w-[3px] rounded-l-full transition-all duration-300 group-hover:w-[4px] ${
          match.status === "LIVE"
            ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
            : match.status === "FINISHED"
              ? "bg-[#1fd47a] shadow-[0_0_8px_rgba(31,212,122,0.4)]"
              : "bg-white/15"
        }`}
      />

      <div className="grid items-center gap-4 px-5 py-5 md:grid-cols-[1fr_auto_1fr_auto] md:px-7 md:py-6">

        {/* Club One */}
        <ClubBlock club={match.clubOne} />

        {/* Score */}
        <div className="flex flex-col items-center justify-center gap-2 md:min-w-[120px]">
          <div className="flex items-center gap-3">
            <span
              className={`text-3xl font-black tabular-nums transition-colors ${
                match.clubOneScore > match.clubTwoScore
                  ? "text-[#1fd47a] drop-shadow-[0_0_8px_rgba(31,212,122,0.5)]"
                  : "text-white/60"
              }`}
            >
              {match.clubOneScore}
            </span>

            <span className="text-xl font-black text-white/15">:</span>

            <span
              className={`text-3xl font-black tabular-nums transition-colors ${
                match.clubTwoScore > match.clubOneScore
                  ? "text-[#1fd47a] drop-shadow-[0_0_8px_rgba(31,212,122,0.5)]"
                  : "text-white/60"
              }`}
            >
              {match.clubTwoScore}
            </span>
          </div>

          <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${STATUS_CLASSES[match.status]}`}>
            {STATUS_LABELS[match.status]}
          </span>
        </div>

        {/* Club Two */}
        <ClubBlock club={match.clubTwo} align="end" />

        {/* Date */}
        <div className="flex items-center justify-end gap-1.5 text-xs text-white/30 md:min-w-[110px]">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDate(match.date)}</span>
        </div>
      </div>
    </article>
  );
}

/* ══ CLUB BLOCK ══ */
function ClubBlock({
  club,
  align = "start",
}: {
  club: ClubMini;
  align?: "start" | "end";
}) {
  return (
    <div className={`flex items-center gap-3 ${align === "end" ? "md:flex-row-reverse md:text-right" : ""}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5 transition group-hover:border-white/15">
        {club.logo ? (
          <Image
            src={club.logo}
            alt={club.clubName}
            width={40}
            height={40}
            className="h-full w-full object-contain"
          />
        ) : (
          <Trophy className="h-5 w-5 text-[#1fd47a]/60" />
        )}
      </div>

      <h3 className="text-sm font-bold text-white/80 transition group-hover:text-white md:text-base">
        {club.clubName}
      </h3>
    </div>
  );
}

/* ══ HELPERS ══ */
function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatMonthYear(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
  }).format(new Date(date));
}

function BackgroundEffects() {
  return (
    <>
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      {/* Glow blobs */}
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#1fd47a]/8 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#0a5c35]/50 blur-[120px]" />
      {/* Bottom fade into page */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#060d09] to-transparent" />
    </>
  );
}
