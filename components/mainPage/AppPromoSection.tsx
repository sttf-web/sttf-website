"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface AppPromoSectionProps {
  lang?: Lang;
  appImageSrc?: string;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  ar: {
    preLabel:    "من خلال تطبيق",
    appTag:      "STTF",
    headline:    "نقيس اداء اللاعبين باحترافية..",
    description: "تطبيق الاتحاد السعودي لكرة الطاولة يتيح لك متابعة أدائك بدقة عالية، وتحليل نقاط القوة والضعف، وتطوير مستواك باستمرار نحو الاحتراف.",
    cta:         "تحميل التطبيق",
  },
  en: {
    preLabel:    "Through the",
    appTag:      "STTF",
    headline:    "We measure player performance professionally..",
    description: "The Saudi Table Tennis Federation app lets you track your performance with precision, analyse strengths and weaknesses, and continuously develop your skills toward excellence.",
    cta:         "Download App",
  },
} as const;

// ─── Star background motif ───────────────────────────────────────────────────

function StarMotif() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top: "50%",
        right: "4%",
        transform: "translateY(-50%)",
        width: "clamp(160px, 32vw, 620px)",
        height: "clamp(160px, 32vw, 620px)",
        opacity: 0.70,
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Image
        src="/homePage/star.png"
        alt=""
        fill
        sizes="320px"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AppPromoSection({
  lang = "ar",
  appImageSrc = "/homePage/App.png",
}: AppPromoSectionProps) {
  const isAr = lang === "ar";
  const t = COPY[lang];

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
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
        color: "#ffffff",
        padding: "100px 0",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >

      {/* ── Background star motif (right side) ───────────────────────────── */}
      <StarMotif />

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: isAr ? "1fr 1fr" : "1fr 1fr",
          alignItems: "center",
          gap: 64,
        }}
      >
        {/* ── App image ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s ease 0s, transform 0.8s ease 0s",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "clamp(260px, 32vw, 460px)",
              height: "clamp(320px, 40vw, 580px)",
              filter: "drop-shadow(0 40px 80px rgba(0,200,150,0.18)) drop-shadow(0 20px 40px rgba(0,0,0,0.7))",
            }}
          >
            <Image
              src={appImageSrc}
              alt={isAr ? "تطبيق STTF" : "STTF App"}
              fill
              priority={false}
              sizes="(max-width: 768px) 80vw, 460px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* ── Text content ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateX(0)" : `translateX(${isAr ? -40 : 40}px)`,
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          {/* Arrow + pre-label + STTF tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexDirection: isAr ? "row-reverse" : "row",
              justifyContent: isAr ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1,
              }}
            >
              {isAr ? "←" : "→"}
            </span>

            {/* STTF tag pill */}
            <div
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                padding: "6px 16px",
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 1,
                color: "#fff",
              }}
            >
              {t.appTag}
            </div>

            <span
              style={{
                fontSize: isAr ? 18 : 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {t.preLabel}
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 36px)",
              fontWeight: 900,
              lineHeight: 1.35,
              color: "#ffffff",
              margin: 0,
              textAlign: isAr ? "right" : "left",
            }}
          >
            {t.headline}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: "clamp(14px, 1.4vw, 17px)",
              fontWeight: 400,
              lineHeight: 1.85,
              color: "rgba(255,255,255,0.6)",
              margin: 0,
              textAlign: isAr ? "right" : "left",
              maxWidth: 480,
            }}
          >
            {t.description}
          </p>

          {/* CTA button */}
          <div style={{ display: "flex", justifyContent: isAr ? "flex-start" : "flex-end" }}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 30px",
                borderRadius: 50,
                background: "linear-gradient(135deg, #00c896, #008f6a)",
                color: "#ffffff",
                fontSize: 15,
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(0,200,150,0.35)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,200,150,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,200,150,0.35)";
              }}
            >
              <span>📱</span>
              <span>{t.cta}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
