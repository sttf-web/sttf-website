"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  UsersRound,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

type ApiClub = {
  id: string;
  clubName: string;
  location: string | null;
  logo: string | null;
  _count: {
    players: number;
  };
};

type Club = {
  id: string;
  name: string;
  city: string;
  playersCount: number;
  logo: string;
  href: string;
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchClubs() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/clubs", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch clubs");
        }

        const formattedClubs: Club[] = (data.clubs || []).map(
          (club: ApiClub) => ({
            id: club.id,
            name: club.clubName,
            logo: club.logo || "/club/logo/default.png",
            city: club.location || "غير محدد",
            playersCount: club._count.players,
            href: `/clubs/${club.id}`,
          })
        );

        setClubs(formattedClubs);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch clubs"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >
      <BackgroundEffects />

      <section className="relative overflow-hidden bg-[#043F2A] px-6 pb-12 pt-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.35),transparent_40%)]" />

        <div className="relative mt-20 mx-auto max-w-5xl">
          <div className="mb-5 flex items-center justify-center gap-3">
            <h1 className="text-4xl font-black md:text-6xl">الأندية</h1>
            <Building2 className="h-10 w-10 text-white/90 md:h-12 md:w-12" />
          </div>

          <p className="mx-auto max-w-2xl text-sm leading-7 text-white/75 md:text-base">
            أندية دوري كرة الطاولة في المملكة العربية السعودية
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8 flex items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold text-[#20E58C]">
              الأندية المشاركة
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-4xl">
              أندية دوري جاهز لكرة الطاولة
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
            <div className="flex items-center gap-3 text-sm font-bold text-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-[#20E58C]" />
              جاري تحميل الأندية...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        ) : null}

        {!loading && !error && clubs.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <p className="text-sm font-semibold text-white/60">
              لا توجد أندية متاحة حالياً.
            </p>
          </div>
        ) : null}

        {!loading && !error && clubs.length > 0 ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ClubCard({ club }: { club: Club }) {
  return (
    <Link
      href={club.href}
      className="group relative overflow-hidden rounded-[1.75rem] border border-[#20E58C]/45 bg-[#06140E]/95 p-5 shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#20E58C] hover:bg-[#082016]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(32,229,140,0.18),transparent_42%)] opacity-60 transition group-hover:opacity-100" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition group-hover:scale-105 group-hover:bg-white/10">
          <Image
            src={club.logo}
            alt={club.name}
            width={72}
            height={72}
            className="h-full w-full object-contain"
          />
        </div>

        <h3 className="text-lg font-black text-white">{club.name}</h3>

        <span className="mt-3 rounded-md bg-[#D8FFF0] px-5 py-1 text-xs font-black text-[#043F2A]">
          {club.city}
        </span>

        <div className="mt-6 flex w-full items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-white/75">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-[#20E58C]" />
            <span>اللاعبين</span>
          </div>

          <span className="font-black text-white">{club.playersCount}</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#20E58C]">
          عرض التفاصيل
          <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function BackgroundEffects() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-[#18B56F]/20 blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-[35rem] h-[30rem] w-[30rem] rounded-full bg-[#057A4B]/25 blur-[130px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-white/5 blur-[100px]"
      />
    </>
  );
}