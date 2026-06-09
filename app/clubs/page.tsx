"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronLeft, UsersRound } from "lucide-react";

type LeagueKey = "men" | "women" | "youth";

type Club = {
  id: string;
  name: string;
  city: string;
  playersCount: number;
  logo: string;
  website: string;
  leagues: LeagueKey[];
};


const CLUBS: Club[] = [
  {
    id: "ittihad",
    name: "نادي الاتحاد",
    city: "جدة",
    playersCount: 4,
    logo: "/images/clubs/club1.png",
    website: "https://www.ittihadclub.sa",
    leagues: ["men", "women"],
  },
  {
    id: "alfateh",
    name: "نادي الفتح",
    city: "الأحساء",
    playersCount: 4,
    logo: "/images/clubs/club2.png",
    website: "https://www.alfatehclub.com",
    leagues: ["men"],
  },
  {
    id: "ibtisam",
    name: "نادي الابتسام",
    city: "القطيف",
    playersCount: 4,
    logo: "/images/clubs/club3.png",
    website: "#",
    leagues: ["men", "youth"],
  },
  {
    id: "almowj",
    name: "نادي العلا",
    city: "الخبر",
    playersCount: 4,
    logo: "/images/clubs/club4.png",
    website: "https://alulaclub.sa/",
    leagues: ["men"],
  },
  {
    id: "shabab",
    name: "نادي الشباب",
    city: "الرياض",
    playersCount: 4,
    logo: "/images/clubs/club5.png",
    website: "https://alshabab-sc.sa",
    leagues: ["men", "women"],
  },
  {
    id: "hattin",
    name: "نادي الصواري",
    city: "صامطة",
    playersCount: 4,
    logo: "/images/clubs/club6.png",
    website: "https://x.com/Nadialsawari",
    leagues: ["men"],
  },
  {
    id: "qadisiyah",
    name: "نادي القادسية",
    city: "الخبر",
    playersCount: 4,
    logo: "/images/clubs/club7.png",
    website: "https://alqadsiah.sa",
    leagues: ["men", "women"],
  },
  {
    id: "khaleej",
    name: "نادي الخليج",
    city: "سيهات",
    playersCount: 4,
    logo: "/images/clubs/club8.png",
    website: "https://khaleejclub.sa",
    leagues: ["men"],
  },
  {
    id: "mudhar",
    name: "نادي مضر",
    city: "القطيف",
    playersCount: 4,
    logo: "/images/clubs/club9.png",
    website: "https://mudharclub.org/",
    leagues: ["men", "youth"],
  },
  {
    id: "alsalam",
    name: "نادي السلام",
    city: "العوامية",
    playersCount: 4,
    logo: "/images/clubs/club11.png",
    website: "https://nadialsalam.sa/",
    leagues: ["men"],
  },
  {
    id: "alwehda",
    name: "نادي الوحدة",
    city: "مكة المكرمة",
    playersCount: 4,
    logo: "/images/clubs/club12.png",
    website: "https://alwehdaclub.sa",
    leagues: ["men", "women"],
  },
];

export default function ClubsPage() {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-black text-white">
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
            <p className="text-sm font-bold text-[#20E58C]">الأندية المشاركة</p>
            <h2 className="mt-2 text-2xl font-black md:text-4xl">
              أندية دوري جاهز لكرة الطاولة
            </h2>
          </div>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {CLUBS.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      </section>
    </main>
  );
}

function ClubCard({ club }: { club: Club }) {
  const isExternal = club.website && club.website !== "#";

  return (
    <Link
      href={club.website}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
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