"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronLeft,
  UserRound,
  Users,
} from "lucide-react";

type TeamPlayer = {
  id: string;
  name: string;
  number: string;
  image: string;
};

type Team = {
  id: string;
  category: string;
  title: string;
  coach: string;
  description: string;
  players: TeamPlayer[];
};

type TeamsResponse = {
  success: boolean;
  teams: Team[];
  error?: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team: Team) => team.id === selectedTeamId),
    [teams, selectedTeamId]
  );

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch("/api/teams", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as TeamsResponse;

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch teams.");
        }

        setTeams(data.teams);
      } catch (error: unknown) {
        setErrorMessage(
          error instanceof Error ? error.message : "تعذر تحميل المنتخبات."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-black text-white"
    >
      {loading ? (
        <PageHero
          title="المنتخبات الوطنية"
          subtitle="جاري تحميل المنتخبات..."
        />
      ) : errorMessage ? (
        <>
          <PageHero title="المنتخبات الوطنية" subtitle={errorMessage} />
        </>
      ) : !selectedTeam ? (
        <TeamSelectView teams={teams} onSelectTeam={setSelectedTeamId} />
      ) : (
        <TeamPlayersView
          team={selectedTeam}
          onBack={() => setSelectedTeamId(null)}
        />
      )}
    </main>
  );
}

function TeamSelectView({
  teams,
  onSelectTeam,
}: {
  teams: Team[];
  onSelectTeam: (teamId: string) => void;
}) {
  return (
    <>
      <PageHero
        title="المنتخبات الوطنية"
        subtitle="منتخبات المملكة العربية السعودية لكرة الطاولة"
      />

      <section className="relative mx-auto max-w-3xl px-5 py-12 md:py-16">
        {teams.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#1f1f1f]/95 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white/70">
              لا توجد منتخبات منشورة حالياً
            </p>
          </div>
        ) : (
          <div className="space-y-15">
            {teams.map((team: Team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => onSelectTeam(team.id)}
                className="group relative w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1f1f1f]/95 text-right shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:border-[#20E58C]/60 hover:bg-[#252525]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(32,229,140,0.14),transparent_35%)] opacity-0 transition group-hover:opacity-100" />

                <div className="relative rounded-b-[1.5rem] bg-[#006F4D] px-6 py-7 text-center">
                  <h3 className="text-3xl font-black text-white">
                    {team.title}
                  </h3>

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
        )}
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
      <section className="relative mt-10 overflow-hidden bg-[#01311F] px-5 py-9">
        <div className="relative mx-auto mt-20 flex max-w-6xl items-center justify-center gap-5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to teams"
            className="absolute left-0 flex h-11 w-11 items-center justify-center"
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

        {team.players.length === 0 ? (
          <div className="rounded-[1.75rem] border border-white/10 bg-[#1f1f1f]/95 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-white/70">
              لا يوجد لاعبون مضافون لهذا المنتخب حالياً
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {team.players.map((player: TeamPlayer) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function PlayerCard({ player }: { player: TeamPlayer }) {
  return (
    <article className="group relative w-full overflow-hidden bg-black">
      <div className="relative flex h-[320px] items-end justify-center overflow-hidden px-4 pt-6">
        <Image
          src="/homePage/star.png"
          alt=""
          width={280}
          height={280}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-6 z-0 h-[250px] w-[250px] -translate-x-1/2 object-contain opacity-55 transition duration-500 group-hover:scale-105"
        />

        <Image
          src={player.image}
          alt={player.name}
          width={360}
          height={380}
          className="relative z-10 max-h-[300px] w-auto object-contain drop-shadow-2xl transition duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="relative px-3 pb-5">
        <div className="mb-2 h-[4px] w-full bg-[#CFFEF2]" />

        <div className="flex items-center justify-between gap-4 px-3">
          <p className="text-left text-xl font-black leading-none text-white">
            {player.number}
          </p>

          <h3 className="max-w-[55%] text-right text-lg font-medium leading-tight text-white">
            {player.name}
          </h3>
        </div>

        <div className="mt-3 h-[4px] w-full bg-[#CFFEF2]" />
      </div>
    </article>
  );
}

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative overflow-hidden bg-[#01311F] px-6 py-16 text-center">
      <div className="relative mx-auto mt-20 max-w-4xl">
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