"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trophy,
  CalendarDays,
  Swords,
} from "lucide-react";

type Club = {
  id: string;
  clubName: string;
  location: string | null;
  logo: string | null;
  _count: {
    players: number;
  };
};

type MatchStatus =
  | "SCHEDULED"
  | "LIVE"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED";

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
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

export default function CreateMatchForm() {
  const [clubs, setClubs] = useState<Club[]>([]);

  const [clubOneId, setClubOneId] = useState("");
  const [clubTwoId, setClubTwoId] = useState("");

  const [clubOneScore, setClubOneScore] = useState("0");
  const [clubTwoScore, setClubTwoScore] = useState("0");

  const [date, setDate] = useState("");
  const [status, setStatus] = useState<MatchStatus>("SCHEDULED");

  const [fetchingClubs, setFetchingClubs] = useState(true);
  const [loading, setLoading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const clubOne = useMemo(() => clubs.find((c) => c.id === clubOneId), [clubs, clubOneId]);
  const clubTwo = useMemo(() => clubs.find((c) => c.id === clubTwoId), [clubs, clubTwoId]);

  useEffect(() => {
    async function fetchClubs() {
      try {
        setFetchingClubs(true);
        const res = await fetch("/api/admin/clubs", { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch clubs");
        setClubs(data.clubs || []);
      } catch (error) {
        setSubmitStatus("error");
        setMessage(error instanceof Error ? error.message : "Failed to fetch clubs");
      } finally {
        setFetchingClubs(false);
      }
    }
    fetchClubs();
  }, []);

  function resetForm() {
    setClubOneId("");
    setClubTwoId("");
    setClubOneScore("0");
    setClubTwoScore("0");
    setDate("");
    setStatus("SCHEDULED");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSubmitStatus("idle");
    setMessage("");

    if (!clubOneId || !clubTwoId) {
      setSubmitStatus("error");
      setMessage("Please select both clubs.");
      setLoading(false);
      return;
    }
    if (clubOneId === clubTwoId) {
      setSubmitStatus("error");
      setMessage("A club cannot play against itself.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("clubOneId", clubOneId);
    formData.append("clubTwoId", clubTwoId);
    formData.append("clubOneScore", clubOneScore);
    formData.append("clubTwoScore", clubTwoScore);
    formData.append("date", date);
    formData.append("status", status);

    try {
      const res = await fetch("/api/admin/matches", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create match");

      setSubmitStatus("success");
      setMessage(
        status === "FINISHED"
          ? "Match created and league table updated successfully."
          : "Match created successfully."
      );
      resetForm();
    } catch (error) {
      setSubmitStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full mt-6 rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-9 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
          <Swords className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
            STTF Admin
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
            Post Match
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Select two clubs, add the score, and post the match. Finished matches automatically update the league table.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-7 h-px bg-white/[0.08]" />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Club selectors ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Club One <span className="text-[#00c896]">*</span></label>
            <select
              value={clubOneId}
              onChange={(e) => { setClubOneId(e.target.value); setSubmitStatus("idle"); setMessage(""); }}
              disabled={fetchingClubs}
              required
              className={selectClass}
            >
              <option value="" style={{ background: "#003d34" }}>
                {fetchingClubs ? "Loading clubs…" : "Choose club one"}
              </option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id} disabled={club.id === clubTwoId} style={{ background: "#003d34" }}>
                  {club.clubName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Club Two <span className="text-[#00c896]">*</span></label>
            <select
              value={clubTwoId}
              onChange={(e) => { setClubTwoId(e.target.value); setSubmitStatus("idle"); setMessage(""); }}
              disabled={fetchingClubs}
              required
              className={selectClass}
            >
              <option value="" style={{ background: "#003d34" }}>
                {fetchingClubs ? "Loading clubs…" : "Choose club two"}
              </option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id} disabled={club.id === clubOneId} style={{ background: "#003d34" }}>
                  {club.clubName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Matchup preview card ── */}
        {(clubOne || clubTwo) && (
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">

            {/* Club One card */}
            <div className="rounded-[18px] border border-white/[0.1] bg-white/[0.05] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Club One
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.15] bg-white/10">
                  {clubOne?.logo ? (
                    <img src={clubOne.logo} alt={clubOne.clubName} className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <Trophy className="h-5 w-5 text-[#00c896]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {clubOne?.clubName ?? "Not selected"}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {clubOne?.location ?? "No location"}
                  </p>
                </div>
              </div>
            </div>

            {/* VS badge */}
            <div className="hidden md:flex items-center justify-center">
              <span className="rounded-full border border-[#00c896]/30 bg-[#00c896]/10 px-3 py-1 text-xs font-black tracking-widest text-[#00e0aa]">
                VS
              </span>
            </div>

            {/* Club Two card */}
            <div className="rounded-[18px] border border-white/[0.1] bg-white/[0.05] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Club Two
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.15] bg-white/10">
                  {clubTwo?.logo ? (
                    <img src={clubTwo.logo} alt={clubTwo.clubName} className="h-full w-full object-contain p-1.5" />
                  ) : (
                    <Trophy className="h-5 w-5 text-[#00c896]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {clubTwo?.clubName ?? "Not selected"}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {clubTwo?.location ?? "No location"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Score inputs ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Club One Score</label>
            <input
              type="number"
              min="0"
              value={clubOneScore}
              onChange={(e) => setClubOneScore(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Club Two Score</label>
            <input
              type="number"
              min="0"
              value={clubTwoScore}
              onChange={(e) => setClubTwoScore(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* ── Date & Status ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Match Date <span className="text-[#00c896]">*</span></label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Match Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MatchStatus)}
              className={selectClass}
            >
              {MATCH_STATUSES.map((item) => (
                <option key={item.value} value={item.value} style={{ background: "#003d34" }}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Status info banner ── */}
        {status === "FINISHED" ? (
          <div className="flex items-start gap-3 rounded-[14px] border border-[#00c896]/25 bg-[#00c896]/10 p-4 text-sm font-medium text-[#00e0aa]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            Submitting will update the league standings for both clubs.
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-[14px] border border-white/[0.08] bg-white/[0.04] p-4 text-sm text-white/40">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            League table updates only happen when the match status is <span className="ml-1 font-semibold text-white/60">Finished</span>.
          </div>
        )}

        {/* ── Submit status banner ── */}
        {submitStatus !== "idle" && (
          <div
            className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium ${
              submitStatus === "success"
                ? "border-[#00c896]/30 bg-[#00c896]/10 text-[#00e0aa]"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {submitStatus === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {message}
          </div>
        )}

        {/* ── Submit button ── */}
        <button
          type="submit"
          disabled={loading || fetchingClubs}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] py-[13px] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting Match…
            </>
          ) : (
            "Post Match"
          )}
        </button>
      </form>
    </section>
  );
}
