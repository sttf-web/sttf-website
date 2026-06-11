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
    <main dir="rtl" className="min-h-screen bg-black text-white">
      <section className="bg-[#003f29] mt-10 px-5 pb-10 pt-24 text-center">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="relative mb-9 inline-flex items-center justify-center gap-3">
            <h1 className="relative z-10 text-4xl font-black leading-none md:text-5xl">
              الأندية
            </h1>

            <div className="relative h-12 w-12">
              <Building2 className="absolute inset-0 h-12 w-12 text-white" />
              <span className="absolute bottom-1 right-0 h-3 w-8 bg-[#5ed487]" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-10">
            <button className="rounded-md border border-white/40 bg-white/20 px-8 py-2 text-sm font-bold text-white shadow-sm">
              دوري الممتاز
            </button>

            <button className="rounded-md border border-white/40 bg-white/20 px-8 py-2 text-sm font-bold text-white shadow-sm">
              دوري الدرجة الأولى
            </button>

            <button className="rounded-md border border-white/40 bg-white/20 px-8 py-2 text-sm font-bold text-white shadow-sm">
              دوري السيدات
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-10 text-right">
          <h2 className="text-base font-medium text-white md:text-lg">
            أندية دوري جاهز لكرة الطاولة
          </h2>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-bold text-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-[#20E58C]" />
              جاري تحميل الأندية...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        ) : null}

        {!loading && !error && clubs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
            <p className="text-sm font-semibold text-white/60">
              لا توجد أندية متاحة حالياً.
            </p>
          </div>
        ) : null}

        {!loading && !error && clubs.length > 0 ? (
          <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-3">
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
      className="group relative min-h-[185px] overflow-hidden rounded-[18px] border border-[#00d46f] bg-[#020d08] px-8 pb-5 pt-8 transition duration-300 hover:-translate-y-1 hover:border-[#44ff9b] hover:bg-[#04140d]"
    >
      <div className="relative flex h-full flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center">
          <Image
            src={club.logo}
            alt={club.name}
            width={70}
            height={70}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="text-base font-black text-white">{club.name}</h3>

        <span className="mt-3 min-w-[112px] rounded-md bg-[#d8fff3] px-5 py-1 text-sm font-black leading-none text-[#003f29]">
          {club.city}
        </span>

        <div className="mt-5 flex w-full items-center justify-between text-sm text-white">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-white/80" />
            <span>اللاعبين</span>
          </div>

          <span className="font-medium">{club.playersCount}</span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
          عرض التفاصيل
          <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
        </div>
      </div>
    </Link>
  );
}