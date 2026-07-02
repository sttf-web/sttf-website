"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Save,
  Trash2,
  Upload,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type AdminClub = {
  id: string;
  clubName: string;
  location: string | null;
  coach: string | null;
  manager: string | null;
  phoneNumber: string | null;
  logo: string | null;
  _count: {
    players: number;
  };
};

type AdminClubsResponse = {
  success: boolean;
  clubs: AdminClub[];
  error?: string;
};

type SingleClubResponse = {
  success: boolean;
  club: AdminClub;
  error?: string;
};

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

function sortClubs(clubs: AdminClub[]) {
  return [...clubs].sort((clubA: AdminClub, clubB: AdminClub) =>
    clubA.clubName.localeCompare(clubB.clubName)
  );
}

export default function ManageClubsPanel() {
  const [clubs, setClubs] = useState<AdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingClub, setEditingClub] = useState<AdminClub | null>(null);
  const [clubName, setClubName] = useState("");
  const [location, setLocation] = useState("");
  const [coach, setCoach] = useState("");
  const [manager, setManager] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [modalError, setModalError] = useState("");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function fetchClubs() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/clubs", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminClubsResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch clubs.");
      }

      setClubs(data.clubs);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to fetch clubs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (!editingClub) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [editingClub]);

  function openEditModal(club: AdminClub) {
    setEditingClub(club);
    setClubName(club.clubName);
    setLocation(club.location ?? "");
    setCoach(club.coach ?? "");
    setManager(club.manager ?? "");
    setPhoneNumber(club.phoneNumber ?? "");
    setLogo(null);
    setPreviewUrl(club.logo);
    setModalError("");
    setStatus("idle");
    setMessage("");
  }

  function closeEditModal() {
    setEditingClub(null);
    setClubName("");
    setLocation("");
    setCoach("");
    setManager("");
    setPhoneNumber("");
    setLogo(null);
    setPreviewUrl(null);
    setSaving(false);
    setModalError("");
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLogo(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalError("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingClub) return;

    setSaving(true);
    setModalError("");
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("clubName", clubName);
    formData.append("location", location);
    formData.append("coach", coach);
    formData.append("manager", manager);
    formData.append("phoneNumber", phoneNumber);

    if (logo) {
      formData.append("logo", logo);
    }

    try {
      const response = await fetch(`/api/admin/clubs/${editingClub.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = (await response.json()) as SingleClubResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to update club.");
      }

      setClubs((currentClubs: AdminClub[]) =>
        sortClubs(
          currentClubs.map((club: AdminClub) =>
            club.id === data.club.id ? data.club : club
          )
        )
      );

      setStatus("success");
      setMessage("Club updated successfully.");
      closeEditModal();
    } catch (error: unknown) {
      setModalError(error instanceof Error ? error.message : "Failed to update club.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(club: AdminClub) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${club.clubName}"?`
    );

    if (!confirmed) return;

    setDeletingId(club.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/clubs/${club.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete club.");
      }

      setClubs((currentClubs: AdminClub[]) =>
        currentClubs.filter((currentClub: AdminClub) => currentClub.id !== club.id)
      );

      setStatus("success");
      setMessage("Club deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to delete club.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mt-6 w-full rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-9">
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
            <Building2 className="h-6 w-6 text-white" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
              STTF Admin
            </p>
            <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
              Manage Clubs
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Edit club information, update logos, or delete club records.
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
              Loading clubs...
            </div>
          </div>
        ) : clubs.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No clubs found
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Created clubs will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clubs.map((club: AdminClub) => (
              <article
                key={club.id}
                className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] md:grid-cols-[88px_1fr_auto]"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.06]">
                  {club.logo ? (
                    <img
                      src={club.logo}
                      alt={club.clubName}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-white/25" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-white">
                    {club.clubName}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/45">
                    {club.location && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {club.location}
                      </span>
                    )}

                    {club.phoneNumber && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1">
                        <Phone className="h-3.5 w-3.5" />
                        {club.phoneNumber}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 rounded-full bg-[#00c896]/10 px-2.5 py-1 text-[#00e0aa]">
                      <UsersRound className="h-3.5 w-3.5" />
                      {club._count.players} players
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs text-white/40 sm:grid-cols-2">
                    <span>
                      <span className="text-white/65">Coach:</span>{" "}
                      {club.coach || "Not set"}
                    </span>
                    <span>
                      <span className="text-white/65">Manager:</span>{" "}
                      {club.manager || "Not set"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                  <button
                    type="button"
                    onClick={() => openEditModal(club)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === club.id}
                    onClick={() => handleDelete(club)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === club.id ? (
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

      {mounted && editingClub
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
                      Edit Club
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      Update Club Information
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
                      Club Name <span className="text-[#00c896]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clubName}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setClubName(event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setLocation(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setPhoneNumber(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Coach</label>
                      <input
                        type="text"
                        value={coach}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setCoach(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Manager</label>
                      <input
                        type="text"
                        value={manager}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setManager(event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Club Logo</label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
                      {previewUrl ? (
                        <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08]">
                          <img
                            src={previewUrl}
                            alt="Club logo preview"
                            className="h-full w-full object-contain p-3"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10">
                          <Upload className="h-6 w-6 text-[#00c896]" />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {previewUrl ? "Change logo" : "Upload club logo"}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          JPG, PNG, or WEBP · Max 5 MB
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
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