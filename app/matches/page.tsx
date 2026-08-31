"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  Loader2,
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

  season: string;

  clubOneScore: number;
  clubTwoScore: number;

  date: string;
  status: MatchStatus;

  clubOne: ClubMini;
  clubTwo: ClubMini;
};

type MatchesResponse = {
  success: boolean;
  seasons: string[];
  selectedSeason: string | null;
  matches: Match[];
  error?: string;
};

function seasonToUrlValue(season: string) {
  return season.replace("/", "-");
}

function urlValueToSeason(value: string) {
  return value.replace("-", "/");
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<MatchesPageLoading />}>
      <MatchesPageContent />
    </Suspense>
  );
}

function MatchesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [matches, setMatches] = useState<Match[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);

  const [selectedSeason, setSelectedSeason] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const seasonParam =
    searchParams.get("season");

  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        setError("");

        /*
         * If a season exists in the page URL,
         * send it to the API.
         *
         * Page:
         * /matches?season=2025-2026
         *
         * API:
         * /api/matches?season=2025-2026
         */
        const query = seasonParam
          ? `?season=${encodeURIComponent(
              seasonParam
            )}`
          : "";

        const res = await fetch(
          `/api/matches${query}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType =
          res.headers.get("content-type");

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "The matches API returned an invalid response."
          );
        }

        const data: MatchesResponse =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              "Failed to fetch matches"
          );
        }

        setMatches(
          Array.isArray(data.matches)
            ? data.matches
            : []
        );

        setSeasons(
          Array.isArray(data.seasons)
            ? data.seasons
            : []
        );

        setSelectedSeason(
          data.selectedSeason ?? ""
        );

        /*
         * If the user opened:
         *
         * /matches
         *
         * and the API selected 2025/2026,
         * update the URL to:
         *
         * /matches?season=2025-2026
         */
        if (
          !seasonParam &&
          data.selectedSeason
        ) {
          router.replace(
            `/matches?season=${encodeURIComponent(
              seasonToUrlValue(
                data.selectedSeason
              )
            )}`,
            {
              scroll: false,
            }
          );
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch matches"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [
    router,
    seasonParam,
  ]);

  function handleSeasonChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const season =
      event.target.value;

    const urlSeason =
      seasonToUrlValue(season);

    router.push(
      `/matches?season=${encodeURIComponent(
        urlSeason
      )}`,
      {
        scroll: false,
      }
    );
  }

  return (
    <main
      dir="rtl"
      className="mt-20 min-h-screen bg-black text-white"
    >
      <section className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-16">
        {/* ══ PAGE TITLE ══ */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
            مباريات الدوري
          </h1>

          {/* League buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8">
            <button
              type="button"
              className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30"
            >
              دوري الممتاز
            </button>

            <button
              type="button"
              className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30"
            >
              دوري الدرجة الأولى
            </button>

            <button
              type="button"
              className="rounded-md border border-white/35 bg-white/20 px-8 py-2 text-sm font-bold text-white transition hover:bg-white/30"
            >
              دوري السيدات
            </button>
          </div>

          {/* ══ SEASON SELECTOR ══ */}
          {!loading &&
            seasons.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="relative w-full max-w-[220px]">
                  <select
                    value={selectedSeason}
                    onChange={
                      handleSeasonChange
                    }
                    aria-label="اختر الموسم"
                    className="
                      h-11 w-full cursor-pointer
                      appearance-none rounded-md
                      border border-[#22d866]/30
                      bg-[#22d866]
                      px-5 pl-10
                      text-center text-sm
                      font-black text-[#062314]
                      outline-none transition
                      hover:bg-[#2be373]
                      focus:ring-2
                      focus:ring-[#22d866]/40
                    "
                  >
                    {seasons.map(
                      (season) => (
                        <option
                          key={season}
                          value={season}
                        >
                          {season}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    className="
                      pointer-events-none
                      absolute left-3 top-1/2
                      h-4 w-4
                      -translate-y-1/2
                      text-[#062314]
                    "
                  />
                </div>
              </div>
            )}
        </div>

        {/* ══ SELECTED SEASON ══ */}
        {!loading &&
          selectedSeason && (
            <div className="mb-8 text-center">
              <span className="text-sm text-white/40">
                الموسم
              </span>

              <div className="mt-1 text-xl font-black text-[#00f06a]">
                {selectedSeason}
              </div>
            </div>
          )}

        {/* ══ LOADING ══ */}
        {loading && (
          <MatchesPageLoading />
        )}

        {/* ══ ERROR ══ */}
        {!loading && error && (
          <div className="flex items-center gap-3 border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />

            {error}
          </div>
        )}

        {/* ══ EMPTY ══ */}
        {!loading &&
          !error &&
          matches.length === 0 && (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 border border-dashed border-white/15 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/5">
                <Shield className="h-7 w-7 text-white/25" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  لا توجد مباريات لهذا الموسم
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  {selectedSeason
                    ? `لا توجد مباريات مسجلة لموسم ${selectedSeason}.`
                    : "سيتم عرض المباريات هنا بعد إضافتها من لوحة التحكم."}
                </p>
              </div>
            </div>
          )}

        {/* ══ MATCHES ══ */}
        {!loading &&
          !error &&
          matches.length > 0 && (
            <div className="space-y-3">
              {matches.map(
                (match, index) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    index={index}
                  />
                )
              )}
            </div>
          )}
      </section>
    </main>
  );
}

/* ══ LOADING ══ */

function MatchesPageLoading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center border border-[#00d46f]">
      <div className="flex items-center gap-3 text-sm font-medium text-white/50">
        <Loader2 className="h-5 w-5 animate-spin text-[#00f06a]" />

        جاري تحميل المباريات…
      </div>
    </div>
  );
}

/* ══ MATCH CARD ══ */

function MatchCard({
  match,
  index,
}: {
  match: Match;
  index: number;
}) {
  return (
    <article
      className="
        group relative overflow-hidden
        border border-[#00d46f]
        bg-black transition
        duration-300
        hover:bg-[#031109]
      "
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div
        className="
          grid min-h-[86px]
          grid-cols-[1fr_auto_1fr]
          items-center px-8 py-4
          md:px-16
        "
      >
        {/* Right team */}
        <ClubLogoOnly
          club={match.clubOne}
        />

        {/* Score + date */}
        <div className="flex min-w-[180px] flex-col items-center justify-center text-center">
          <div className="text-4xl font-black leading-none text-[#00ff6a] md:text-5xl">
            {match.clubOneScore}:
            {match.clubTwoScore}
          </div>

          <div className="mt-1 text-sm font-medium text-white/80">
            {formatDate(match.date)}
          </div>
        </div>

        {/* Left team */}
        <ClubLogoOnly
          club={match.clubTwo}
        />
      </div>
    </article>
  );
}

/* ══ CLUB LOGO ══ */

function ClubLogoOnly({
  club,
}: {
  club: ClubMini;
}) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center">
        {club.logo ? (
          <Image
            src={club.logo}
            alt={club.clubName}
            width={64}
            height={64}
            className="
              h-full w-full
              object-contain
              transition duration-300
              group-hover:scale-105
            "
          />
        ) : (
          <Shield className="h-10 w-10 text-[#00d46f]" />
        )}
      </div>
    </div>
  );
}

/* ══ DATE ══ */

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(new Date(date));
}