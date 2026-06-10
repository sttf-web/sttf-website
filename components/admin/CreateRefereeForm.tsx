"use client";

import { useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserRoundCheck,
} from "lucide-react";

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

export default function CreateRefereeForm() {
  const [name, setName] = useState("");

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
    setName("");
    setPicture(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    if (picture) formData.append("picture", picture);

    try {
      const res = await fetch("/api/admin/referees", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create referee");

      setStatus("success");
      setMessage("Referee created successfully.");
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
          <UserRoundCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
            STTF Admin
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
            Create Referee
          </h2>
          <p className="mt-1 text-sm text-white/50">
            Add a new referee to the federation database.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-7 h-px bg-white/[0.08]" />

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Name ── */}
        <div>
          <label className={labelClass}>
            Referee Name <span className="text-[#00c896]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setStatus("idle");
              setMessage("");
            }}
            placeholder="Enter referee name"
            className={inputClass}
          />
        </div>

        {/* ── Picture upload ── */}
        <div>
          <label className={labelClass}>Referee Picture</label>

          <label className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
            {previewUrl ? (
              <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-[#00c896]/35 bg-white/[0.08]">
                <img
                  src={previewUrl}
                  alt="Referee preview"
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
                {previewUrl ? "Change picture" : "Upload referee picture"}
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
              Creating Referee…
            </>
          ) : (
            "Create Referee"
          )}
        </button>
      </form>
    </section>
  );
}
