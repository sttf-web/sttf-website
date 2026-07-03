"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  Handshake,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type AdminPartner = {
  id: string;
  name: string;
  image: string;
  published: boolean;
  order: number;
};

type AdminPartnersResponse = {
  success: boolean;
  partners: AdminPartner[];
  error?: string;
};

type SinglePartnerResponse = {
  success: boolean;
  partner: AdminPartner;
  error?: string;
};

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

const labelClass = "mb-2 block text-sm font-medium text-white/75";

function sortPartners(partners: AdminPartner[]) {
  return [...partners].sort(
    (partnerA: AdminPartner, partnerB: AdminPartner) =>
      partnerA.order - partnerB.order
  );
}

export default function ManagePartnersPanel() {
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingPartner, setEditingPartner] = useState<AdminPartner | null>(
    null
  );

  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function fetchPartners() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/partners", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminPartnersResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch partners.");
      }

      setPartners(data.partners);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to fetch partners."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchPartners();
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
    setOrder("0");
    setPublished(true);
    setImage(null);
    setPreviewUrl(null);
    setSaving(false);
    setModalError("");
  }

  function openCreateModal() {
    resetForm();
    setEditingPartner(null);
    setModalMode("create");
    setStatus("idle");
    setMessage("");
  }

  function openEditModal(partner: AdminPartner) {
    setEditingPartner(partner);
    setName(partner.name);
    setOrder(String(partner.order));
    setPublished(partner.published);
    setImage(null);
    setPreviewUrl(partner.image);
    setModalError("");
    setModalMode("edit");
    setStatus("idle");
    setMessage("");
  }

  function closeModal() {
    setModalMode(null);
    setEditingPartner(null);
    resetForm();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setModalError("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (name.trim().length === 0) {
      setModalError("Partner name is required.");
      return;
    }

    if (modalMode === "create" && !image) {
      setModalError("Partner image is required.");
      return;
    }

    setSaving(true);
    setModalError("");
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("order", order);
    formData.append("published", published ? "true" : "false");

    if (image) {
      formData.append("image", image);
    }

    try {
      const isEdit = modalMode === "edit" && editingPartner !== null;

      const response = await fetch(
        isEdit
          ? `/api/admin/partners/${editingPartner.id}`
          : "/api/admin/partners",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        }
      );

      const data = (await response.json()) as SinglePartnerResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to save partner.");
      }

      if (isEdit) {
        setPartners((currentPartners: AdminPartner[]) =>
          sortPartners(
            currentPartners.map((partner: AdminPartner) =>
              partner.id === data.partner.id ? data.partner : partner
            )
          )
        );

        setMessage("Partner updated successfully.");
      } else {
        setPartners((currentPartners: AdminPartner[]) =>
          sortPartners([...currentPartners, data.partner])
        );

        setMessage("Partner created successfully.");
      }

      setStatus("success");
      closeModal();
    } catch (error: unknown) {
      setModalError(
        error instanceof Error ? error.message : "Failed to save partner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(partner: AdminPartner) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${partner.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(partner.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete partner.");
      }

      setPartners((currentPartners: AdminPartner[]) =>
        currentPartners.filter(
          (currentPartner: AdminPartner) => currentPartner.id !== partner.id
        )
      );

      setStatus("success");
      setMessage("Partner deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to delete partner."
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
              <Handshake className="h-6 w-6 text-white" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                STTF Admin
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
                Manage Partners
              </h2>
              <p className="mt-1 text-sm text-white/50">
                Add, edit, publish, or delete partner logos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)]"
          >
            <Plus className="h-4 w-4" />
            Add Partner
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
              Loading partners...
            </div>
          </div>
        ) : partners.length === 0 ? (
          <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
            <Handshake className="mx-auto h-10 w-10 text-white/30" />
            <h3 className="mt-4 text-base font-semibold text-white">
              No partners found
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Partner logos will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {partners.map((partner: AdminPartner) => (
              <article
                key={partner.id}
                className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] md:grid-cols-[100px_1fr_auto]"
              >
                <div className="flex h-20 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.06]">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="h-full w-full object-contain p-3 brightness-0 invert"
                  />
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        partner.published
                          ? "border-[#00c896]/25 bg-[#00c896]/10 text-[#00e0aa]"
                          : "border-white/15 bg-white/10 text-white/45"
                      }`}
                    >
                      {partner.published ? "Published" : "Draft"}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold text-white/50">
                      Order {partner.order}
                    </span>
                  </div>

                  <h3 className="truncate text-base font-bold text-white">
                    {partner.name}
                  </h3>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {partner.image}
                  </p>
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
                    onClick={() => openEditModal(partner)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === partner.id}
                    onClick={() => handleDelete(partner)}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === partner.id ? (
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
                      {modalMode === "create"
                        ? "Add Partner"
                        : "Edit Partner"}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white">
                      {modalMode === "create"
                        ? "Create Partner Logo"
                        : "Update Partner Logo"}
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
                      Partner Name <span className="text-[#00c896]">*</span>
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
                      Partner Logo{" "}
                      {modalMode === "create" && (
                        <span className="text-[#00c896]">*</span>
                      )}
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.18] bg-white/[0.04] px-6 py-8 text-center transition hover:border-[#00c896]/55 hover:bg-[#00c896]/[0.06]">
                      {previewUrl ? (
                        <div className="flex h-32 w-48 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.08]">
                          <img
                            src={previewUrl}
                            alt="Partner preview"
                            className="h-full w-full object-contain p-4 brightness-0 invert"
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10">
                          <Upload className="h-6 w-6 text-[#00c896]" />
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {previewUrl ? "Replace logo" : "Upload logo"}
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
                        Published
                      </p>
                      <p className="mt-0.5 text-xs text-white/40">
                        Turn this off to hide the logo from the public section.
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
                        Saving Partner…
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Partner
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