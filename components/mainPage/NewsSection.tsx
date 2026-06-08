"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsArticle {
  id: number;
  tag: string;
  title: {
    ar: string;
    en: string;
  };
  image: string;
  date: string;
  href: string;
}

interface NewsSectionProps {
  lang?: "ar" | "en";
}

// ─── Constants ────────────────────────────────────────────────────────────────

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 1,
    tag: "NEWS",
    title: {
      ar: "المملكة تستضيف تصفيات غرب آسيا للشباب والشابات والرجال والسيدات لكرة الطاولة — تستعد مدينة \"الدمام\" شرق المملكة العربية السعودية لاستضافة تصفيات غرب آسيا للشباب والشابات المؤهلة للبطولة الآسيوية للشباب والشابات في أوزبكستان 2025.",
      en: "Saudi Arabia hosts West Asia Youth and Men's & Women's Table Tennis Qualifiers — Dammam prepares to host the West Asia Youth Qualifiers for the Asian Championships in Uzbekistan 2025.",
    },
    image: "/homePage/news-1.png",
    date: "2025-05-20",
    href: "#",
  },
  {
    id: 2,
    tag: "NEWS",
    title: {
      ar: "المملكة تستضيف تصفيات غرب آسيا للشباب والشابات والرجال والسيدات لكرة الطاولة — تستعد مدينة \"الدمام\" شرق المملكة العربية السعودية لاستضافة تصفيات غرب آسيا للشباب والشابات المؤهلة للبطولة الآسيوية للشباب والشابات في أوزبكستان 2025.",
      en: "Saudi Arabia hosts West Asia Youth and Men's & Women's Table Tennis Qualifiers — Dammam prepares to host the West Asia Youth Qualifiers for the Asian Championships in Uzbekistan 2025.",
    },
    image: "/homePage/news-2.png",
    date: "2025-05-18",
    href: "#",
  },
  {
    id: 3,
    tag: "NEWS",
    title: {
      ar: "المملكة تستضيف تصفيات غرب آسيا للشباب والشابات والرجال والسيدات لكرة الطاولة — تستعد مدينة \"الدمام\" شرق المملكة العربية السعودية لاستضافة تصفيات غرب آسيا للشباب والشابات المؤهلة للبطولة الآسيوية للشباب والشابات في أوزبكستان 2025.",
      en: "Saudi Arabia hosts West Asia Youth and Men's & Women's Table Tennis Qualifiers — Dammam prepares to host the West Asia Youth Qualifiers for the Asian Championships in Uzbekistan 2025.",
    },
    image: "/homePage/news-3.png",
    date: "2025-05-15",
    href: "#",
  },
];

const SECTION_LABEL = { ar: "الأخبار", en: "News" };
const VIEW_ALL_LABEL = { ar: "عرض الكل", en: "View All" };

// ─── Sub-components ───────────────────────────────────────────────────────────

interface NewsCardProps {
  article: NewsArticle;
  lang: "ar" | "en";
  index: number;
  isVisible: boolean;
}

function NewsCard({ article, lang, index, isVisible }: NewsCardProps) {
  const [hovered, setHovered] = useState(false);
  const isAr = lang === "ar";

  return (
    <a
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
        transition: `opacity 0.6s ease ${index * 0.15}s, transform 0.6s ease ${index * 0.15}s`,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* Image */}
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
          alt={article.title[lang]}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.05)" : "scale(1)",
          }}
        />

        {/* Dark gradient overlay on image bottom */}
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

      {/* Card body */}
      <div
        style={{
          padding: "16px 20px 20px",
          background: "#0d1f18",
          borderTop: "2px solid #005043",
        }}
      >
        {/* Tag */}
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
          {article.tag}
        </span>

        {/* Divider dot row */}
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

        {/* Title */}
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
          {article.title[lang]}
        </p>

        {/* Arrow */}
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
                ? isAr ? "translateX(-4px)" : "translateX(4px)"
                : "translateX(0)",
            }}
          >
            {isAr ? "←" : "→"}
          </span>
        </div>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({ lang }: { lang: "ar" | "en" }) {
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
      {/* Title with accent underline */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: isAr ? 0 : -1,
          }}
        >
          {SECTION_LABEL[lang]}
        </span>

        {/* Green underline accent */}
        <div
          style={{
            width: 56,
            height: 5,
            borderRadius: 3,
            background: "linear-gradient(90deg, #00c896, #005043)",
            alignSelf: "flex-end",
            marginBottom: 6,
          }}
        />

        {/* Arrow */}
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

      {/* View all link */}
      <a
        href="#"
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
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")
        }
      >
        {VIEW_ALL_LABEL[lang]}
        <span style={{ fontSize: 16 }}>{isAr ? "←" : "→"}</span>
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NewsSection({ lang = "ar" }: NewsSectionProps) {
  const isAr = lang === "ar";
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Trigger entrance animations when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
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
      {/* Bottom curved green band (like the design) */}
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

        {/* Cards row */}
        <div
          style={{
            display: "flex",
            gap: 0,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {NEWS_ARTICLES.map((article, index) => (
            <NewsCard
              key={article.id}
              article={article}
              lang={lang}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
