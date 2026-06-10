"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  Save,
  Shield,
  Trophy,
  X,
} from "lucide-react";

type LeagueStanding = {
  id: string;
  clubId: string;
  clubName: string;
  clubLogo: string | null;
  clubLocation: string | null;
  matchesPlayed: number;
  won: number;
  lost: number;
  score: string;
  scoreDifference: number;
  points: number;
  form: string[];
  position: number;
};

type EditableStanding = {
  matchesPlayed: string;
  won: string;
  lost: string;
  score: string;
  points: string;
  form: string[];
};

export default function AdminLeagueTable() {
  const [standings, setStandings] = useState<LeagueStanding[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditableStanding | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStandings();
  }, []);

  // Close modal on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (saving) return;
        cancelEdit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving]);

  async function fetchStandings() {
    try {
      setLoading(true);
      setStatus("idle");
      setMessage("");

      const res = await fetch("/api/league", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch league standings");
      }

      setStandings(data.standings || []);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to fetch league standings"
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(standing: LeagueStanding) {
    setEditingId(standing.id);
    setDraft({
      matchesPlayed: String(standing.matchesPlayed),
      won: String(standing.won),
      lost: String(standing.lost),
      score: standing.score,
      points: String(standing.points),
      form: normalizeForm(standing.form),
    });
    setStatus("idle");
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
  }

  function updateDraftField(
    field: keyof Omit<EditableStanding, "form">,
    value: string
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function updateForm(index: number, value: "W" | "L" | "") {
    setDraft((current) => {
      if (!current) return current;

      const nextForm = [...current.form];
      nextForm[index] = value;

      return {
        ...current,
        form: nextForm,
      };
    });
  }

  async function saveStanding(id: string) {
    if (!draft) return;

    try {
      setSaving(true);
      setStatus("idle");
      setMessage("");

      const cleanForm = draft.form.filter((item) => item === "W" || item === "L");

      const res = await fetch(`/api/admin/league/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchesPlayed: Number(draft.matchesPlayed),
          won: Number(draft.won),
          lost: Number(draft.lost),
          score: draft.score,
          points: Number(draft.points),
          form: cleanForm,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update standing");
      }

      setStatus("success");
      setMessage("League standing updated successfully.");

      setEditingId(null);
      setDraft(null);

      await fetchStandings();
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Failed to update standing"
      );
    } finally {
      setSaving(false);
    }
  }

  const totals = useMemo(() => {
    return {
      clubs: standings.length,
      matches: standings.reduce((sum, item) => sum + item.matchesPlayed, 0),
      points: standings.reduce((sum, item) => sum + item.points, 0),
    };
  }, [standings]);

  const editingStanding = useMemo(() => {
    if (!editingId) return null;
    return standings.find((s) => s.id === editingId) || null;
  }, [editingId, standings]);

  return (
    <>
      <section className="w-full rounded-[28px] border border-white/[0.12] bg-white/[0.07] p-6 text-white shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl md:p-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
              STTF Admin
            </p>

            <h1 className="mt-2 text-2xl font-black md:text-4xl">جدول الترتيب</h1>

            <p className="mt-3 text-sm leading-7 text-white/50">
              عرض وتعديل بيانات جدول الدوري لكل نادي بشكل منفصل.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="الأندية" value={totals.clubs} />
            <MiniStat label="المباريات" value={totals.matches} />
            <MiniStat label="النقاط" value={totals.points} />
          </div>
        </div>

        {status !== "idle" ? (
          <div
            className={`mb-6 flex items-center gap-3 rounded-[14px] border px-4 py-3 text-sm font-medium ${
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
        ) : null}

        <div className="overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.05]">
          <div className="border-b border-white/[0.08] px-6 py-7 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#00e0aa]">
              الدوري
            </p>
            <h2 className="mt-1.5 text-xl font-black text-white">جدول الترتيب</h2>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                <Loader2 className="h-5 w-5 animate-spin text-[#00c896]" />
                جاري تحميل جدول الترتيب...
              </div>
            </div>
          ) : null}

          {!loading && standings.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#00c896]/20 bg-[#00c896]/10 text-[#00c896]">
                <Trophy className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black text-white">لا يوجد ترتيب حالياً</h3>

              <p className="mt-2 text-sm text-white/45">
                سيتم إنشاء بيانات الجدول عند إضافة مباريات منتهية.
              </p>
            </div>
          ) : null}

          {!loading && standings.length > 0 ? (
            <>
              <DesktopTable standings={standings} onStartEdit={startEdit} />
              <MobileCards standings={standings} onStartEdit={startEdit} />
            </>
          ) : null}
        </div>
      </section>

      {/* ── Edit Modal ── */}
      {editingId && draft && editingStanding ? (
        <EditStandingModal
          standing={editingStanding}
          draft={draft}
          saving={saving}
          onClose={cancelEdit}
          onSave={() => saveStanding(editingStanding.id)}
          onUpdateDraftField={updateDraftField}
          onUpdateForm={updateForm}
        />
      ) : null}
    </>
  );
}

