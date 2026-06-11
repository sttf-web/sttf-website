"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface AboutHeroSectionProps {
  lang?: Lang;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  ar: {
    title:    "نبذة عن الاتحاد",
    subtitle: "الاتحاد السعودي لكرة الطاولة — تأسس عام 1956م",
  },
  en: {
    title:    "About the Federation",
    subtitle: "Saudi Table Tennis Federation — Founded in 1956",
  },
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HeroSection({ lang = "ar" }: AboutHeroSectionProps) {
  const isAr = lang === "ar";
  const t = COPY[lang];
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "33.333vh",
        background: "#00704C",
        padding: "clamp(48px, 8vw, 80px) clamp(24px, 5vw, 80px)",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        color: "#ffffff",
        textAlign: "center",
      }}
    >


      <div
        style={{
          position: "relative", zIndex: 1,
          maxWidth: 800, margin: "0 auto",
          opacity: visible ? 1 : 0,
          marginTop:120,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 52px)",
            fontWeight: 900,
            letterSpacing: isAr ? 0 : -1,
            marginBottom: 12,
            lineHeight: 1.2,
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontSize: "clamp(15px, 1.6vw, 20px)",
            color: "rgba(255,255,255,0.72)",
            fontWeight: 500,
          }}
        >
          {t.subtitle}
        </p>
      </div>
    </section>
  );
}
