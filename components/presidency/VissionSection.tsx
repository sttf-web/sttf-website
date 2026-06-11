"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface VisionSectionProps {
  lang?: Lang;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  ar: {
    sectionTag: "الرؤية",
    statement:  "نشر وتعزيز ممارسة كرة الطاولة في المجتمع، وتحقيق التميز على المستويين الإقليمي والدولي",
  },
  en: {
    sectionTag: "Vision",
    statement:  "To promote and develop table tennis across society, and achieve excellence at both the regional and international levels.",
  },
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VisionSection({ lang = "ar" }: VisionSectionProps) {
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
        background: "#000000",
        padding: "clamp(64px, 10vw, 100px) clamp(24px, 5vw, 80px)",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>

        {/* ── Section tag ──────────────────────────────────────────────────── */}
<div className="relative inline-block">
  {/* Green bar behind the last part of the text */}
  <div
    className="
      absolute right-0 top-1/2 z-0
      h-[14px] w-[42%]
      -translate-y-1/2
      bg-[#45c878]
    "
  />

  <h2
    className="
      relative z-10 m-0
      text-[clamp(32px,4vw,56px)]
      font-black leading-tight
      text-white
    "
    style={{
      letterSpacing: isAr ? 0 : -0.5,
    }}
  >
    {t.sectionTag}
  </h2>
</div>

        {/* ── Vision card ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "#00704C",
            border: "1px solid rgba(0,200,150,0.2)",
            padding: "clamp(28px, 4vw, 48px) clamp(24px, 4vw, 48px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
            position: "relative",
            overflow: "hidden",
          }}
        >

          <p
            style={{
              fontSize: "clamp(16px, 2vw, 22px)",
              fontWeight: 700,
              lineHeight: 1.85,
              textAlign: "center",
              color: "rgba(255,255,255,0.92)",
              margin: 0,
              position: "relative", zIndex: 1,
            }}
          >
            {t.statement}
          </p>
        </div>
      </div>
    </section>
  );
}
