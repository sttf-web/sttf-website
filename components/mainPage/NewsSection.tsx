"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface NewsArticle {
  id: string;
  tag: string;
  title: string;
  image: string;
  date: string;
  href: string;
}

interface LatestNewsResponse {
  articles: NewsArticle[];
}

interface NewsSectionProps {
  lang?: Lang;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_LABEL = { ar: "الأخبار", en: "News" };
const VIEW_ALL_LABEL = { ar: "عرض الكل", en: "View All" };

const TAG_LABELS: Record<string, { ar: string; en: string }> = {
  GENERAL: { ar: "أخبار", en: "News" },
  PARTNERSHIPS: { ar: "شراكات", en: "Partnerships" },
  TRAINING: { ar: "تدريب", en: "Training" },
  TECH: { ar: "تقنية", en: "Tech" },
  EVENT: { ar: "فعالية", en: "Event" },
  FEDERATION: { ar: "الاتحاد", en: "Federation" },
  TOURNAMENT: { ar: "بطولة", en: "Tournament" },
  LEAGUE: { ar: "الدوري", en: "League" },
  CLUB: { ar: "نادي", en: "Club" },
  PLAYER: { ar: "لاعب", en: "Player" },
  MEDIA: { ar: "إعلام", en: "Media" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NewsCardProps {
  article: NewsArticle;
  lang: Lang;
  index: number;
  isVisible: boolean;
}

function NewsCard({ article, lang, index, isVisible }: NewsCardProps) {
  const [hovered, setHovered] = useState(false);
  const isAr = lang === "ar";
  const tagLabel = TAG_LABELS[article.tag]?.[lang] ?? article.tag;

  return (
    <Link
      href={article.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        borderRadius: 0,
        overflow: "hidden",
        background: "#0d1f18",
        textDecoration: "none",
        color: "inherit",
        flex: "1 1 0",
        minWidth: 0,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${
          index * 0.15
        }s`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          background: "#0a1a14",
        }}
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(0,15,10,0.75) 100%)",
            zIndex: 1,
          }}
        />
      </div>

      <div
        style={{
          padding: "16px 20px 20px",
          background: "#0d1f18",
          borderTop: "2px solid #005043",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#00c896",
            marginBottom: 10,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {tagLabel}
        </span>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00c896",
              flexShrink: 0,
            }}
          />

          <div
            style={{
              height: 1,
              flex: 1,
              background: "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.82)",
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textAlign: isAr ? "right" : "left",
          }}
        >
          {article.title}
        </p>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: isAr ? "flex-start" : "flex-end",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "#00c896",
              transition: "transform 0.3s ease",
              display: "inline-block",
              transform: hovered
                ? isAr
                  ? "translateX(-4px)"
                  : "translateX(4px)"
                : "translateX(0)",
            }}
          >
            {isAr ? "←" : "→"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ lang }: { lang: Lang }) {
  const isAr = lang === "ar";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32,
        flexDirection: isAr ? "row" : "row-reverse",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <div
            style={{
              position: "absolute",
              right: isAr ? 0 : "auto",
              left: isAr ? "auto" : 0,
              bottom: 6,
              zIndex: 0,
              width: "45%",
              height: 12,
              borderRadius: 2,
              background: "linear-gradient(90deg, #00c896, #005043)",
            }}
          />

          <span
            style={{
              position: "relative",
              zIndex: 1,
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: isAr ? 0 : -1,
              lineHeight: 1.1,
            }}
          >
            {SECTION_LABEL[lang]}
          </span>
        </div>

        <span
          style={{
            fontSize: 26,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 2,
          }}
        >
          →
        </span>
      </div>

      <Link
        href="/news"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#00c896",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          opacity: 0.85,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = "0.85";
        }}
      >
        {VIEW_ALL_LABEL[lang]}
        <span style={{ fontSize: 16 }}>{isAr ? "←" : "→"}</span>
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsSection({ lang = "ar" }: NewsSectionProps) {
  const isAr = lang === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    let shouldIgnore = false;

    async function fetchLatestNews() {
      try {
        const response = await fetch("/api/news/latest", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch latest news.");
        }

        const data: LatestNewsResponse = await response.json();

        if (!shouldIgnore) {
          setArticles(data.articles);
          setStatus("success");
        }
      } catch (error: unknown) {
        console.error("Failed to fetch latest news:", error);

        if (!shouldIgnore) {
          setStatus("error");
        }
      }
    }

    fetchLatestNews();

    return () => {
      shouldIgnore = true;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#050f0a",
        padding: "64px 0 80px",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        color: "#ffffff",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          width: "100%",
          height: 170,
          zIndex: 0,
          opacity: 0.95,
          pointerEvents: "none",
        }}
      >
        <path
          d="M0,160 C760,240 1100,220 1440,150 V240 H0 Z"
          fill="#005043"
        />
      </svg>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
        }}
      >
        <SectionHeader lang={lang} />

        {status === "loading" && (
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              textAlign: isAr ? "right" : "left",
            }}
          >
            {isAr ? "جاري تحميل الأخبار..." : "Loading latest news..."}
          </p>
        )}

        {status === "error" && (
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              textAlign: isAr ? "right" : "left",
            }}
          >
            {isAr
              ? "تعذر تحميل الأخبار في الوقت الحالي."
              : "Could not load latest news right now."}
          </p>
        )}

        {status === "success" && articles.length > 0 && (
          <div
            className="news-cards-row"
            style={{
              display: "flex",
              gap: 0,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {articles.map((article: NewsArticle, index: number) => (
              <NewsCard
                key={article.id}
                article={article}
                lang={lang}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>
        )}

        {status === "success" && articles.length === 0 && (
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              textAlign: isAr ? "right" : "left",
            }}
          >
            {isAr ? "لا توجد أخبار منشورة حالياً." : "No published news yet."}
          </p>
        )}
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .news-cards-row {
            flex-direction: column !important;
          }

          .news-cards-row > a {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}