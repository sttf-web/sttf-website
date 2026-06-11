"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface CredibilitySectionProps {
  lang?: Lang;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTNER_LOGOS = [
  { src: "/homePage/logo1.png", alt: { ar: "شريك 1", en: "Partner 1" } },
  { src: "/homePage/logo2.png", alt: { ar: "شريك 2", en: "Partner 2" } },
  { src: "/homePage/logo3.png", alt: { ar: "شريك 3", en: "Partner 3" } },
  { src: "/homePage/logo4.png", alt: { ar: "شريك 4", en: "Partner 4" } },
  { src: "/homePage/logo5.png", alt: { ar: "شريك 5", en: "Partner 5" } },
  { src: "/homePage/logo6.png", alt: { ar: "شريك 6", en: "Partner 6" } },
] as const;

const COPY = {
  ar: {
    partnersLabel: "شركاؤنا الاستراتيجيون:",
    locationTitle: "أين تجدنا ؟",
    locationDesc:  "أبحث عن صالة الاتحاد السعودي لكرة الطاولة و انشئ عضويتك الآن",
    cta:           "أشتر هنا",
  },
  en: {
    partnersLabel: "Our Strategic Partners:",
    locationTitle: "Where to Find Us?",
    locationDesc:  "Find a Saudi Table Tennis Federation hall near you and create your membership now",
    cta:           "Register Here",
  },
} as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PartnersStrip({ lang, visible }: { lang: Lang; visible: boolean }) {
  const isAr = lang === "ar";
  const t = COPY[lang];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 28,
        padding: "52px clamp(24px, 5vw, 80px) 60px",
      }}
    >
      {/* Label */}
      <p
        style={{
          fontSize: 35,
          fontWeight: 700,
          color: "#ffffff",
          textAlign: isAr ? "right" : "left",
          margin: 0,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease 0s, transform 0.6s ease 0s",
        }}
      >
        {t.partnersLabel}
      </p>

      {/* Logo row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isAr ? "flex-end" : "flex-start",
          gap: "clamp(24px, 4vw, 56px)",
          flexWrap: "wrap",
        }}
      >
        {PARTNER_LOGOS.map((logo, i) => (
          <div
            key={logo.src}
            style={{
              position: "relative",
              width: "clamp(60px, 8vw, 110px)",
              height: 48,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: `opacity 0.6s ease ${i * 80 + 100}ms, transform 0.6s ease ${i * 80 + 100}ms`,
              filter: "brightness(0) invert(1)",
            }}
          >
            <Image
              src={logo.src}
              alt={logo.alt[lang]}
              fill
              sizes="110px"
              style={{ objectFit: "contain" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function LocationPanel({ lang, visible }: { lang: Lang; visible: boolean }) {
  const isAr = lang === "ar";
  const t = COPY[lang];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isAr ? "1fr 1fr" : "1fr 1fr",
        alignItems: "center",
        gap: "clamp(24px, 4vw, 64px)",
        padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 80px)",
        minHeight: 380,
      }}
    >
      {/* Saudi Arabia map image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(220px, 28vw, 380px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : `translateX(${isAr ? 40 : -40}px)`,
          transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
        }}
      >
        <Image
          src="/homePage/saudiLand.png"
          alt={isAr ? "خريطة المملكة العربية السعودية" : "Saudi Arabia map"}
          fill
          sizes="(max-width: 768px) 90vw, 480px"
          style={{ objectFit: "contain", objectPosition: isAr ? "right center" : "left center" }}
        />
      </div>

      {/* Text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: isAr ? "right" : "left",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : `translateX(${isAr ? -40 : 40}px)`,
          transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 48px)",
            fontWeight: 900,
            color: "#005043",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {t.locationTitle}
        </h2>

        <p
          style={{
            fontSize: "clamp(14px, 1.4vw, 17px)",
            fontWeight: 500,
            color: "#2a4a40",
            lineHeight: 1.85,
            margin: 0,
            maxWidth: 360,
          }}
        >
          {t.locationDesc}
        </p>

        <div>
          <a
            href="/contact"
            style={{
              display: "inline-block",
              marginTop: 8,
              padding: "10px 24px",
              borderRadius: 8,
              border: "1.5px solid #005043",
              background: "transparent",
              color: "#005043",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              transition: "background 0.2s ease, color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#005043";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#005043";
            }}
          >
            {t.cta}
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CredibilitySection({ lang = "ar" }: CredibilitySectionProps) {
  const isAr = lang === "ar";
  const { ref, visible } = useInViewOnce<HTMLElement>(0.12);

  return (
    <section
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* ══════════════════════════════════════════════
          TOP PANEL — dark green with partners logos
      ══════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          background: "#050F0A",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>
          <PartnersStrip lang={lang} visible={visible} />
        </div>

        {/* Bottom curve — transitions into the light panel below */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(60px, 8vw, 120px)",
            marginTop: -2,
          }}
        >
          <path d="M0,0 C400,120 1040,120 1440,0 L1440,120 H0 Z" fill="#BDE8DF" />
        </svg>
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM PANEL — light mint with map + text
      ══════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          background: "linear-gradient(160deg, #c8ede6 0%, #9fd8cc 100%)",
          overflow: "hidden",
        }}
      >
        {/* Subtle light dot grid */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(0,80,67,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto" }}>
          <LocationPanel lang={lang} visible={visible} />
        </div>

        {/* Bottom black arc — transitions to next dark section */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(60px, 8vw, 120px)",
          }}
        >
          <path d="M0,120 C400,0 1040,0 1440,120 L1440,120 H0 Z" fill="#000000" />
        </svg>
      </div>
    </section>
  );
}
