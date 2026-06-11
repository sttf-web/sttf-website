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


return (
  <main dir="rtl" className="min-h-screen mt-20 bg-black text-white">
    {/* ══ BODY ══ */}
    <section className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-16">
      {/* Page title */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
          مباريات الدوري
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
          <button className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30">
            دوري الممتاز
          </button>

          <button className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30">
            دوري الدرجة الأولى
          </button>

          <button className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30">
            دوري السيدات
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[300px] items-center justify-center border border-[#00d46f]">
          <div className="flex items-center gap-3 text-sm font-medium text-white/50">
            <Loader2 className="h-5 w-5 animate-spin text-[#00f06a]" />
            جاري تحميل المباريات…
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && matches.length === 0 && (
        <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 border border-dashed border-white/15 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
            <Shield className="h-7 w-7 text-white/25" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              لا توجد مباريات حالياً
            </h2>
            <p className="mt-1 text-sm text-white/35">
              سيتم عرض المباريات هنا بعد إضافتها من لوحة التحكم.
            </p>
          </div>
        </div>
      )}

      {/* Matches */}
      {!loading && !error && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((match, i) => (
            <MatchCard key={match.id} match={match} index={i} />
          ))}
        </div>
      )}
    </section>
  </main>
);}

/* ══ MATCH CARD ══ */
function MatchCard({ match, index }: { match: Match; index: number }) {
  return (
    <article
      className="
        group relative overflow-hidden border border-[#00d46f]
        bg-black transition duration-300 hover:bg-[#031109]
      "
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="
          grid min-h-[86px] grid-cols-[1fr_auto_1fr]
          items-center px-8 py-4
          md:px-16
        "
      >
        {/* Right team */}
        <ClubLogoOnly club={match.clubOne} />

        {/* Score + date */}
        <div className="flex min-w-[180px] flex-col items-center justify-center text-center">
          <div className="text-4xl font-black leading-none text-[#00ff6a] md:text-5xl">
            {match.clubOneScore}:{match.clubTwoScore}
          </div>

          <div className="mt-1 text-sm font-medium text-white/80">
            {formatDate(match.date)}
          </div>
        </div>

        {/* Left team */}
        <ClubLogoOnly club={match.clubTwo} />
      </div>
    </article>
  );
}

/* ══ CLUB LOGO ONLY ══ */
function ClubLogoOnly({ club }: { club: ClubMini }) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center">
        {club.logo ? (
          <Image
            src={club.logo}
            alt={club.clubName}
            width={64}
            height={64}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        ) : (
          <Shield className="h-10 w-10 text-[#00d46f]" />
        )}
      </div>
    </div>
  );
}

/* ══ HELPERS ══ */
function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}