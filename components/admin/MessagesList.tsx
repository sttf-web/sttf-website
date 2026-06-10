"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  AlertCircle,
  Mail,
  MailOpen,
  Search,
  Inbox,
  X,
} from "lucide-react";

type Message = {
  id: string;
  name: string;
  title: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

const inputClass =
  "w-full rounded-[14px] border border-white/[0.14] bg-white/[0.08] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-[#00c896]/50 focus:ring-2 focus:ring-[#00c896]/15";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function MessagesList() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/admin/messages", { method: "GET", cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
        setMessages(data.messages || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelectedMessage(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filteredMessages = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return messages;
    return messages.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.title.toLowerCase().includes(query) ||
      item.message.toLowerCase().includes(query)
    );
  }, [messages, search]);

  /* ── Loading ── */
  if (loading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-9 text-white backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <Loader2 className="h-5 w-5 animate-spin text-[#00c896]" />
          Loading messages…
        </div>
      </section>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <section className="rounded-[28px] border border-red-500/20 bg-white/[0.07] p-9 text-white backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3 rounded-[14px] border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="w-full mt-6 rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-9 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">

        {/* ── Header ── */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00c896] to-[#008f6a] shadow-[0_8px_24px_rgba(0,200,150,0.35)]">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                STTF Admin
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
                Messages
              </h2>
              <p className="mt-1 text-sm text-white/50">
                View all contact messages sent from the website.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-[12px] border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/50">
            {messages.length} total
          </div>
        </div>

        {/* Divider */}
        <div className="mb-6 h-px bg-white/[0.08]" />

        {/* ── Search ── */}
        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, title, or message…"
            className={`${inputClass} pl-11`}
          />
        </div>

        {/* ── Empty state ── */}
        {filteredMessages.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-white/[0.1] bg-white/[0.03] p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10">
              <Inbox className="h-6 w-6 text-[#00c896]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">No messages found</h3>
              <p className="mt-1 text-sm text-white/40">
                {search ? "Try changing your search query." : "No contact messages have been sent yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedMessage(item)}
                className="w-full rounded-[18px] border border-white/[0.08] bg-white/[0.04] p-4 text-left transition hover:border-[#00c896]/30 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {item.isRead ? (
                        <MailOpen className="h-3.5 w-3.5 shrink-0 text-white/30" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 shrink-0 text-[#00c896]" />
                      )}
                      <h3 className="truncate text-sm font-semibold text-white">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 truncate text-sm text-white/60">{item.name}</p>
                    <p className="mt-0.5 truncate text-xs text-white/35">{item.email}</p>
                  </div>

                  {!item.isRead && (
                    <span className="shrink-0 rounded-full bg-[#00c896] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#003d34]">
                      New
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
                  {item.message}
                </p>
                <p className="mt-2 text-[11px] text-white/25">
                  {formatDate(item.createdAt)}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Modal ── */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-white/[0.12] bg-[#003d34] p-8 text-white shadow-[0_32px_64px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedMessage(null)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.07] text-white/50 transition hover:bg-white/[0.12] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal header */}
            <div className="mb-6 border-b border-white/[0.08] pb-5 pr-10">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
                  Message Details
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    selectedMessage.isRead
                      ? "border border-white/10 bg-white/[0.07] text-white/40"
                      : "bg-[#00c896] text-[#003d34]"
                  }`}
                >
                  {selectedMessage.isRead ? "Read" : "Unread"}
                </span>
              </div>
              <h3 className="mt-2 text-xl font-bold leading-snug text-white">
                {selectedMessage.title}
              </h3>
            </div>

            {/* Meta grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.05] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Name
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {selectedMessage.name}
                </p>
              </div>

              <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.05] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Email
                </p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="mt-2 block break-all text-sm font-semibold text-[#00e0aa] hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>

              <div className="rounded-[14px] border border-white/[0.08] bg-white/[0.05] p-4 md:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                  Sent At
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {formatDate(selectedMessage.createdAt)}
                </p>
              </div>
            </div>

            {/* Message body */}
            <div className="mt-4 rounded-[14px] border border-white/[0.08] bg-white/[0.05] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Message
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/80">
                {selectedMessage.message}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.title}`}
                className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-r from-[#00c896] to-[#008f6a] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(0,200,150,0.35)] transition hover:shadow-[0_12px_32px_rgba(0,200,150,0.45)]"
              >
                <Mail className="h-4 w-4" />
                Reply by Email
              </a>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-[14px] border border-white/[0.12] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.1] hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
