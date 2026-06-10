"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Newspaper,
  CalendarDays,
} from "lucide-react";

type NewsTag =
  | "GENERAL"
  | "PARTNERSHIPS"
  | "TRAINING"
  | "TECH"
  | "EVENT"
  | "FEDERATION"
  | "TOURNAMENT"
  | "LEAGUE"
  | "CLUB"
  | "PLAYER"
  | "MEDIA";

const NEWS_TAGS: { label: string; value: NewsTag }[] = [
  { label: "General", value: "GENERAL" },
  { label: "Partnerships", value: "PARTNERSHIPS" },
  { label: "Training", value: "TRAINING" },
  { label: "Tech", value: "TECH" },
  { label: "Event", value: "EVENT" },
  { label: "Federation", value: "FEDERATION" },
  { label: "Tournament", value: "TOURNAMENT" },
  { label: "League", value: "LEAGUE" },
  { label: "Club", value: "CLUB" },
  { label: "Player", value: "PLAYER" },
  { label: "Media", value: "MEDIA" },
];

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const selectClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15 appearance-none cursor-pointer";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

export default function CreateNewsForm() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tag, setTag] = useState<NewsTag>("GENERAL");
  const [date, setDate] = useState("");
  const [published, setPublished] = useState(true);

  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handlePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("");
  }

  function resetForm() {
    setTitle("");
    setText("");
    setTag("GENERAL");
    setDate("");
    setPublished(true);
    setPicture(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    formData.append("tag", tag);
    formData.append("date", date);
    formData.append("published", published ? "true" : "false");
    if (picture) formData.append("picture", picture);

    try {
      const res = await fetch("/api/admin/news", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create news");

      setStatus("success");
      setMessage("News created successfully.");
      resetForm();
    } catch (error) {
      setStatus("error");
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
          <Newspaper className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
            STTF Admin
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
            Create News
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Publish federation updates, tournament announcements, club news, and media posts.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-7 h-px bg-white/[0.08]" />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Title ── */}
        <div>
          <label className={labelClass}>
            News Title <span className="text-[#00c896]">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => { setTitle(e.target.value); setStatus("idle"); setMessage(""); }}
            placeholder="Enter news title"
            className={inputClass}
          />
        </div>

        {/* ── Tag & Date ── */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>News Tag</label>
            <select
              value={tag}
              onChange={(e) => { setTag(e.target.value as NewsTag); setStatus("idle"); setMessage(""); }}
              className={selectClass}
            >
              {NEWS_TAGS.map((item) => (
                <option key={item.value} value={item.value} style={{ background: "#003d34" }}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>News Date</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => { setDate(e.target.value); setStatus("idle"); setMessage(""); }}
                className={`${inputClass} pl-11`}
              />
            </div>
          </div>
        </div>

        {/* ── Body text ── */}
        <div>
          <label className={labelClass}>
            News Text <span className="text-[#00c896]">*</span>
          </label>
          <textarea
            required
            value={text}
            onChange={(e) => { setText(e.target.value); setStatus("idle"); setMessage(""); }}
            placeholder="Write the full news article here…"
            rows={8}
            className="w-full resize-none rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15"
          />
        </div>

        {/* ── Image upload ── */}
        <div>
          <label className={labelClass}>News Image</label>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
            {previewUrl ? (
              <div className="h-44 w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08]">
                <img
                  src={previewUrl}
                  alt="News preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10">
                <Upload className="h-6 w-6 text-[#00c896]" />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-white">
                {previewUrl ? "Change image" : "Upload news image"}
              </p>
              <p className="mt-0.5 text-xs text-white/40">
                JPG, PNG, or WEBP · Max 5 MB
              </p>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePictureChange}
              className="hidden"
            />
          </label>
        </div>

        {/* ── Published toggle ── */}
        <div className="flex items-center justify-between gap-4 rounded-[14px] border border-white/[0.1] bg-white/[0.05] p-4">
          <div>
            <p className="text-sm font-semibold text-white">Published</p>
            <p className="mt-0.5 text-xs text-white/40">
              Turn this off to save the news as a draft.
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setPublished((c) => !c); setStatus("idle"); setMessage(""); }}
            aria-pressed={published}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
              published ? "bg-[#00c896]" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
                published ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* ── Status banner ── */}
        {status !== "idle" && (
          <div
            className={`flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium ${
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

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] py-[13px] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating News…
            </>
          ) : (
            "Create News"
          )}
        </button>
      </form>
    </section>
  );
}
