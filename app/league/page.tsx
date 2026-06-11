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
  ChevronLeft,
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
      <section className="relative overflow-hidden bg-[#00704C] px-5 pb-16 pt-28">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          <Image
            src="/league.png"
            alt="League"
            width={500}
            height={320}
            priority
            className="h-auto w-full max-w-[500px] object-contain"
          />
        </div>
      </section>
{/* ══ BODY ══ */}
<section className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
  {/* Header */}
  <div className="mb-6 flex items-center justify-center md:relative">
    <h2 className="text-center text-4xl font-black text-white md:text-5xl">
      جدول الترتيب
    </h2>

    <div className="mt-4 flex justify-center md:absolute md:right-0 md:top-1/2 md:mt-0 md:-translate-y-1/2">
      <span className="rounded-md bg-[#22d866] px-12 py-2 text-sm font-black text-[#062314]">
        2026 \ 2025
      </span>
    </div>
  </div>

  {/* Loading */}
  {loading && (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-medium text-white/50">
        <Loader2 className="h-5 w-5 animate-spin text-[#1fd47a]" />
        جاري تحميل جدول الترتيب…
      </div>
    </div>
  )}

  {/* Error */}
  {error && (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      {error}
    </div>
  )}

  {/* Empty */}
  {!loading && !error && standings.length === 0 && (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 p-10 text-center">
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
</section>
    </main>
  );
}

/* ══ DESKTOP TABLE ══ */
function DesktopLeagueTable({ standings }: { standings: LeagueStanding[] }) {
  return (
    <div className="hidden md:block">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1.3fr_repeat(5,1fr)_1.3fr_44px] items-center rounded-xl bg-[#07944f] px-6 py-5 text-sm font-black text-white">
        <div className="text-center">المستوى</div>
        <div className="text-center">النادي</div>
        <div className="text-center">لعب</div>
        <div className="text-center">فوز</div>
        <div className="text-center">خسارة</div>
        <div className="text-center">+/-</div>
        <div className="text-center">النقاط</div>
        <div className="text-center">الشكل</div>
        <div />
      </div>

      {/* Rows */}
      <div className="mt-8 space-y-6">
        {standings.map((standing, i) => (
          <LeagueRow key={standing.id} standing={standing} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ══ LEAGUE ROW ══ */
function LeagueRow({
  standing,
  index,
}: {
  standing: LeagueStanding;
  index: number;
}) {
  const isTopFour = standing.position <= 4;

  return (
    <Link
      href={`/clubs/${standing.clubId}`}
      className={`grid min-h-[72px] grid-cols-[1fr_1.3fr_repeat(5,1fr)_1.3fr_44px] items-center rounded-xl border px-6 py-4 text-sm transition duration-200 hover:-translate-y-0.5 ${
        isTopFour
          ? "border-[#18d96d] bg-[#003818] text-white"
          : "border-[#18d96d] bg-[#e9edf0] text-[#092419]"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Position */}
      <div className="text-center text-2xl font-black">
        {standing.position}
      </div>

      {/* Club */}
      <div className="flex items-center justify-center">
        <div className="flex h-11 w-11 items-center justify-center">
          {standing.clubLogo ? (
            <Image
              src={standing.clubLogo}
              alt={standing.clubName}
              width={44}
              height={44}
              className="h-full w-full object-contain"
            />
          ) : (
            <Shield
              className={`h-7 w-7 ${
                isTopFour ? "text-white/60" : "text-[#07944f]"
              }`}
            />
          )}
        </div>
      </div>

      <TableNumber value={standing.matchesPlayed} isDark={isTopFour} />
      <TableNumber value={standing.won} isDark={isTopFour} />
      <TableNumber value={standing.lost} isDark={isTopFour} />
      <TableNumber value={standing.score} isDark={isTopFour} />
      <TableNumber value={standing.points} isDark={isTopFour} />

      {/* Form */}
      <div className="flex items-center justify-center gap-1">
        <FormDots form={standing.form} />
      </div>

      {/* Arrow */}
      <div className="flex justify-end">
        <ChevronLeft
          className={`h-6 w-6 ${
            isTopFour ? "text-[#18d96d]" : "text-[#092419]"
          }`}
        />
      </div>
    </Link>
  );
}

function TableNumber({
  value,
  isDark,
}: {
  value: number | string;
  isDark: boolean;
}) {
  return (
    <div
      className={`text-center text-sm font-black ${
        isDark ? "text-white" : "text-[#20c56c]"
      }`}
    >
      {value}
    </div>
  );
}

/* ══ MOBILE CARDS ══ */
function MobileLeagueCards({ standings }: { standings: LeagueStanding[] }) {
  return (
    <div className="space-y-4 md:hidden">
      {standings.map((standing) => {
        const isTopFour = standing.position <= 4;

        return (
          <Link
            key={standing.id}
            href={`/clubs/${standing.clubId}`}
            className={`block rounded-xl border p-4 transition hover:-translate-y-0.5 ${
              isTopFour
                ? "border-[#18d96d] bg-[#003818] text-white"
                : "border-[#18d96d] bg-[#e9edf0] text-[#092419]"
            }`}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black">
                  {standing.position}
                </span>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                  {standing.clubLogo ? (
                    <Image
                      src={standing.clubLogo}
                      alt={standing.clubName}
                      width={44}
                      height={44}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Shield
                      className={`h-7 w-7 ${
                        isTopFour ? "text-white/60" : "text-[#07944f]"
                      }`}
                    />
                  )}
                </div>

                <div>
                  <h3 className="font-black">{standing.clubName}</h3>
                  {standing.clubLocation && (
                    <p
                      className={`mt-0.5 text-xs ${
                        isTopFour ? "text-white/50" : "text-black/50"
                      }`}
                    >
                      {standing.clubLocation}
                    </p>
                  )}
                </div>
              </div>

              <ChevronLeft
                className={`h-6 w-6 ${
                  isTopFour ? "text-[#18d96d]" : "text-[#092419]"
                }`}
              />
            </div>

            <div
              className={`grid grid-cols-5 gap-2 border-t pt-4 text-center ${
                isTopFour ? "border-white/10" : "border-black/10"
              }`}
            >
              <MobileStat label="لعب" value={standing.matchesPlayed} />
              <MobileStat label="فوز" value={standing.won} />
              <MobileStat label="خسارة" value={standing.lost} />
              <MobileStat label="+/-" value={standing.score} />
              <MobileStat label="النقاط" value={standing.points} />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1">
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
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div>
      <p className="text-base font-black">{value}</p>
      <p className="mt-1 text-[11px] opacity-60">{label}</p>
    </div>
  );
}

/* ══ FORM DOTS ══ */
function FormDots({ form }: { form: string[] }) {
  const safeForm = form.length > 0 ? form.slice(0, 3) : [];
  const padded = Array.from({ length: 3 }, (_, i) => safeForm[i] ?? "-");

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
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white ${
              isWin
                ? "bg-[#07944f]"
                : isLoss
                  ? "bg-[#f0444d]"
                  : "bg-white/20"
            }`}
          >
            {isWin ? "W" : isLoss ? "L" : ""}
          </span>
        );
      })}
    </>
  );
}

