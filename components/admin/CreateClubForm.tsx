"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

export default function CreateClubForm() {
  const [clubName, setClubName] = useState("");
  const [location, setLocation] = useState("");
  const [coach, setCoach] = useState("");
  const [manager, setManager] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogo(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("clubName", clubName);
    formData.append("location", location);
    formData.append("coach", coach);
    formData.append("manager", manager);
    formData.append("phoneNumber", phoneNumber);
    if (logo) formData.append("logo", logo);

    try {
      const res = await fetch("/api/admin/clubs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create club");

      setStatus("success");
      setMessage("Club created successfully.");
      setClubName("");
      setLocation("");
      setCoach("");
      setManager("");
      setPhoneNumber("");
      setLogo(null);
      setPreviewUrl(null);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 32px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        backdropFilter: "blur(24px)",
        borderRadius: "28px",
        padding: "36px",
      }}
      className="w-full text-white"
    >
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div
          style={{
            background: "linear-gradient(135deg, #00c896, #008f6a)",
            boxShadow: "0 8px 24px rgba(0,200,150,0.35)",
            borderRadius: "16px",
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <Building2 className="h-6 w-6 text-white" />
        </div>

        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "#00e0aa" }}
          >
            STTF Admin
          </p>
          <h2
            className="mt-0.5 font-bold leading-tight"
            style={{ fontSize: "20px", letterSpacing: "-0.4px" }}
          >
            Create New Club
          </h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Add a new club to the federation database.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mb-8"
        style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Club Name — full width */}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Club Name <span style={{ color: "#00c896" }}>*</span>
          </label>
          <input
            type="text"
            required
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="Enter club name"
            style={inputStyle}
            onFocus={(e) => applyFocus(e)}
            onBlur={(e) => removeFocus(e)}
          />
        </div>

        {/* 2-column grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Club location"
              style={inputStyle}
              onFocus={(e) => applyFocus(e)}
              onBlur={(e) => removeFocus(e)}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Phone Number
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              style={inputStyle}
              onFocus={(e) => applyFocus(e)}
              onBlur={(e) => removeFocus(e)}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Coach
            </label>
            <input
              type="text"
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
              placeholder="Coach name"
              style={inputStyle}
              onFocus={(e) => applyFocus(e)}
              onBlur={(e) => removeFocus(e)}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Manager
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Manager name"
              style={inputStyle}
              onFocus={(e) => applyFocus(e)}
              onBlur={(e) => removeFocus(e)}
            />
          </div>
        </div>

        {/* Logo upload */}
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Club Logo
          </label>

          <label
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 transition-all"
            style={{
              borderRadius: "18px",
              border: "1.5px dashed rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.04)",
              padding: "32px 24px",
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor =
                "rgba(0,200,150,0.55)";
              (e.currentTarget as HTMLLabelElement).style.background =
                "rgba(0,200,150,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLLabelElement).style.borderColor =
                "rgba(255,255,255,0.18)";
              (e.currentTarget as HTMLLabelElement).style.background =
                "rgba(255,255,255,0.04)";
            }}
          >
            {previewUrl ? (
              <div
                className="relative h-24 w-24 overflow-hidden"
                style={{
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Image
                  src={previewUrl}
                  alt="Club logo preview"
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center"
                style={{
                  borderRadius: "14px",
                  background: "rgba(0,200,150,0.12)",
                  border: "1px solid rgba(0,200,150,0.2)",
                }}
              >
                <Upload className="h-6 w-6" style={{ color: "#00c896" }} />
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-white">
                {previewUrl ? "Change logo" : "Upload club logo"}
              </p>
              <p
                className="mt-0.5 text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                JPG, PNG, WEBP, or SVG · Max 5 MB
              </p>
            </div>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Status banner */}
        {status !== "idle" && (
          <div
            className="flex items-center gap-3 text-sm font-medium"
            style={{
              borderRadius: "14px",
              padding: "12px 16px",
              background:
                status === "success"
                  ? "rgba(0,200,150,0.12)"
                  : "rgba(239,68,68,0.15)",
              border:
                status === "success"
                  ? "1px solid rgba(0,200,150,0.3)"
                  : "1px solid rgba(239,68,68,0.3)",
              color: status === "success" ? "#00e0aa" : "#fca5a5",
            }}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-white transition-all"
          style={{
            borderRadius: "14px",
            padding: "13px",
            background: loading
              ? "rgba(0,200,150,0.4)"
              : "linear-gradient(135deg, #00c896, #008f6a)",
            boxShadow: loading
              ? "none"
              : "0 8px 24px rgba(0,200,150,0.35)",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 12px 32px rgba(0,200,150,0.45)";
          }}
          onMouseLeave={(e) => {
            if (!loading)
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 24px rgba(0,200,150,0.35)";
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Club…
            </>
          ) : (
            "Create Club"
          )}
        </button>
      </form>
    </section>
  );
}

/* ── Shared input style ─────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: "14px",
  padding: "12px 16px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function applyFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(0,200,150,0.5)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,200,150,0.15)";
}

function removeFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
  e.currentTarget.style.boxShadow = "none";
}
