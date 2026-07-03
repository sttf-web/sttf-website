"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  UsersRound,
  X,
} from "lucide-react";

type AdminOrgMember = {
  id: string;
  name: string;
  role: string;
  image: string;
  featured: boolean;
  published: boolean;
  order: number;
};

type AdminOrgMembersResponse = {
  success: boolean;
  members: AdminOrgMember[];
  error?: string;
};

type SingleOrgMemberResponse = {
  success: boolean;
  member: AdminOrgMember;
  error?: string;
};

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

function sortMembers(members: AdminOrgMember[]) {
  return [...members].sort((memberA: AdminOrgMember, memberB: AdminOrgMember) => {
    if (memberA.featured !== memberB.featured) {
      return memberA.featured ? -1 : 1;
    }

    return memberA.order - memberB.order;
  });
}

export default function ManageOrgMembersPanel() {
  const [members, setMembers] = useState<AdminOrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingMember, setEditingMember] = useState<AdminOrgMember | null>(
    null
  );

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [order, setOrder] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function fetchMembers() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/org-members", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminOrgMembersResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch org members.");
      }

      setMembers(data.members);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch org members."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!modalMode) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalMode]);

  function resetForm() {
    setName("");
    setRole("");
    setOrder("0");
    setFeatured(false);
    setPublished(true);
    setImage(null);
    setPreviewUrl(null);
    setSaving(false);
    setModalError("");
  }

  function openCreateModal() {
    resetForm();
    setEditingMember(null);
    setModalMode("create");
    setStatus("idle");
    setMessage("");
  }

  function openEditModal(member: AdminOrgMember) {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setOrder(String(member.order));
    setFeatured(member.featured);
    setPublished(member.published);
    setImage(null);
    setPreviewUrl(member.image);
    setModalError("");
    setModalMode("edit");
    setStatus("idle");
    setMessage("");
  }

  function closeModal() {
    setModalMode(null);
    setEditingMember(null);
    resetForm();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalError("");
  }

  function applySavedMember(savedMember: AdminOrgMember, mode: "create" | "edit") {
    setMembers((currentMembers: AdminOrgMember[]) => {
      const nextMembers =
        mode === "edit"
          ? currentMembers.map((member: AdminOrgMember) =>
              member.id === savedMember.id ? savedMember : member
            )
          : [...currentMembers, savedMember];

      const normalizedMembers = savedMember.featured
        ? nextMembers.map((member: AdminOrgMember) =>
            member.id === savedMember.id
              ? savedMember
              : { ...member, featured: false }
          )
        : nextMembers;

      return sortMembers(normalizedMembers);
    });
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setModalError("Member name is required.");
      return;
    }

    if (role.trim().length === 0) {
      setModalError("Member role is required.");
      return;
    }

    if (modalMode === "create" && !image) {
      setModalError("Member image is required.");
      return;
    }

    setSaving(true);
    setModalError("");
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("order", order);
    formData.append("featured", featured ? "true" : "false");
    formData.append("published", published ? "true" : "false");

    if (image) {
      formData.append("image", image);
    }

    try {
      let endpoint = "/api/admin/org-members";
      let method: "POST" | "PATCH" = "POST";
      let saveMode: "create" | "edit" = "create";

      if (modalMode === "edit") {
        if (!editingMember) {
          throw new Error("No member selected.");
        }

        endpoint = `/api/admin/org-members/${editingMember.id}`;
        method = "PATCH";
        saveMode = "edit";
      }

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      const data = (await response.json()) as SingleOrgMemberResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to save org member.");
      }

      applySavedMember(data.member, saveMode);

      setStatus("success");
      setMessage(
        saveMode === "edit"
          ? "Org member updated successfully."
          : "Org member created successfully."
      );

      closeModal();
    } catch (error: unknown) {
      setModalError(
        error instanceof Error ? error.message : "Failed to save org member."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(member: AdminOrgMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${member.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(member.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/org-members/${member.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete org member.");
      }

      setMembers((currentMembers: AdminOrgMember[]) =>
        currentMembers.filter(
          (currentMember: AdminOrgMember) => currentMember.id !== member.id
        )
      );

      setStatus("success");
      setMessage("Org member deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to delete org member."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <section className="mt-6 w-full rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-9">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
              <UsersRound className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                STTF Admin
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
                Manage Board Members
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Add, edit, publish, feature, or delete board member profiles.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)]"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
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
              Loading org members...
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
            <UsersRound className="mx-auto h-10 w-10 text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No members found
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Board members will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {members.map((member: AdminOrgMember) => (
              <article
                key={member.id}
                className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] md:grid-cols-[88px_1fr_auto]"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.06]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-contain object-bottom"
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {member.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#00c896]/25 bg-[#00c896]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00e0aa]">
                        <Crown className="h-3.5 w-3.5" />
                        Top Featured
                      </span>
                    )}

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        member.published
                          ? "border-[#00c896]/25 bg-[#00c896]/10 text-[#00e0aa]"
                          : "border-white/15 bg-white/10 text-white/45"
                      }`}
                    >
                      {member.published ? "Published" : "Draft"}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/50">
                      Order {member.order}
                    </span>
                  </div>

                  <h3 className="truncate text-base font-bold text-white">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-sm text-white/50">{member.role}</p>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-[#00c896]/40 hover:text-[#00e0aa]"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </a>

                  <button
                    type="button"
                    onClick={() => openEditModal(member)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === member.id}
                    onClick={() => handleDelete(member)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === member.id ? (
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

      {mounted && modalMode
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-md">
              <div
                className="absolute inset-0"
                onClick={closeModal}
                aria-hidden="true"
              />

              <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/[0.14] bg-[#07110d] p-6 text-white shadow-[0_32px_80px_rgba(0,0,0,0.85)] md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                      {modalMode === "create" ? "Add Member" : "Edit Member"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {modalMode === "create"
                        ? "Create Board Member"
                        : "Update Board Member"}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
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
                      Member Name <span className="text-[#00c896]">*</span>
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

                  <div>
                    <label className={labelClass}>
                      Role <span className="text-[#00c896]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setRole(event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Order</label>
                    <input
                      type="number"
                      min={0}
                      value={order}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setOrder(event.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Member Image{" "}
                      {modalMode === "create" && (
                        <span className="text-[#00c896]">*</span>
                      )}
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
                      {previewUrl ? (
                        <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08]">
                          <img
                            src={previewUrl}
                            alt="Member preview"
                            className="h-full w-full object-contain object-bottom"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10">
                          <Upload className="h-6 w-6 text-[#00c896]" />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {previewUrl ? "Replace image" : "Upload image"}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          JPG, PNG, or WEBP · Max 5 MB
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-[14px] border border-white/[0.1] bg-white/[0.05] p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Top Featured Member
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        This member appears alone at the top of the section.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setFeatured((currentValue: boolean) => !currentValue)
                      }
                      aria-pressed={featured}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                        featured ? "bg-[#00c896]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-200 ${
                          featured ? "left-[22px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-[14px] border border-white/[0.1] bg-white/[0.05] p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Published
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        Turn this off to hide this member from the public page.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPublished((currentValue: boolean) => !currentValue)
                      }
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

                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] py-[13px] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Member…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Member
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