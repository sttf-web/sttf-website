"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  Trophy,
  Users,
  UserRound,
  ArrowLeft,
} from "lucide-react";

type TeamKey = "men" | "youth" | "women" | "paralympic";

type Player = {
  id: string;
  name: string;
  number: string;
  image: string;
};

type Team = {
  key: TeamKey;
  title: string;
  coach: string;
  description: string;
  players: Player[];
};

const TEAMS: Team[] = [
  {
    key: "men",
    title: "المنتخب الأول للرجال",
    coach: "يورغن بيرسون",
    description: "تعرف على تشكيلة المنتخب ولاعبيه المميزين",
    players: [
      {
        id: "m1",
        name: "علي الخضراوي",
        number: "1",
        image: "/images/players/player-1.png",
      },
      {
        id: "m2",
        name: "سالم السويلم",
        number: "2",
        image: "/images/players/player-2.png",
      },
      {
        id: "m3",
        name: "خالد الشريف",
        number: "3",
        image: "/images/players/player-3.png",
      },
      {
        id: "m4",
        name: "عبدالعزيز بوشليبي",
        number: "4",
        image: "/images/players/player-4.png",
      },
    ],
  },
  {
    key: "youth",
    title: "منتخب الفئات السنية",
    coach: "يوسف ربيع",
    description: "تعرف على تشكيلة الشباب ولاعبيه المميزين",
    players: [
      {
        id: "y1",
        name: "سعود الطاهر",
        number: "5",
        image: "/images/players/youth-1.png",
      },
      {
        id: "y2",
        name: "عبدالرحمن الطاهر",
        number: "6",
        image: "/images/players/youth-2.png",
      },
      {
        id: "y3",
        name: "علي خضراوي",
        number: "7",
        image: "/images/players/youth-3.png",
      },
      {
        id: "y4",
        name: "يوسف حنيفة",
        number: "8",
        image: "/images/players/youth-4.png",
      },
      {
        id: "y5",
        name: "ريان المنجومي",
        number: "9",
        image: "/images/players/youth-5.png",
      },
      {
        id: "y6",
        name: "فارس الطاهر",
        number: "10",
        image: "/images/players/youth-6.png",
      },
      {
        id: "y7",
        name: "علي خضراوي",
        number: "11",
        image: "/images/players/youth-7.png",
      },
      {
        id: "y8",
        name: "احمد الخلف",
        number: "12",
        image: "/images/players/youth-8.png",
      },
    ],
  },
  {
    key: "women",
    title: "منتخب السيدات",
    coach: "مراد يوسف",
    description: "تعرف على تشكيلة المنتخب ولاعباته المميزات",
    players: [
      {
        id: "w1",
        name: "نهال القحطاني",
        number: "13",
        image: "/images/players/women-1.png",
      },
      {
        id: "w2",
        name: "اميرة الظفيري",
        number: "14",
        image: "/images/players/women-2.png",
      },
      {
        id: "w3",
        name: "نوز باجحزر",
        number: "15",
        image: "/images/players/women-3.png",
      },
      {
        id: "w4",
        name: "حصة الخالدي",
        number: "16",
        image: "/images/players/women-4.png",
      },
    ],
  },
  {
    key: "paralympic",
    title: "منتخب البارالمبية",
    coach: "حسام الشوبري - زهراء الغرابي",
    description: "تعرف على تشكيلة المنتخب ولاعبيه المميزين",
    players: [
      {
        id: "p1",
        name: "مريم المريسل",
        number: "17",
        image: "/images/players/para-1.png",
      },
      {
        id: "p2",
        name: "زهراء آلطالع",
        number: "18",
        image: "/images/players/para-2.png",
      },
      {
        id: "p3",
        name: "علي خضراوي",
        number: "19",
        image: "/images/players/para-3.png",
      },
      {
        id: "p4",
        name: "ابراهيم الحسن",
        number: "20",
        image: "/images/players/para-4.png",
      },
    ],
  },
];

