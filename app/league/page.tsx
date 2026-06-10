"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  Loader2,
  Shield,
  Trophy,
  TrendingUp,
} from "lucide-react";

type LeagueStanding = {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string | null;
  clubLocation: string | null;
  matchesPlayed: number;
  won: number;
  lost: number;
  score: string;
  scoreDifference: number;
  points: number;
  form: string[];
  position: number;
};

export default function LeaguePage() {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLeagueStandings() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/league", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch league standings");
        }

        setStandings(data.standings || []);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch league standings"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLeagueStandings();
  }, []);

  return (
    <main dir="rtl" className="min-h-screen bg-[#060d09] text-white">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-[#04361f] px-5 pb-20 pt-28 text-center text-white">
        <BackgroundEffects />

        <div className="relative mx-auto max-w-5xl">
          {/* Trophy badge */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] border border-[#1fd47a]/30 bg-[#1fd47a]/10 shadow-[0_0_40px_rgba(31,212,122,0.18)]">
            <Trophy className="h-10 w-10 text-[#1fd47a]" />
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">
            Jahez Premier Division
          </h1>

          <p className="mt-3 text-xl font-black text-white/70">
            موسم 2025/2026
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/40">
            جدول ترتيب أندية دوري جاهز لكرة الطاولة للمحترفين
          </p>

          {/* Decorative line */}
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#1fd47a]/60 to-transparent" />
        </div>
      </section>

      {/* ══ BODY ══ */}
      <section className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">

        {/* Table card */}
        <div className="overflow-hidden rounded-[24px] border border-white/8 bg-[#0b1a10]">

          {/* Card header */}
          <div className="border-b border-white/8 px-6 py-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1fd47a]">الدوري</p>
            <h2 className="mt-1.5 text-2xl font-black text-white">جدول الترتيب</h2>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-white/40">
                <Loader2 className="h-5 w-5 animate-spin text-[#1fd47a]" />
                جاري تحميل جدول الترتيب…
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="m-5 flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && standings.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Shield className="h-7 w-7 text-white/25" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">لا يوجد ترتيب حالياً</h3>
                <p className="mt-1 max-w-md text-sm text-white/35">
                  سيتم تحديث جدول الترتيب تلقائياً عند إضافة مباريات منتهية من لوحة التحكم.
                </p>
              </div>
            </div>
          )}

          {/* Tables */}
          {!loading && !error && standings.length > 0 && (
            <>
              <DesktopLeagueTable standings={standings} />
              <MobileLeagueCards standings={standings} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

/* ══ DESKTOP TABLE ══ */
function DesktopLeagueTable({ standings }: { standings: LeagueStanding[] }) {
  return (
    <div className="hidden p-5 md:block">
      {/* Header row */}
      <div className="grid grid-cols-[64px_1.8fr_repeat(5,1fr)_1.4fr] items-center rounded-xl bg-[#1fd47a]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.1em] text-[#1fd47a]">
        <div>#</div>
        <div>النادي</div>
        <div className="text-center">لعب</div>
        <div className="text-center">فوز</div>
        <div className="text-center">خسارة</div>
        <div className="text-center">+/-</div>
        <div className="text-center">النقاط</div>
        <div className="text-center">الشكل</div>
      </div>

      {/* Rows */}
      <div className="mt-2 space-y-1.5">
        {standings.map((standing, i) => (
          <LeagueRow key={standing.id} standing={standing} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ══ LEAGUE ROW ══ */
function LeagueRow({ standing, index }: { standing: LeagueStanding; index: number }) {
  const isTopThree = standing.position <= 3;

  return (
    <Link
      href={`/clubs/${standing.clubId}`}
      className={`grid grid-cols-[64px_1.8fr_repeat(5,1fr)_1.4fr] items-center rounded-xl border px-5 py-4 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
        isTopThree
          ? "border-[#1fd47a]/25 bg-[#1fd47a]/8 hover:bg-[#1fd47a]/12"
          : "border-white/6 bg-white/4 hover:border-white/12 hover:bg-white/7"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Position */}
      <div className="flex items-center gap-2">
        {isTopThree ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1fd47a] text-xs font-black text-[#060d09] shadow-[0_0_10px_rgba(31,212,122,0.4)]">
            {standing.position}
          </span>
        ) : (
          <span className="text-base font-black text-white/50">{standing.position}</span>
        )}
      </div>

      {/* Club */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
          {standing.clubLogo ? (
            <Image
              src={standing.clubLogo}
              alt={standing.clubName}
              width={34}
              height={34}
              className="h-full w-full object-contain"
            />
          ) : (
            <Shield className="h-5 w-5 text-[#1fd47a]/50" />
          )}
        </div>
        <div>
          <p className="font-bold text-white">{standing.clubName}</p>
          {standing.clubLocation && (
            <p className="mt-0.5 text-xs text-white/30">{standing.clubLocation}</p>
          )}
        </div>
      </div>

      <TableNumber value={standing.matchesPlayed} />
      <TableNumber value={standing.won} className="text-[#1fd47a]" />
      <TableNumber value={standing.lost} className="text-red-400" />
      <TableNumber value={standing.score} className="text-white/60" />

      {/* Points */}
      <div className="text-center">
        <span className="text-base font-black text-[#1fd47a]">{standing.points}</span>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center gap-1">
        <FormDots form={standing.form} />
      </div>
    </Link>
  );
}

function TableNumber({
  value,
  className = "text-white/70",
}: {
  value: number | string;
  className?: string;
}) {
  return (
    <div className={`text-center text-sm font-bold ${className}`}>{value}</div>
  );
}

/* ══ MOBILE CARDS ══ */
function MobileLeagueCards({ standings }: { standings: LeagueStanding[] }) {
  return (
    <div className="space-y-3 p-4 md:hidden">
      {standings.map((standing) => {
        const isTopThree = standing.position <= 3;
        return (
          <Link
            key={standing.id}
            href={`/clubs/${standing.clubId}`}
            className={`block rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
              isTopThree
                ? "border-[#1fd47a]/25 bg-[#1fd47a]/8"
                : "border-white/8 bg-white/4 hover:border-white/12"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Position */}
                {isTopThree ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1fd47a] text-sm font-black text-[#060d09] shadow-[0_0_10px_rgba(31,212,122,0.35)]">
                    {standing.position}
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-black text-white/40">
                    {standing.position}
                  </span>
                )}

                {/* Logo */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
                  {standing.clubLogo ? (
                    <Image
                      src={standing.clubLogo}
                      alt={standing.clubName}
                      width={36}
                      height={36}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Shield className="h-5 w-5 text-[#1fd47a]/50" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white">{standing.clubName}</h3>
                  {standing.clubLocation && (
                    <p className="mt-0.5 text-xs text-white/30">{standing.clubLocation}</p>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-left">
                <p className="text-2xl font-black text-[#1fd47a]">{standing.points}</p>
                <p className="text-xs text-white/30">نقطة</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-2 border-t border-white/8 pt-4 text-center">
              <MobileStat label="لعب" value={standing.matchesPlayed} />
              <MobileStat label="فوز" value={standing.won} green />
              <MobileStat label="خسارة" value={standing.lost} red />
              <MobileStat label="+/-" value={standing.score} />
            </div>

            {/* Form row */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/6 bg-white/4 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1fd47a]">
                <TrendingUp className="h-3.5 w-3.5" />
                الشكل
              </div>
              <FormDots form={standing.form} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ══ MOBILE STAT ══ */
function MobileStat({
  label,
  value,
  green,
  red,
}: {
  label: string;
  value: number | string;
  green?: boolean;
  red?: boolean;
}) {
  return (
    <div>
      <p className={`text-lg font-black ${green ? "text-[#1fd47a]" : red ? "text-red-400" : "text-white/70"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-white/30">{label}</p>
    </div>
  );
}

/* ══ FORM DOTS ══ */
function FormDots({ form }: { form: string[] }) {
  // Always render exactly 5 dots (W/L), padding with placeholders when missing
  const safeForm = form.length > 0 ? form.slice(0, 5) : [];
  const padded = Array.from({ length: 5 }, (_, i) => safeForm[i] ?? "-");

  if (padded.every((x) => x === "-")) {
    return <span className="text-xs text-white/25">—</span>;
  }

  return (
    <>
      {padded.map((item, index) => {
        const isWin = item === "W";
        const isLoss = item === "L";

        return (
          <span
            key={`${item}-${index}`}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
              isWin
                ? "bg-[#1fd47a]/20 text-[#1fd47a] ring-1 ring-[#1fd47a]/40"
                : isLoss
                  ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                  : "bg-white/5 text-white/15 ring-1 ring-white/10"
            }`}
          >
            {isWin ? "W" : isLoss ? "L" : ""}
          </span>
        );
      })}
    </>
  );
}

/* ══ BACKGROUND ══ */
function BackgroundEffects() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#1fd47a]/8 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#0a5c35]/50 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#060d09] to-transparent" />
    </>
  );
}
