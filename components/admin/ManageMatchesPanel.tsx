"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Save,
  Shield,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

type ClubOption = {
  id: string;
  clubName: string;
  logo: string | null;
};

type AdminMatch = {
  id: string;
  clubOneId: string;
  clubTwoId: string;
  clubOneScore: number;
  clubTwoScore: number;
  date: string;
  status: MatchStatus;
  clubOne: ClubOption;
  clubTwo: ClubOption;
};

type AdminMatchesResponse = {
  success: boolean;
  matches: AdminMatch[];
  clubs: ClubOption[];
  error?: string;
};

type SingleMatchResponse = {
  success: boolean;
  match: AdminMatch;
  error?: string;
};

const MATCH_STATUSES: { label: string; value: MatchStatus }[] = [
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Live", value: "LIVE" },
  { label: "Finished", value: "FINISHED" },
  { label: "Postponed", value: "POSTPONED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const selectClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15 appearance-none cursor-pointer";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

function formatDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDisplayDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusClass(status: MatchStatus) {
  if (status === "LIVE") {
    return "border-red-400/30 bg-red-500/10 text-red-300";
  }

  if (status === "FINISHED") {
    return "border-[#00c896]/30 bg-[#00c896]/10 text-[#00e0aa]";
  }

  if (status === "POSTPONED") {
    return "border-yellow-400/30 bg-yellow-500/10 text-yellow-200";
  }

  if (status === "CANCELLED") {
    return "border-white/20 bg-white/10 text-white/50";
  }

  return "border-sky-400/30 bg-sky-500/10 text-sky-200";
}

function sortMatches(matches: AdminMatch[]) {
  return [...matches].sort(
    (matchA: AdminMatch, matchB: AdminMatch) =>
      new Date(matchB.date).getTime() - new Date(matchA.date).getTime()
  );
}

export default function ManageMatchesPanel() {
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingMatch, setEditingMatch] = useState<AdminMatch | null>(null);
  const [clubOneId, setClubOneId] = useState("");
  const [clubTwoId, setClubTwoId] = useState("");
  const [clubOneScore, setClubOneScore] = useState("0");
  const [clubTwoScore, setClubTwoScore] = useState("0");
  const [date, setDate] = useState("");
  const [statusValue, setStatusValue] = useState<MatchStatus>("SCHEDULED");

  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalError, setModalError] = useState("");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function fetchMatches() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/matches", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminMatchesResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch matches.");
      }

      setMatches(data.matches);
      setClubs(data.clubs);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch matches."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!editingMatch) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingMatch]);

  function openEditModal(match: AdminMatch) {
    setEditingMatch(match);
    setClubOneId(match.clubOneId);
    setClubTwoId(match.clubTwoId);
    setClubOneScore(String(match.clubOneScore));
    setClubTwoScore(String(match.clubTwoScore));
    setDate(formatDateTimeLocal(match.date));
    setStatusValue(match.status);
    setModalError("");
    setStatus("idle");
    setMessage("");
  }

  function closeEditModal() {
    setEditingMatch(null);
    setClubOneId("");
    setClubTwoId("");
    setClubOneScore("0");
    setClubTwoScore("0");
    setDate("");
    setStatusValue("SCHEDULED");
    setSaving(false);
    setModalError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingMatch) return;

    if (clubOneId === clubTwoId) {
      setModalError("The two clubs must be different.");
      return;
    }

    const parsedClubOneScore = Number.parseInt(clubOneScore, 10);
    const parsedClubTwoScore = Number.parseInt(clubTwoScore, 10);

    if (
      Number.isNaN(parsedClubOneScore) ||
      Number.isNaN(parsedClubTwoScore) ||
      parsedClubOneScore < 0 ||
      parsedClubTwoScore < 0
    ) {
      setModalError("Scores must be valid positive numbers.");
      return;
    }

    setSaving(true);
    setModalError("");
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/matches/${editingMatch.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubOneId,
          clubTwoId,
          clubOneScore: parsedClubOneScore,
          clubTwoScore: parsedClubTwoScore,
          date,
          status: statusValue,
        }),
      });

      const data = (await response.json()) as SingleMatchResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to update match.");
      }

      setMatches((currentMatches: AdminMatch[]) =>
        sortMatches(
          currentMatches.map((match: AdminMatch) =>
            match.id === data.match.id ? data.match : match
          )
        )
      );

      setStatus("success");
      setMessage("Match updated successfully.");
      closeEditModal();
    } catch (error: unknown) {
      setModalError(
        error instanceof Error ? error.message : "Failed to update match."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(match: AdminMatch) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${match.clubOne.clubName} vs ${match.clubTwo.clubName}?`
    );

    if (!confirmed) return;

    setDeletingId(match.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/matches/${match.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete match.");
      }

      setMatches((currentMatches: AdminMatch[]) =>
        currentMatches.filter(
          (currentMatch: AdminMatch) => currentMatch.id !== match.id
        )
      );

      setStatus("success");
      setMessage("Match deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to delete match."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mt-6 w-full rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-9">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
            <Trophy className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
              STTF Admin
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
              Manage Matches
            </h2>
            <p className="mt-1 text-sm text-white/50">
              View, edit, update scores, or delete match records.
            </p>
          </div>
        </div>

        <div className="mb-7 h-px bg-white/[0.08]" />

        {status !== "idle" && (
          <div
            className={`mb-5 flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium ${
              status === "success"
                ? "border-[#00c896]/30 bg-[#00c896]/10 text-[#00e0aa]"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[22px] border border-white/[0.1] bg-white/[0.04]">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Loader2 className="h-5 w-5 animate-spin text-[#00c896]" />
              Loading matches...
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No matches found
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Created matches will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match: AdminMatch) => (
              <article
                key={match.id}
                className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] lg:grid-cols-[1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(
                        match.status
                      )}`}
                    >
                      {match.status}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDisplayDate(match.date)}
                    </span>
                  </div>

                  <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                    <div className="flex items-center gap-3">
                      <ClubLogo club={match.clubOne} />
                      <p className="truncate text-sm font-semibold text-white">
                        {match.clubOne.clubName}
                      </p>
                    </div>

                    <div className="flex items-center justify-center rounded-2xl border border-white/[0.1] bg-black/20 px-4 py-2">
                      <span className="text-2xl font-black text-white">
                        {match.clubOneScore}
                      </span>
                      <span className="mx-3 text-white/30">-</span>
                      <span className="text-2xl font-black text-white">
                        {match.clubTwoScore}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 md:justify-end">
                      <p className="truncate text-sm font-semibold text-white md:text-right">
                        {match.clubTwo.clubName}
                      </p>
                      <ClubLogo club={match.clubTwo} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:justify-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(match)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === match.id}
                    onClick={() => handleDelete(match)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === match.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {mounted && editingMatch
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md">
              <div
                className="absolute inset-0"
                onClick={closeEditModal}
                aria-hidden="true"
              />

              <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/[0.14] bg-[#07110d] p-6 text-white shadow-[0_32px_80px_rgba(0,0,0,0.85)] md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                      Edit Match
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Update Match Information
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 transition hover:bg-white/[0.1] hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {modalError && (
                  <div className="mb-5 flex items-center gap-3 rounded-[14px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {modalError}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Club One</label>
                      <select
                        value={clubOneId}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setClubOneId(event.target.value)
                        }
                        className={selectClass}
                      >
                        {clubs.map((club: ClubOption) => (
                          <option
                            key={club.id}
                            value={club.id}
                            style={{ background: "#003d34" }}
                          >
                            {club.clubName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Club Two</label>
                      <select
                        value={clubTwoId}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setClubTwoId(event.target.value)
                        }
                        className={selectClass}
                      >
                        {clubs.map((club: ClubOption) => (
                          <option
                            key={club.id}
                            value={club.id}
                            style={{ background: "#003d34" }}
                          >
                            {club.clubName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Club One Score</label>
                      <input
                        type="number"
                        min={0}
                        value={clubOneScore}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setClubOneScore(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Club Two Score</label>
                      <input
                        type="number"
                        min={0}
                        value={clubTwoScore}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setClubTwoScore(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Match Date</label>
                      <div className="relative">
                        <Clock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                          type="datetime-local"
                          required
                          value={date}
                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            setDate(event.target.value)
                          }
                          className={`${inputClass} pl-11`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Status</label>
                      <select
                        value={statusValue}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setStatusValue(event.target.value as MatchStatus)
                        }
                        className={selectClass}
                      >
                        {MATCH_STATUSES.map(
                          (item: { label: string; value: MatchStatus }) => (
                            <option
                              key={item.value}
                              value={item.value}
                              style={{ background: "#003d34" }}
                            >
                              {item.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] py-[13px] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Changes…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

function ClubLogo({ club }: { club: ClubOption }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.06]">
      {club.logo ? (
        <img
          src={club.logo}
          alt={club.clubName}
          className="h-full w-full object-contain p-1.5"
        />
      ) : (
        <Shield className="h-5 w-5 text-white/25" />
      )}
    </div>
  );
}