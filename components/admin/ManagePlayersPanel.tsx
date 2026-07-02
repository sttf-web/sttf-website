"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Flag,
  Hash,
  Loader2,
  Pencil,
  Save,
  Shield,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type PlayerDivision = "MEN" | "YOUTH" | "WOMEN" | "PARALYMPIC";

type ClubOption = {
  id: string;
  clubName: string;
  logo: string | null;
};

type AdminPlayer = {
  id: string;
  name: string;
  age: number | null;
  picture: string | null;
  country: string | null;
  ranking: number | null;
  number: number | null;
  division: PlayerDivision;
  clubId: string | null;
  club: ClubOption | null;
};

type AdminPlayersResponse = {
  success: boolean;
  players: AdminPlayer[];
  clubs: ClubOption[];
  error?: string;
};

type SinglePlayerResponse = {
  success: boolean;
  player: AdminPlayer;
  error?: string;
};

const PLAYER_DIVISIONS: { label: string; value: PlayerDivision }[] = [
  { label: "Men", value: "MEN" },
  { label: "Youth", value: "YOUTH" },
  { label: "Women", value: "WOMEN" },
  { label: "Paralympic", value: "PARALYMPIC" },
];

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const selectClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15 appearance-none cursor-pointer";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

function sortPlayers(players: AdminPlayer[]) {
  return [...players].sort((playerA: AdminPlayer, playerB: AdminPlayer) =>
    playerA.name.localeCompare(playerB.name)
  );
}

function getNullableNumber(value: string) {
  if (value.trim().length === 0) {
    return null;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
}

export default function ManagePlayersPanel() {
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingPlayer, setEditingPlayer] = useState<AdminPlayer | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [ranking, setRanking] = useState("");
  const [number, setNumber] = useState("");
  const [division, setDivision] = useState<PlayerDivision>("MEN");
  const [clubId, setClubId] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalError, setModalError] = useState("");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function fetchPlayers() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/players", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminPlayersResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch players.");
      }

      setPlayers(data.players);
      setClubs(data.clubs);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch players."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!editingPlayer) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingPlayer]);

  function openEditModal(player: AdminPlayer) {
    setEditingPlayer(player);
    setName(player.name);
    setAge(player.age === null ? "" : String(player.age));
    setCountry(player.country ?? "");
    setRanking(player.ranking === null ? "" : String(player.ranking));
    setNumber(player.number === null ? "" : String(player.number));
    setDivision(player.division);
    setClubId(player.clubId ?? "");
    setPicture(null);
    setPreviewUrl(player.picture);
    setModalError("");
    setStatus("idle");
    setMessage("");
  }

  function closeEditModal() {
    setEditingPlayer(null);
    setName("");
    setAge("");
    setCountry("");
    setRanking("");
    setNumber("");
    setDivision("MEN");
    setClubId("");
    setPicture(null);
    setPreviewUrl(null);
    setSaving(false);
    setModalError("");
  }

  function handlePictureChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingPlayer) return;

    if (name.trim().length === 0) {
      setModalError("Player name is required.");
      return;
    }

    setSaving(true);
    setModalError("");
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("country", country);
    formData.append("ranking", ranking);
    formData.append("number", number);
    formData.append("division", division);
    formData.append("clubId", clubId);

    if (picture) {
      formData.append("picture", picture);
    }

    try {
      const response = await fetch(`/api/admin/players/${editingPlayer.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = (await response.json()) as SinglePlayerResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to update player.");
      }

      setPlayers((currentPlayers: AdminPlayer[]) =>
        sortPlayers(
          currentPlayers.map((player: AdminPlayer) =>
            player.id === data.player.id ? data.player : player
          )
        )
      );

      setStatus("success");
      setMessage("Player updated successfully.");
      closeEditModal();
    } catch (error: unknown) {
      setModalError(
        error instanceof Error ? error.message : "Failed to update player."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(player: AdminPlayer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${player.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(player.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/players/${player.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete player.");
      }

      setPlayers((currentPlayers: AdminPlayer[]) =>
        currentPlayers.filter(
          (currentPlayer: AdminPlayer) => currentPlayer.id !== player.id
        )
      );

      setStatus("success");
      setMessage("Player deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to delete player."
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
            <UsersRound className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
              STTF Admin
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
              Manage Players
            </h2>
            <p className="mt-1 text-sm text-white/50">
              View, edit, update club assignment, or delete player records.
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
              Loading players...
            </div>
          </div>
        ) : players.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
            <UsersRound className="mx-auto h-10 w-10 text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No players found
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Created players will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {players.map((player: AdminPlayer) => (
              <article
                key={player.id}
                className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] md:grid-cols-[88px_1fr_auto]"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.06]">
                  {player.picture ? (
                    <img
                      src={player.picture}
                      alt={player.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-8 w-8 text-white/25" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-bold text-white">
                      {player.name}
                    </h3>

                    <span className="rounded-full border border-[#00c896]/25 bg-[#00c896]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00e0aa]">
                      {player.division}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
                    {player.country && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                        <Flag className="h-3.5 w-3.5" />
                        {player.country}
                      </span>
                    )}

                    {player.number !== null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                        <Hash className="h-3.5 w-3.5" />
                        No. {player.number}
                      </span>
                    )}

                    {player.ranking !== null && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                        Ranking {player.ranking}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                      Age {player.age ?? "Not set"}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
                    <ClubLogo club={player.club} />
                    <span>
                      <span className="text-white/65">Club:</span>{" "}
                      {player.club?.clubName ?? "No club assigned"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(player)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === player.id}
                    onClick={() => handleDelete(player)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === player.id ? (
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

      {mounted && editingPlayer
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
                      Edit Player
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Update Player Information
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
                  <div>
                    <label className={labelClass}>
                      Player Name <span className="text-[#00c896]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setName(event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Division</label>
                      <select
                        value={division}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setDivision(event.target.value as PlayerDivision)
                        }
                        className={selectClass}
                      >
                        {PLAYER_DIVISIONS.map(
                          (item: { label: string; value: PlayerDivision }) => (
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

                    <div>
                      <label className={labelClass}>Club</label>
                      <select
                        value={clubId}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          setClubId(event.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="" style={{ background: "#003d34" }}>
                          No club
                        </option>

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
                      <label className={labelClass}>Age</label>
                      <input
                        type="number"
                        min={0}
                        value={age}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setAge(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setCountry(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Ranking</label>
                      <input
                        type="number"
                        min={0}
                        value={ranking}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setRanking(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Player Number</label>
                      <input
                        type="number"
                        min={0}
                        value={number}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setNumber(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Player Picture</label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
                      {previewUrl ? (
                        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08]">
                          <img
                            src={previewUrl}
                            alt="Player preview"
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
                          {previewUrl ? "Change picture" : "Upload player picture"}
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

function ClubLogo({ club }: { club: ClubOption | null }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.1] bg-white/[0.06]">
      {club?.logo ? (
        <img
          src={club.logo}
          alt={club.clubName}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Shield className="h-4 w-4 text-white/25" />
      )}
    </div>
  );
}