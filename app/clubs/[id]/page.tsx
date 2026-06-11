"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  MapPin,
  Phone,
  Trophy,
  UsersRound,
  Loader2,
  Star,
  BadgeCheck,
  Shield,
  ArrowLeft,
} from "lucide-react";

type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED";
type PlayerDivision = "MEN" | "YOUTH" | "WOMEN" | "PARALYMPIC";

type ClubMini = { id: string; clubName: string; logo: string | null };

type Match = {
  id: string;
  clubOneScore: number;
  clubTwoScore: number;
  date: string;
  status: MatchStatus;
  clubOne: ClubMini;
  clubTwo: ClubMini;
};

type Player = {
  id: string;
  name: string;
  age: number | null;
  picture: string | null;
  country: string | null;
  ranking: number | null;
  number: number | null;
  division: PlayerDivision;
};

type LeagueStanding = {
  matchesPlayed: number;
  won: number;
  lost: number;
  score: string;
  points: number;
  form: string[];
};

type ClubDetails = {
  id: string;
  clubName: string;
  location: string | null;
  coach: string | null;
  manager: string | null;
  phoneNumber: string | null;
  logo: string | null;
  players: Player[];
  matches: Match[];
  leagueStanding: LeagueStanding | null;
  playersCount: number;
  matchesCount: number;
};

const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "مجدولة",
  LIVE: "مباشر",
  FINISHED: "انتهت",
  POSTPONED: "مؤجلة",
  CANCELLED: "ملغاة",
};