function DesktopTable({
  standings,
  onStartEdit,
}: {
  standings: LeagueStanding[];
  onStartEdit: (standing: LeagueStanding) => void;
}) {
  return (
    <div className="hidden p-5 lg:block">
      <div className="grid grid-cols-[70px_1.8fr_repeat(5,1fr)_1.5fr_120px] items-center rounded-[14px] bg-[#00c896]/10 px-5 py-4 text-xs font-black text-[#00e0aa]">
        <div>#</div>
        <div>النادي</div>
        <div className="text-center">لعب</div>
        <div className="text-center">فوز</div>
        <div className="text-center">خسارة</div>
        <div className="text-center">+/-</div>
        <div className="text-center">النقاط</div>
        <div className="text-center">الشكل</div>
        <div className="text-center">تعديل</div>
      </div>

      <div className="mt-3 space-y-2">
        {standings.map((standing) => (
          <div
            key={standing.id}
            className="grid grid-cols-[70px_1.8fr_repeat(5,1fr)_1.5fr_120px] items-center rounded-[14px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm transition hover:border-white/15"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00c896] font-black text-[#003d34] shadow-[0_0_12px_rgba(0,200,150,0.25)]">
              {standing.position}
            </div>

            <ClubCell standing={standing} />

            <TableValue value={standing.matchesPlayed} />
            <TableValue value={standing.won} green />
            <TableValue value={standing.lost} red />
            <TableValue value={standing.score} muted />
            <TableValue value={standing.points} green />

            <div className="flex items-center justify-center">
              <FormDots form={standing.form} />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onStartEdit(standing)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#00c896]/30 hover:bg-[#00c896]/10 hover:text-white"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileCards({
  standings,
  onStartEdit,
}: {
  standings: LeagueStanding[];
  onStartEdit: (standing: LeagueStanding) => void;
}) {
  return (
    <div className="space-y-4 p-4 lg:hidden">
      {standings.map((standing) => (
        <div key={standing.id} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-5 flex items-center justify-between gap-4">
            <ClubCell standing={standing} />

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00c896] font-black text-[#003d34] shadow-[0_0_12px_rgba(0,200,150,0.25)]">
                {standing.position}
              </div>

              <button
                type="button"
                onClick={() => onStartEdit(standing)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-[#00c896]/30 hover:bg-[#00c896]/10 hover:text-white"
                aria-label="Edit standing"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            <MobileValue label="لعب" value={standing.matchesPlayed} />
            <MobileValue label="فوز" value={standing.won} green />
            <MobileValue label="خسارة" value={standing.lost} red />
            <MobileValue label="+/-" value={standing.score} muted />
            <MobileValue label="النقاط" value={standing.points} green />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <FormDots form={standing.form} />

            <span className="text-xs font-black text-white/30">الشكل</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function EditStandingModal({
  standing,
  draft,
  saving,
  onClose,
  onSave,
  onUpdateDraftField,
  onUpdateForm,
}: {
  standing: LeagueStanding;
  draft: EditableStanding;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onUpdateDraftField: (
    field: keyof Omit<EditableStanding, "form">,
    value: string
  ) => void;
  onUpdateForm: (index: number, value: "W" | "L" | "") => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (saving) return;
        onClose();
      }}
    >
      <article
        className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1a10] text-white shadow-[0_32px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/8 px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
              {standing.clubLogo ? (
                <Image
                  src={standing.clubLogo}
                  alt={standing.clubName}
                  width={38}
                  height={38}
                  className="h-full w-full object-contain"
                />
              ) : (
                <Shield className="h-5 w-5 text-[#00c896]" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{standing.clubName}</p>
              <p className="mt-0.5 truncate text-xs font-bold text-white/35">
                {standing.clubLocation || "غير محدد"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (saving) return;
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ModalField
              label="لعب"
              value={draft.matchesPlayed}
              onChange={(v) => onUpdateDraftField("matchesPlayed", v)}
            />
            <ModalField
              label="فوز"
              value={draft.won}
              onChange={(v) => onUpdateDraftField("won", v)}
            />
            <ModalField
              label="خسارة"
              value={draft.lost}
              onChange={(v) => onUpdateDraftField("lost", v)}
            />
            <ModalField
              label="+/-"
              value={draft.score}
              type="text"
              onChange={(v) => onUpdateDraftField("score", v)}
            />
            <ModalField
              label="النقاط"
              value={draft.points}
              onChange={(v) => onUpdateDraftField("points", v)}
            />
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-black text-white/45">الشكل</p>
            <FormEditor form={draft.form} onChange={onUpdateForm} />
            <p className="mt-2 text-[11px] text-white/25">
              سيتم حفظ النتائج فقط كـ W أو L.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-white/8 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-bold text-white/30">
            المركز الحالي: <span className="text-white/60">{standing.position}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[14px] bg-[#00c896] px-5 py-3 text-sm font-black text-[#003d34] transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التعديل
            </button>

            <button
              type="button"
              onClick={() => {
                if (saving) return;
                onClose();
              }}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-black text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              إلغاء
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  type = "number",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-xs font-black text-white/40">
        {label}
      </span>
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-black text-white outline-none transition focus:border-[#00c896]/40 focus:ring-2 focus:ring-[#00c896]/15"
      />
    </label>
  );
}

function ClubCell({ standing }: { standing: LeagueStanding }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1.5">
        {standing.clubLogo ? (
          <Image
            src={standing.clubLogo}
            alt={standing.clubName}
            width={38}
            height={38}
            className="h-full w-full object-contain"
          />
        ) : (
          <Shield className="h-5 w-5 text-[#00c896]" />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate font-black text-white">{standing.clubName}</p>
        <p className="mt-1 truncate text-xs font-bold text-white/35">
          {standing.clubLocation || "غير محدد"}
        </p>
      </div>
    </div>
  );
}

function TableValue({
  value,
  green,
  red,
  muted,
}: {
  value: number | string;
  green?: boolean;
  red?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`text-center font-black ${
        green
          ? "text-[#00e0aa]"
          : red
            ? "text-red-400"
            : muted
              ? "text-white/60"
              : "text-white"
      }`}
    >
      {value}
    </div>
  );
}

function FormEditor({
  form,
  onChange,
}: {
  form: string[];
  onChange: (index: number, value: "W" | "L" | "") => void;
}) {
  const safeForm = normalizeForm(form);

  return (
    <div className="flex items-center justify-center gap-2">
      {safeForm.map((item, index) => (
        <select
          key={index}
          value={item}
          onChange={(event) =>
            onChange(index, event.target.value as "W" | "L" | "")
          }
          className={`h-9 w-12 rounded-full border border-white/10 text-center text-xs font-black outline-none transition focus:border-[#00c896]/40 focus:ring-2 focus:ring-[#00c896]/10 ${
            item === "W"
              ? "bg-[#00c896] text-[#003d34]"
              : item === "L"
                ? "bg-red-500 text-white"
                : "bg-white/5 text-white/70"
          }`}
        >
          <option value="">-</option>
          <option value="W">W</option>
          <option value="L">L</option>
        </select>
      ))}
    </div>
  );
}

function FormDots({ form }: { form: string[] }) {
  const safeForm = normalizeForm(form);
  const padded = Array.from({ length: 5 }, (_, i) => safeForm[i] ?? "");

  if (padded.every((x) => !x)) {
    return <span className="text-xs font-bold text-white/30">—</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {padded.map((item, index) => {
        const isWin = item === "W";
        const isLoss = item === "L";
        return (
          <span
            key={`${item}-${index}`}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
              isWin
                ? "bg-[#00c896]/20 text-[#00e0aa] ring-1 ring-[#00c896]/35"
                : isLoss
                  ? "bg-red-500/20 text-red-300 ring-1 ring-red-500/30"
                  : "bg-white/5 text-white/10 ring-1 ring-white/10"
            }`}
          >
            {isWin ? "W" : isLoss ? "L" : ""}
          </span>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-center">
      <p className="text-xl font-black text-[#00e0aa]">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/40">{label}</p>
    </div>
  );
}

function MobileValue({
  label,
  value,
  green,
  red,
  muted,
}: {
  label: string;
  value: number | string;
  green?: boolean;
  red?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-lg font-black ${
          green
            ? "text-[#00e0aa]"
            : red
              ? "text-red-400"
              : muted
                ? "text-white/60"
                : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-bold text-white/35">{label}</p>
    </div>
  );
}

function normalizeForm(form: string[]) {
  const safe = [...form].slice(0, 5);

  while (safe.length < 5) {
    safe.push("");
  }

  return safe;
}