export default function TeamsPage() {
  const [selectedTeamKey, setSelectedTeamKey] = useState<TeamKey | null>(null);

  const selectedTeam = useMemo(
    () => TEAMS.find((team) => team.key === selectedTeamKey),
    [selectedTeamKey]
  );

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-black text-white">
      {!selectedTeam ? (
        <TeamSelectView onSelectTeam={setSelectedTeamKey} />
      ) : (
        <TeamPlayersView
          team={selectedTeam}
          onBack={() => setSelectedTeamKey(null)}
        />
      )}
    </main>
  );
}

function TeamSelectView({
  onSelectTeam,
}: {
  onSelectTeam: (team: TeamKey) => void;
}) {
  return (
    <>
      <PageHero
        title="المنتخبات الوطنية"
        subtitle="منتخبات المملكة العربية السعودية لكرة الطاولة"
      />

      <section className="relative mx-auto max-w-3xl px-5 py-12 md:py-16">


        <div className="space-y-15">
          {TEAMS.map((team) => (
            <button
              key={team.key}
              type="button"
              onClick={() => onSelectTeam(team.key)}
              className="group relative w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1f1f1f]/95 text-right shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#20E58C]/60 hover:bg-[#252525]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,229,140,0.14),transparent_35%)] opacity-0 transition group-hover:opacity-100" />

              <div className="relative rounded-b-[1.5rem] bg-[#006F4D] px-6 py-7 text-center">
                <h3 className="text-3xl font-black text-white">{team.title}</h3>

                <div className="mt-2 flex items-center justify-center gap-2 text-lg text-white/75">
                  <UserRound className="h-3.5 w-3.5" />
                  <span>المدرب: {team.coach}</span>
                </div>
              </div>

              <div className="relative px-6 py-6 text-center">
                <p className="text-3xl leading-7 text-white/75">
                  {team.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white">
                  عرض التفاصيل
                  <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

function TeamPlayersView({
  team,
  onBack,
}: {
  team: Team;
  onBack: () => void;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-[#01311F] px-5 py-9 mt-10">
        <div className="absolute inset-0 " />

        <div className="relative mt-20 mx-auto flex max-w-6xl items-center justify-center gap-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to teams"
            className="absolute left-0 flex h-11 w-11 items-center justify-center "
          >
            <ArrowLeft className="h-25 w-25" />
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-3xl font-black md:text-5xl">{team.title}</h1>

            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/75">
              <UserRound className="h-4 w-4" />
              <span>المدرب: {team.coach}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-10 text-center">
          <h2 className="mt-2 text-3xl font-black md:text-5xl">
            أبرز اللاعبين
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {team.players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      </section>
    </>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <article className="group relative w-full overflow-hidden bg-black">
      {/* Image area */}
      <div className="relative flex h-[320px] items-end justify-center overflow-hidden px-4 pt-6">
        {/* Star behind player */}
        <Image
          src="/homePage/star.png"
          alt=""
          width={280}
          height={280}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-6 z-0 h-[250px] w-[250px] -translate-x-1/2 object-contain opacity-55 transition duration-500 group-hover:scale-105"
        />

        {/* Player */}
        <Image
          src={player.image}
          alt={player.name}
          width={360}
          height={380}
          className="relative z-10 max-h-[300px] w-auto object-contain drop-shadow-2xl transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      {/* Info area */}
      <div className="relative px-3 pb-5">
        {/* Top mint line */}
        <div className="mb-2 h-[4px] w-full bg-[#CFFEF2]" />

        <div className="flex items-center justify-between gap-4 px-3">
          {/* Number - left */}
          <p className="text-left text-xl font-black leading-none text-white">
            {player.number}
          </p>

          {/* Name - right */}
          <h3 className="max-w-[55%] text-right text-lg font-medium leading-tight text-white">
            {player.name}
          </h3>
        </div>

        {/* Bottom mint line */}
        <div className="mt-3 h-[4px] w-full bg-[#CFFEF2]" />
      </div>
    </article>
  );
}

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden bg-[#01311F] px-6 py-16 text-center">
      <div className="absolute inset-0 " />

      <div className="relative mt-20 mx-auto max-w-4xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10">
          <Users className="h-7 w-7" />
        </div>

        <h1 className="text-4xl font-black md:text-6xl">{title}</h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
