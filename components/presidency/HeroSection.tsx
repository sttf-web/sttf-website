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
        background:
          "linear-gradient(135deg, #003d30 0%, #005043 60%, #007a62 100%)",
        padding: "clamp(48px, 8vw, 80px) clamp(24px, 5vw, 80px)",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Glow blobs */}
      {[
        { top: -80, left: -80, size: 300 },
        { bottom: -80, right: -80, size: 260 },
      ].map((b, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: b.size, height: b.size,
            top: "top" in b ? b.top : undefined,
            bottom: "bottom" in b ? (b as any).bottom : undefined,
            left: "left" in b ? b.left : undefined,
            right: "right" in b ? (b as any).right : undefined,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,200,150,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Green left accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0, bottom: 0,
          left: isAr ? "auto" : 0,
          right: isAr ? 0 : "auto",
          width: 6,
          background: "linear-gradient(to bottom, #00e0aa, #005043)",
          borderRadius: 4,
        }}
      />

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

      {/* Bottom wave */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ position: "absolute", bottom: -1, left: 0, width: "100%", height: 50, pointerEvents: "none" }}
      >
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 H0 Z" fill="#050f0a" />
      </svg>
    </section>
  );
}
