"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  Newspaper,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

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

type AdminNewsArticle = {
  id: string;
  title: string;
  text: string;
  tag: NewsTag;
  date: string;
  picture: string | null;
  published: boolean;
  slug: string;
};

type AdminNewsResponse = {
  articles: AdminNewsArticle[];
};

type SingleNewsResponse = {
  article: AdminNewsArticle;
};

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
  }).format(date);
}

export default function ManageNewsPanel() {
  const [articles, setArticles] = useState<AdminNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingArticle, setEditingArticle] = useState<AdminNewsArticle | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tag, setTag] = useState<NewsTag>("GENERAL");
  const [date, setDate] = useState("");
  const [published, setPublished] = useState(true);
  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  async function fetchArticles() {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/admin/news?published=true", {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as AdminNewsResponse;

      if (!response.ok) {
        throw new Error("Failed to fetch news articles.");
      }

      setArticles(data.articles);
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch news articles."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchArticles();
  }, []);

  function openEditModal(article: AdminNewsArticle) {
    setEditingArticle(article);
    setTitle(article.title);
    setText(article.text);
    setTag(article.tag);
    setDate(formatDateTimeLocal(article.date));
    setPublished(article.published);
    setPicture(null);
    setPreviewUrl(article.picture);
    setStatus("idle");
    setMessage("");
  }

  function closeEditModal() {
    setEditingArticle(null);
    setTitle("");
    setText("");
    setTag("GENERAL");
    setDate("");
    setPublished(true);
    setPicture(null);
    setPreviewUrl(null);
    setSaving(false);
  }

  function handlePictureChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("");
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingArticle) return;

    setSaving(true);
    setStatus("idle");
    setMessage("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    formData.append("tag", tag);
    formData.append("date", date);
    formData.append("published", published ? "true" : "false");

    if (picture) {
      formData.append("picture", picture);
    }

    try {
      const response = await fetch(`/api/admin/news/${editingArticle.id}`, {
        method: "PATCH",
        body: formData,
      });

      const data = (await response.json()) as SingleNewsResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update news article.");
      }

      setArticles((currentArticles: AdminNewsArticle[]) => {
        if (!data.article.published) {
          return currentArticles.filter(
            (article: AdminNewsArticle) => article.id !== data.article.id
          );
        }

        return currentArticles.map((article: AdminNewsArticle) =>
          article.id === data.article.id ? data.article : article
        );
      });

      setStatus("success");
      setMessage("News article updated successfully.");
      closeEditModal();
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to update news article."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(article: AdminNewsArticle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${article.title}"?`
    );

    if (!confirmed) return;

    setDeletingId(article.id);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/news/${article.id}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete news article.");
      }

      setArticles((currentArticles: AdminNewsArticle[]) =>
        currentArticles.filter(
          (currentArticle: AdminNewsArticle) => currentArticle.id !== article.id
        )
      );

      setStatus("success");
      setMessage("News article deleted successfully.");
    } catch (error: unknown) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete news article."
      );
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
  setMounted(true);
}, []);

    useEffect(() => {
      if (!editingArticle) return;

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }, [editingArticle]);

return (
  <>
    <section className="mt-6 w-full rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-9">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
          <Newspaper className="h-6 w-6 text-white" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
            STTF Admin
          </p>
          <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
            Manage News
          </h2>
          <p className="mt-1 text-sm text-white/50">
            View, edit, or delete currently published news articles.
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
            Loading news articles...
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-[22px] border border-white/[0.1] bg-white/[0.04] px-6 py-12 text-center">
          <Newspaper className="mx-auto h-10 w-10 text-white/30" />
          <h3 className="mt-4 text-base font-semibold text-white">
            No published news articles
          </h3>
          <p className="mt-1 text-sm text-white/45">
            Published news articles will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {articles.map((article: AdminNewsArticle) => (
            <article
              key={article.id}
              className="grid gap-4 rounded-[20px] border border-white/[0.1] bg-white/[0.05] p-4 transition hover:border-[#00c896]/35 hover:bg-white/[0.07] md:grid-cols-[160px_1fr_auto]"
            >
              <div className="relative h-36 overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.06] md:h-28">
                {article.picture ? (
                  <Image
                    src={article.picture}
                    alt={article.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Newspaper className="h-8 w-8 text-white/25" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#00c896]/25 bg-[#00c896]/10 px-2.5 py-1 text-[11px] font-semibold text-[#00e0aa]">
                    {article.tag}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDisplayDate(article.date)}
                  </span>
                </div>

                <h3 className="line-clamp-2 text-base font-bold text-white">
                  {article.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">
                  {article.text}
                </p>
              </div>

              <div className="flex items-center gap-2 md:flex-col md:items-stretch md:justify-center">
                <a
                  href={`/news/${article.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-[#00c896]/40 hover:text-[#00e0aa]"
                >
                  <Eye className="h-4 w-4" />
                  View
                </a>

                <button
                  type="button"
                  onClick={() => openEditModal(article)}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#00c896]/25 bg-[#00c896]/10 px-4 py-2 text-xs font-semibold text-[#00e0aa] transition hover:bg-[#00c896]/15"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  disabled={deletingId === article.id}
                  onClick={() => handleDelete(article)}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === article.id ? (
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

    {mounted && editingArticle
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
                    Edit News
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-white">
                    Update Article
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

              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className={labelClass}>
                    News Title <span className="text-[#00c896]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>News Tag</label>
                    <select
                      value={tag}
                      onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                        setTag(event.target.value as NewsTag)
                      }
                      className={selectClass}
                    >
                      {NEWS_TAGS.map(
                        (item: { label: string; value: NewsTag }) => (
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
                    <label className={labelClass}>News Date</label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <input
                        type="datetime-local"
                        value={date}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => setDate(event.target.value)}
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    News Text <span className="text-[#00c896]">*</span>
                  </label>
                  <textarea
                    required
                    value={text}
                    onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setText(event.target.value)
                    }
                    rows={7}
                    className="w-full resize-none rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15"
                  />
                </div>

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

                <div className="flex items-center justify-between gap-4 rounded-[14px] border border-white/[0.1] bg-white/[0.05] p-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Published
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      Turning this off removes it from the public news list.
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