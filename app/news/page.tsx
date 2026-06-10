"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Loader2,
  Newspaper,
  Search,
  Tag,
  X,
} from "lucide-react";

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

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  text: string;
  picture: string | null;
  date: string;
  tag: NewsTag;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const TAG_LABELS: Record<NewsTag, string> = {
  GENERAL: "عام",
  PARTNERSHIPS: "شراكات",
  TRAINING: "تدريب",
  TECH: "تقنية",
  EVENT: "فعالية",
  FEDERATION: "الاتحاد",
  TOURNAMENT: "بطولة",
  LEAGUE: "دوري",
  CLUB: "نادي",
  PLAYER: "لاعب",
  MEDIA: "إعلام",
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<NewsTag | "ALL">("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/news", {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch news");
        }

        setNews(data.news || []);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch news");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  useEffect(() => {
    if (!selectedNews) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedNews]);

  const availableTags = useMemo(() => {
    const tags = new Set<NewsTag>();

    news.forEach((item) => {
      tags.add(item.tag);
    });

    return Array.from(tags);
  }, [news]);

  const filteredNews = useMemo(() => {
    const query = search.trim().toLowerCase();

    return news.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.text.toLowerCase().includes(query);

      const matchesTag = activeTag === "ALL" || item.tag === activeTag;

      return matchesSearch && matchesTag;
    });
  }, [news, search, activeTag]);

  return (
    <main dir="rtl" className="min-h-screen bg-[#060d09] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#04361f] px-5 pb-14 pt-32 text-center">
        <BackgroundEffects />

        <div className="relative mx-auto max-w-5xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#1fd47a]/30 bg-[#1fd47a]/10 text-white shadow-[0_0_32px_rgba(31,212,122,0.18)]">
            <Newspaper className="h-9 w-9 text-[#1fd47a]" />
          </div>

          <h1 className="text-4xl font-black tracking-tight md:text-6xl">الأخبار</h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/50 md:text-lg">
            آخر أخبار وفعاليات الاتحاد السعودي لكرة الطاولة
          </p>

          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-[#1fd47a]/60 to-transparent" />
        </div>
      </section>

      {/* Controls + Grid */}
      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-10">
        <div className="mb-8 rounded-[24px] border border-white/8 bg-[#0b1a10] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث في الأخبار..."
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 pr-11 text-sm font-semibold text-white outline-none transition placeholder:text-white/25 focus:border-[#1fd47a]/40 focus:ring-4 focus:ring-[#1fd47a]/10"
              />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <TagChip active={activeTag === "ALL"} onClick={() => setActiveTag("ALL")}>
                الكل
              </TagChip>

              {availableTags.map((tag) => (
                <TagChip key={tag} active={activeTag === tag} onClick={() => setActiveTag(tag)}>
                  {TAG_LABELS[tag]}
                </TagChip>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center rounded-[24px] border border-white/8 bg-[#0b1a10]">
            <div className="flex items-center gap-3 text-sm font-medium text-white/40">
              <Loader2 className="h-5 w-5 animate-spin text-[#1fd47a]" />
              جاري تحميل الأخبار…
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filteredNews.length === 0 && (
          <div className="flex min-h-[340px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/3 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/30">
              <Newspaper className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-2xl font-black">لا توجد أخبار حالياً</h2>

            <p className="mt-2 text-sm font-medium text-white/40">
              سيتم عرض الأخبار هنا بعد إضافتها من لوحة التحكم.
            </p>
          </div>
        )}

        {!loading && !error && filteredNews.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredNews.map((item, index) => (
              <NewsCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => setSelectedNews(item)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedNews ? (
        <NewsModal item={selectedNews} onClose={() => setSelectedNews(null)} />
      ) : null}
    </main>
  );
}

function TagChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-black transition ${
        active
          ? "bg-[#1fd47a] text-[#060d09] shadow-[0_0_14px_rgba(31,212,122,0.35)]"
          : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function NewsCard({
  item,
  index,
  onClick,
}: {
  item: NewsItem;
  index: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-full w-full flex-col overflow-hidden bg-[#0d1f18] text-right text-white outline-none transition focus-visible:ring-4 focus-visible:ring-[#1fd47a]/20"
      style={{
        opacity: 1,
        transform: "translateY(0)",
        transition: `transform 0.6s ease ${index * 0.08}s, box-shadow 0.25s ease`,
      }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-[#0a1a14] aspect-[4/3]">
        {item.picture ? (
          <Image
            src={item.picture}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/30">
            <Newspaper className="h-16 w-16" />
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"
        />
      </div>

      {/* Body */}
      <div className="border-t-2 border-[#005043] bg-[#0d1f18] px-5 pb-5 pt-4">
        <span className="inline-block text-[11px] font-black tracking-[0.18em] text-[#1fd47a]">
          {TAG_LABELS[item.tag]}
        </span>

        {/* Divider dot row */}
        <div className="mt-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1fd47a]" />
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <p className="mt-3 line-clamp-4 text-sm font-medium leading-7 text-white/80">
          {item.title}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-white/40">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(item.date)}
          </span>

          <span className="inline-flex items-center gap-2 text-sm font-black text-[#1fd47a]">
            اقرأ
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
          </span>
        </div>
      </div>

      {/* Hover outline */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 transition group-hover:ring-[#1fd47a]/25" />

      {/* Lift + shadow */}
      <div className="pointer-events-none absolute inset-0 transition-transform duration-300 group-hover:-translate-y-1" />
    </button>
  );
}

function NewsModal({
  item,
  onClose,
}: {
  item: NewsItem;
  onClose: () => void;
}) {
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <article
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#0b1a10] text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black"
          aria-label="Close news modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-72 w-full overflow-hidden bg-[#0a1a14] md:h-[420px]">
          {item.picture ? (
            <Image src={item.picture} alt={item.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/30">
              <Newspaper className="h-20 w-20" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute bottom-6 right-6 left-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#1fd47a] px-4 py-2 text-xs font-black text-[#060d09]">
                <Tag className="h-4 w-4" />
                {TAG_LABELS[item.tag]}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur-md">
                <CalendarDays className="h-4 w-4" />
                {formatDate(item.date)}
              </span>
            </div>

            <h2 className="max-w-3xl text-3xl font-black leading-[1.4] text-white md:text-5xl">
              {item.title}
            </h2>
          </div>
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <InfoPill label="التصنيف" value={TAG_LABELS[item.tag]} />
            <InfoPill label="تاريخ النشر" value={formatDate(item.date)} />
            <InfoPill label="الحالة" value={item.published ? "منشور" : "غير منشور"} />
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 md:p-7">
            <p className="whitespace-pre-wrap text-base leading-9 text-white/80">
              {item.text}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-black text-white/35">{label}</p>
      <p className="mt-2 text-sm font-black text-[#1fd47a]">{value}</p>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function BackgroundEffects() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#1fd47a]/8 blur-[100px]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#0a5c35]/50 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#060d09] to-transparent" />
    </>
  );
}
