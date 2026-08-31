"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import {
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react";

type CommitteeMember = {
  id: string;
  name: string;
  title: string;
  image: string;
  order: number;
};

type Committee = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  members: CommitteeMember[];
};

type CommitteesResponse = {
  success: boolean;
  committees?: Committee[];
  error?: string;
};

const DEFAULT_PERSON_IMAGE =
  "/images/defaultPerson.png";

export default function CommitteesPage() {
  const [committees, setCommittees] =
    useState<Committee[]>([]);

  const [
    selectedCommitteeSlug,
    setSelectedCommitteeSlug,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchCommittees() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/committees",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType =
          response.headers.get(
            "content-type"
          );

        if (
          !contentType?.includes(
            "application/json"
          )
        ) {
          throw new Error(
            "The committees API returned an invalid response."
          );
        }

        const data: CommitteesResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to fetch committees."
          );
        }

        const loadedCommittees =
          Array.isArray(
            data.committees
          )
            ? data.committees
            : [];

        setCommittees(
          loadedCommittees
        );

        if (
          loadedCommittees.length >
          0
        ) {
          setSelectedCommitteeSlug(
            loadedCommittees[0]
              .slug
          );
        }
      } catch (error) {
        console.error(
          "FETCH_COMMITTEES_ERROR",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch committees."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCommittees();
  }, []);

  const selectedCommittee =
    useMemo(() => {
      return (
        committees.find(
          (committee) =>
            committee.slug ===
            selectedCommitteeSlug
        ) ?? null
      );
    }, [
      committees,
      selectedCommitteeSlug,
    ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-black text-white"
    >
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-32 md:px-8">
        {/* ═════════════════════════════
            CATEGORY NAVIGATION
        ═════════════════════════════ */}
        {!loading &&
          !error &&
          committees.length >
            0 && (
            <div
              className="
                grid
                grid-cols-1
                gap-x-14
                gap-y-7
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              {committees.map(
                (
                  committee
                ) => {
                  const isActive =
                    committee.slug ===
                    selectedCommitteeSlug;

                  return (
                    <button
                      key={
                        committee.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedCommitteeSlug(
                          committee.slug
                        )
                      }
                      className={`
                        min-h-[44px]
                        rounded-md
                        border
                        px-5
                        py-2
                        text-sm
                        font-bold
                        transition
                        duration-200

                        ${
                          isActive
                            ? `
                              border-[#1fce70]
                              bg-[#999999]
                              text-white
                            `
                            : `
                              border-[#1fce70]
                              bg-[#454545]
                              text-white
                              hover:bg-[#5a5a5a]
                            `
                        }
                      `}
                    >
                      {
                        committee.name
                      }
                    </button>
                  );
                }
              )}
            </div>
          )}

        {/* ═════════════════════════════
            LOADING
        ═════════════════════════════ */}
        {loading && (
          <div className="flex min-h-[450px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-white/50">
              <Loader2 className="h-5 w-5 animate-spin text-[#18d96d]" />

              جاري تحميل اللجان…
            </div>
          </div>
        )}

        {/* ═════════════════════════════
            ERROR
        ═════════════════════════════ */}
        {!loading &&
          error && (
            <div className="mt-10 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />

              {error}
            </div>
          )}

        {/* ═════════════════════════════
            SELECTED COMMITTEE
        ═════════════════════════════ */}
        {!loading &&
          !error &&
          selectedCommittee && (
            <section className="pt-20 md:pt-24">
              {/* Committee title */}
              <div className="text-right">
                <h1 className="relative inline-block text-3xl font-black text-white md:text-4xl">
                  {
                    selectedCommittee.name
                  }

                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      -bottom-3
                      right-0
                      h-[5px]
                      w-[115px]
                      bg-[#18d96d]
                    "
                  />
                </h1>

                {/* Green dots */}
                <div className="mt-6 flex justify-start gap-1.5">
                  {Array.from({
                    length: 10,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <span
                        key={
                          index
                        }
                        className="h-2.5 w-2.5 rounded-full bg-[#18d96d]"
                      />
                    )
                  )}
                </div>

                {selectedCommittee.description && (
                  <p className="mt-5 max-w-4xl text-sm leading-7 text-white/70">
                    {
                      selectedCommittee.description
                    }
                  </p>
                )}
              </div>

              {/* Members */}
              {selectedCommittee
                .members.length >
              0 ? (
                <CommitteeMembers
                  members={
                    selectedCommittee.members
                  }
                />
              ) : (
                <EmptyCommittee />
              )}
            </section>
          )}

        {/* No committees */}
        {!loading &&
          !error &&
          committees.length ===
            0 && (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
              <Users className="h-10 w-10 text-white/20" />

              <div>
                <h2 className="text-xl font-black">
                  لا توجد لجان
                  حالياً
                </h2>

                <p className="mt-2 text-sm text-white/40">
                  سيتم عرض اللجان
                  هنا بعد إضافتها من
                  لوحة التحكم.
                </p>
              </div>
            </div>
          )}
      </section>
    </main>
  );
}

/* ═════════════════════════════════════
   MEMBERS
═════════════════════════════════════ */

function CommitteeMembers({
  members,
}: {
  members: CommitteeMember[];
}) {
  /*
   * Always sort using the member order.
   */
  const sortedMembers =
    useMemo(() => {
      return [...members].sort(
        (a, b) =>
          a.order - b.order
      );
    }, [members]);

  /*
   * The member with order === 0
   * is ALWAYS the person at the top.
   *
   * If no member has order 0,
   * fall back to the first member.
   */
  const topMember =
    useMemo(() => {
      return (
        sortedMembers.find(
          (member) =>
            member.order === 0
        ) ??
        sortedMembers[0] ??
        null
      );
    }, [sortedMembers]);

  /*
   * Everybody except the top member
   * goes into the 3-column grid.
   */
  const remainingMembers =
    useMemo(() => {
      if (!topMember) {
        return [];
      }

      return sortedMembers.filter(
        (member) =>
          member.id !==
          topMember.id
      );
    }, [
      sortedMembers,
      topMember,
    ]);

  if (!topMember) {
    return null;
  }

  return (
    <div className="relative mx-auto mt-16 w-full max-w-6xl">
      {/* ═════════════════════════════
          TREE BACKGROUND
      ═════════════════════════════ */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[70px]
          z-0
          hidden
          h-[720px]
          w-[900px]
          max-w-[90vw]
          -translate-x-1/2
          lg:block
        "
      >
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes="900px"
          className="
            object-contain
            object-top
            opacity-55
          "
        />
      </div>

      {/* ═════════════════════════════
          POSITION 0 / PRESIDENT
      ═════════════════════════════ */}
      <div className="relative z-10 flex justify-center">
        <CommitteeMemberCard
          member={topMember}
          featured
        />
      </div>

      {/* ═════════════════════════════
          REST OF MEMBERS
          3 PER ROW
      ═════════════════════════════ */}
      {remainingMembers.length >
        0 && (
        <div
          className="
            relative
            z-10
            mx-auto
            mt-16
            grid
            max-w-5xl
            grid-cols-1
            place-items-center
            gap-x-14
            gap-y-16
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {remainingMembers.map(
            (member) => (
              <CommitteeMemberCard
                key={
                  member.id
                }
                member={
                  member
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════
   MEMBER CARD
═════════════════════════════════════ */

function CommitteeMemberCard({
  member,
  featured = false,
}: {
  member: CommitteeMember;
  featured?: boolean;
}) {
  const imageSource =
    member.image?.trim()
      ? member.image
      : DEFAULT_PERSON_IMAGE;

  return (
    <article
      className={`
        group
        flex
        w-full
        flex-col
        items-center
        text-center

        ${
          featured
            ? "max-w-[290px]"
            : "max-w-[270px]"
        }
      `}
    >
      {/* Image */}
      <div
        className={`
          relative
          overflow-hidden
          border
          border-[#18d96d]
          bg-black

          ${
            featured
              ? `
                h-[220px]
                w-[220px]
                md:h-[240px]
                md:w-[240px]
              `
              : `
                h-[210px]
                w-[210px]
                md:h-[230px]
                md:w-[230px]
              `
          }
        `}
      >
        <Image
          src={imageSource}
          alt={member.name}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 220px, 240px"
              : "(max-width: 768px) 210px, 230px"
          }
          className="
            object-contain
            object-bottom
            transition
            duration-300
            group-hover:scale-[1.03]
          "
        />
      </div>

      {/* Name */}
      <h2 className="mt-5 text-2xl font-black leading-tight text-white">
        {member.name}
      </h2>

      {/* Title */}
      <p className="mt-1 text-base font-black text-[#18d96d]">
        {member.title}
      </p>
    </article>
  );
}

/* ═════════════════════════════════════
   EMPTY COMMITTEE
═════════════════════════════════════ */

function EmptyCommittee() {
  return (
    <div className="mt-16 flex min-h-[280px] flex-col items-center justify-center gap-4 border border-dashed border-white/10 text-center">
      <Users className="h-9 w-9 text-white/20" />

      <div>
        <h2 className="text-lg font-black text-white">
          لا يوجد أعضاء حالياً
        </h2>

        <p className="mt-1 text-sm text-white/40">
          سيتم عرض أعضاء هذه
          اللجنة بعد إضافتهم من
          لوحة التحكم.
        </p>
      </div>
    </div>
  );
}