"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface PromoSectionProps {
  lang?: Lang;
  playerImageSrc?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEXT_ROWS = [
  { src: "/homePage/promo-text-iltizam.png", alt: { ar: "التزام",  en: "Commitment" } },
  { src: "/homePage/promo-text-nahw.png",    alt: { ar: "نحو",     en: "To"          } },
  { src: "/homePage/promo-text-injaz.png",   alt: { ar: "الإنجاز", en: "Excellence"  } },
] as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromoSection({
  lang = "ar",
  playerImageSrc = "/homePage/player.png",
}: PromoSectionProps) {
  const isAr = lang === "ar";
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      aria-label={isAr ? "التزام نحو الإنجاز" : "Commitment to Excellence"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#050f0a",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* ── Green panel ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          background: "linear-gradient(145deg, #3dd68c 0%, #2dc57a 40%, #22b069 100%)",
          clipPath: "polygon(16% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 18%)",
          paddingBottom: "clamp(120px, 18vw, 200px)",
        }}
      >
        {/* ── Text image rows ──────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            padding: "clamp(48px, 8vw, 96px) clamp(16px, 3vw, 40px) 0",
            display: "flex",
            flexDirection: "column",
            gap: "clamp(8px, 1.5vw, 18px)",
          }}
        >
          {TEXT_ROWS.map((row, i) => (
            <div
              key={row.src}
              style={{
                width: "100%",
                opacity: animateIn ? 1 : 0,
                transform: animateIn ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.65s ease ${i * 140}ms, transform 0.65s ease ${i * 140}ms`,
              }}
            >
              <Image
                src={row.src}
                alt={row.alt[lang]}
                width={1400}
                height={120}
                priority={i === 0}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          ))}
        </div>

        {/* ── Bottom black arc ─────────────────────────────────────────────── */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            bottom: -2,
            left: 0,
            width: "100%",
            height: "clamp(120px, 18vw, 210px)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <path
            d="M0,320 C200,120 520,60 720,60 C940,60 1240,130 1440,320 H0 Z"
            fill="#050f0a"
          />
        </svg>

        {/* ── Player image ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(240px, 36vw, 520px)",
            height: "clamp(280px, 46vw, 640px)",
            zIndex: 3,
            filter: "drop-shadow(0 -10px 40px rgba(0,0,0,0.45))",
          }}
        >
          <Image
            src={playerImageSrc}
            alt={isAr ? "لاعب" : "Player"}
            fill
            sizes="(max-width: 900px) 78vw, 520px"
            style={{ objectFit: "contain", objectPosition: "bottom center" }}
          />
        </div>
      </div>
    </section>
  );
}
