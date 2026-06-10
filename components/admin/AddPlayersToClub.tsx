"use client";

import { useEffect, useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  UserPlus,
  MapPin,
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

type PlayerDivision = "MEN" | "YOUTH" | "WOMEN" | "PARALYMPIC";

const DIVISIONS: { label: string; value: PlayerDivision }[] = [
  { label: "Men", value: "MEN" },
  { label: "Youth", value: "YOUTH" },
  { label: "Women", value: "WOMEN" },
  { label: "Paralympic", value: "PARALYMPIC" },
];

/* ── Shared styles ─────────────────────────────────────────── */
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 16px center",
  paddingRight: "40px",
  cursor: "pointer",
};

function applyFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "rgba(0,200,150,0.5)";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,200,150,0.15)";
}

function removeFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
  e.currentTarget.style.boxShadow = "none";
}

export default function AddPlayersToClub() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState("");

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [ranking, setRanking] = useState("");
  const [number, setNumber] = useState("");
  const [division, setDivision] = useState<PlayerDivision>("MEN");

  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [fetchingClubs, setFetchingClubs] = useState(true);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  useEffect(() => {
    async function fetchClubs() {
      try {
        setFetchingClubs(true);
        const res = await fetch("/api/admin/clubs", {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch clubs");
        setClubs(data.clubs || []);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Failed to fetch clubs"
        );
      } finally {
        setFetchingClubs(false);
      }
    }
    fetchClubs();
  }, []);

  function handlePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function resetForm() {
    setName("");
    setAge("");
    setCountry("");
    setRanking("");
    setNumber("");
    setDivision("MEN");
    setPicture(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedClubId) {
      setStatus("error");
      setMessage("Please select a club first.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("clubId", selectedClubId);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("country", country);
    formData.append("ranking", ranking);
    formData.append("number", number);
    formData.append("division", division);
    if (picture) formData.append("picture", picture);

    try {
      const res = await fetch("/api/admin/players", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add player");

      setStatus("success");
      setMessage("Player added to club successfully.");
      resetForm();

      setClubs((prev) =>
        prev.map((club) =>
          club.id === selectedClubId
            ? { ...club, _count: { players: club._count.players + 1 } }
            : club
        )
      );
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
      className="w-full text-white mt-6"
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8 flex items-start gap-4">
        <div
          style={{
            background: "linear-gradient(135deg, #00c896, #008f6a)",
            boxShadow: "0 8px 24px rgba(0,200,150,0.35)",
            borderRadius: "16px",
          }}
          className="flex h-12 w-12 shrink-0 items-center justify-center"
        >
          <UserPlus className="h-6 w-6 text-white" />
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
            Add Players To Club
          </h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Select a club, then add player information to link them directly.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mb-7"
        style={{ height: "1px", background: "rgba(255,255,255,0.08)" }}
      />

      {/* ── Club selector ────────────────────────────────────── */}
      <div className="mb-5">
        <label
          className="mb-2 block text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          Select Club
        </label>
        <select
          value={selectedClubId}
          onChange={(e) => {
            setSelectedClubId(e.target.value);
            setStatus("idle");
            setMessage("");
          }}
          disabled={fetchingClubs}
          style={{
            ...selectStyle,
            opacity: fetchingClubs ? 0.5 : 1,
            cursor: fetchingClubs ? "not-allowed" : "pointer",
          }}
          onFocus={applyFocus}
          onBlur={removeFocus}
        >
          <option value="" style={{ background: "#003d34" }}>
            {fetchingClubs ? "Loading clubs…" : "Choose a club"}
          </option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id} style={{ background: "#003d34" }}>
              {club.clubName}
            </option>
          ))}
        </select>
      </div>

      {/* ── Selected club card ───────────────────────────────── */}
      {selectedClub && (
        <div
          className="mb-6 flex items-center gap-4"
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(0,200,150,0.2)",
            background: "rgba(0,200,150,0.07)",
            padding: "14px 16px",
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
            style={{
              borderRadius: "12px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {selectedClub.logo ? (
              <img
                src={selectedClub.logo}
                alt={selectedClub.clubName}
                className="h-full w-full object-contain p-1.5"
              />
            ) : (
              <Users className="h-6 w-6" style={{ color: "#00c896" }} />
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white" style={{ fontSize: "14px" }}>
              {selectedClub.clubName}
            </h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {selectedClub.location && (
                <>
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{selectedClub.location}</span>
                  <span className="mx-1">·</span>
                </>
              )}
              <Users className="h-3 w-3 shrink-0" />
              {selectedClub._count.players} players
            </p>
          </div>
        </div>
      )}

      {/* ── Player form ──────────────────────────────────────── */}
      {selectedClubId ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Player Name */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Player Name <span style={{ color: "#00c896" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter player name"
              style={inputStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            />
          </div>

          {/* 2-col grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Age
              </label>
              <input
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Player age"
                style={inputStyle}
                onFocus={applyFocus}
                onBlur={removeFocus}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                style={inputStyle}
                onFocus={applyFocus}
                onBlur={removeFocus}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Ranking
              </label>
              <input
                type="number"
                min="0"
                value={ranking}
                onChange={(e) => setRanking(e.target.value)}
                placeholder="Ranking"
                style={inputStyle}
                onFocus={applyFocus}
                onBlur={removeFocus}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Player Number
              </label>
              <input
                type="number"
                min="0"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Player number"
                style={inputStyle}
                onFocus={applyFocus}
                onBlur={removeFocus}
              />
            </div>
          </div>

          {/* Division */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Division
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value as PlayerDivision)}
              style={selectStyle}
              onFocus={applyFocus}
              onBlur={removeFocus}
            >
              {DIVISIONS.map((item) => (
                <option key={item.value} value={item.value} style={{ background: "#003d34" }}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Player image upload */}
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Player Image
            </label>

            <label
              className="flex cursor-pointer flex-col items-center justify-center gap-3 transition-all"
              style={{
                borderRadius: "18px",
                border: "1.5px dashed rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.04)",
                padding: "28px 24px",
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
                  className="h-28 w-28 overflow-hidden"
                  style={{
                    borderRadius: "50%",
                    border: "2px solid rgba(0,200,150,0.35)",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  <img
                    src={previewUrl}
                    alt="Player preview"
                    className="h-full w-full object-cover"
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
                  {previewUrl ? "Change photo" : "Upload player image"}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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
              boxShadow: loading ? "none" : "0 8px 24px rgba(0,200,150,0.35)",
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
                Adding Player…
              </>
            ) : (
              "Add Player To Club"
            )}
          </button>
        </form>
      ) : (
        /* ── Empty state ─────────────────────────────────────── */
        <div
          className="flex flex-col items-center justify-center gap-3 text-center"
          style={{
            borderRadius: "18px",
            border: "1.5px dashed rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            padding: "40px 24px",
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center"
            style={{
              borderRadius: "14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Users className="h-6 w-6" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            Select a club above to open the player form.
          </p>
        </div>
      )}
    </section>
  );
}