const DIVISION_LABELS: Record<PlayerDivision, string> = {
  MEN: "رجال",
  WOMEN: "سيدات",
  YOUTH: "شباب",
  PARALYMPIC: "بارالمبي",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default function ClubDetailsPage() {
  const params = useParams<{ id: string }>();
  const clubId = params.id;

  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchClub() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/clubs/${clubId}`, { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch club");
        setClub(data.club);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch club");
      } finally {
        setLoading(false);
      }
    }
    if (clubId) fetchClub();
  }, [clubId]);

  const stats = useMemo(() => {
    if (!club) return null;
    return {
      players: club.playersCount,
      matches: club.matchesCount,
      wins: club.leagueStanding?.won ?? 0,
      points: club.leagueStanding?.points ?? 0,
    };
  }, [club]);

  /* ── Loading ── */
  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#050A07]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#18B56F]" />
          <p className="text-sm font-semibold text-white/50">جاري تحميل بيانات النادي…</p>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error || !club) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-[#050A07] px-5">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h1 className="mt-4 text-xl font-black text-white">تعذر تحميل النادي</h1>
          <p className="mt-2 text-sm text-white/40">{error || "لم يتم العثور على النادي المطلوب."}</p>
          <Link
            href="/clubs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#18B56F] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#15a062]"
          >
            العودة للأندية <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#050A07] text-white">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden bg-[#01311F] pb-28 pt-10 text-white">



        {/* Back button — top right */}
        <div className="relative mx-auto mt-20 max-w-6xl px-6">
          <div className="flex justify-end">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              الأندية
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Centered logo + name + pills */}
        <div className="relative mx-auto mt-8 max-w-6xl px-6 text-center">
          {/* Logo circle */}
          <div className="relative mx-auto h-32 w-32">
            <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl shadow-black/50">
              <Image
                src={club.logo || "/club/logo/default.png"}
                alt={club.clubName}
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#18B56F] shadow-md">
              <BadgeCheck className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Club name */}
          <h1 className="mt-5 text-4xl font-black text-white drop-shadow-lg md:text-6xl">
            {club.clubName}
          </h1>

          {/* Meta pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {club.location && (
              <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" />
                {club.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <UsersRound className="h-3.5 w-3.5" />
              {club.playersCount} لاعب
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
              <Trophy className="h-3.5 w-3.5" />
              {stats?.points ?? 0} نقطة
            </span>
          </div>
        </div>

        {/* Stat cards — overlapping bottom of hero */}
        <div className="relative mx-auto mt-12 max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "النقاط",      value: stats?.points ?? 0,  color: "text-orange-500" },
              { label: "الانتصارات",  value: stats?.wins ?? 0,    color: "text-teal-500"   },
              { label: "المباريات",   value: stats?.matches ?? 0, color: "text-blue-500"   },
              { label: "اللاعبين",   value: stats?.players ?? 0, color: "text-violet-500" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white py-7 shadow-xl shadow-black/20"
              >
                <span className={`text-4xl font-black ${color}`}>{value}</span>
                <span className="text-sm font-semibold text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="bg-[#000000]">
      {/* ══════════════════ COACH / MANAGER ══════════════════ */}
      {(club.coach || club.manager) && (
        <div className="mx-auto max-w-5xl px-6 pt-10">
          <div className="grid gap-4 md:grid-cols-2">
            {club.manager && (
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#0d1a11] px-6 py-5">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white/40">المسؤول</p>
                  <h3 className="mt-1 text-lg font-black text-white">{club.manager}</h3>
                  {club.phoneNumber && (
                    <a
                      href={`tel:${club.phoneNumber}`}
                      className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#18B56F] hover:underline"
                    >
                      {club.phoneNumber}
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#18B56F]/20 bg-[#18B56F]/10">
                  <BadgeCheck className="h-6 w-6 text-[#18B56F]" />
                </div>
              </div>
            )}
            {club.coach && (
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#0d1a11] px-6 py-5">
                <div className="text-right">
                  <p className="text-xs font-semibold text-white/40">المدرب</p>
                  <h3 className="mt-1 text-lg font-black text-white">{club.coach}</h3>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
                  <Trophy className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ PLAYERS ══════════════════ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <SectionTitle eyebrow="قائمة النادي" title="أبرز اللاعبين" />

        {club.players.length === 0 ? (
          <EmptyState text="لا يوجد لاعبون مرتبطون بهذا النادي حتى الآن." />
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {club.players.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>

      {/* ══════════════════ MATCHES ══════════════════ */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <SectionTitle eyebrow="نتائج النادي" title="آخر المباريات" />

        {club.matches.length === 0 ? (
          <EmptyState text="لا توجد مباريات مسجلة لهذا النادي حتى الآن." />
        ) : (
          <div className="mt-10 space-y-3">
            {club.matches.map((match) => (
              <MatchCard key={match.id} match={match} currentClubId={club.id} />
            ))}
          </div>
        )}
      </section>
      </div>
    </main>
  );
}

/* ═══════════════ PLAYER CARD ═══════════════ */
function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#050505]/80 shadow-2xl shadow-black/40 transition hover:-translate-y-1 hover:border-[#20E58C]/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(32,229,140,0.16),transparent_45%)] opacity-70" />

      <div className="relative flex h-[310px] items-end justify-center px-5 pt-6">
        {/* Diamond watermark */}
        <Image
          src="/homePage/star.png"
          alt=""
          width={260}
          height={260}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-10 z-0 h-86 w-86 -translate-x-1/2 object-contain opacity-50 transition duration-500 group-hover:scale-110 group-hover:opacity-30"
        />

        <Image
          src={player.picture || "/images/players/default.png"}
          alt={player.name}
          width={340}
          height={360}
          className="relative z-10 max-h-[290px] w-auto object-contain drop-shadow-2xl transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="relative border-t border-white/20 bg-black/60 px-5 py-4 backdrop-blur">
        <div className="mb-2 h-[2px] w-full bg-white" />

        <div className="flex items-end justify-between gap-4">
          <div className="text-right">
            <p className="text-[11px] text-white/50">رقم اللاعب</p>
            <p className="text-xl font-black leading-none text-white">
              {player.number ?? "—"}
            </p>
          </div>

          <div className="text-left">
            <p className="text-[11px] text-white/50">اللاعب</p>
            <h3 className="text-base font-black text-white">{player.name}</h3>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════ MATCH CARD ═══════════════ */
function MatchCard({ match, currentClubId }: { match: Match; currentClubId: string }) {
  const isOne = match.clubOne.id === currentClubId;
  const myScore = isOne ? match.clubOneScore : match.clubTwoScore;
  const theirScore = isOne ? match.clubTwoScore : match.clubOneScore;
  const won = match.status === "FINISHED" && myScore > theirScore;
  const lost = match.status === "FINISHED" && myScore < theirScore;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0d1a11] transition hover:border-[#18B56F]/30">
      <div className={`absolute inset-y-0 right-0 w-1 ${won ? "bg-[#18B56F]" : lost ? "bg-red-500" : "bg-white/10"}`} />

      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <ClubBlock club={match.clubOne} highlight={match.clubOne.id === currentClubId} />

        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-black ${match.clubOne.id === currentClubId ? "text-[#18B56F]" : "text-white"}`}>
              {match.clubOneScore}
            </span>
            <span className="text-xl font-black text-white/20">:</span>
            <span className={`text-3xl font-black ${match.clubTwo.id === currentClubId ? "text-[#18B56F]" : "text-white"}`}>
              {match.clubTwoScore}
            </span>
          </div>
          <span className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${
            match.status === "FINISHED" ? "bg-[#18B56F]/15 text-[#18B56F]"
            : match.status === "LIVE" ? "bg-red-500/15 text-red-400"
            : "bg-white/8 text-white/40"
          }`}>
            {STATUS_LABELS[match.status]}
          </span>
        </div>

        <ClubBlock club={match.clubTwo} highlight={match.clubTwo.id === currentClubId} align="left" />
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-white/5 px-6 py-2.5 text-xs text-white/30">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(match.date)}
      </div>
    </article>
  );
}

function ClubBlock({
  club,
  highlight,
  align = "right",
}: {
  club: ClubMini;
  highlight: boolean;
  align?: "right" | "left";
}) {
  return (
    <div className={`flex flex-1 items-center gap-3 ${align === "left" ? "flex-row-reverse" : ""}`}>
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5 ${highlight ? "bg-[#18B56F]/15 ring-1 ring-[#18B56F]/40" : "bg-white/5"}`}>
        <Image
          src={club.logo || "/club/logo/default.png"}
          alt={club.clubName}
          width={36}
          height={36}
          className="h-full w-full object-contain"
        />
      </div>
      <p className={`max-w-[120px] truncate text-sm font-bold ${highlight ? "text-[#18B56F]" : "text-white/70"}`}>
        {club.clubName}
      </p>
    </div>
  );
}

/* ═══════════════ SHARED ═══════════════ */
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-[#18B56F] underline underline-offset-4">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">{title}</h2>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/3 py-16 text-center">
      <Shield className="h-8 w-8 text-white/20" />
      <p className="text-sm text-white/30">{text}</p>
    </div>
  );
}
