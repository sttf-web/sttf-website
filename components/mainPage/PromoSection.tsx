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
  {
    src: "/homePage/promo-text-iltizam.png",
    alt: { ar: "التزام", en: "Commitment" },
  },
  {
    src: "/homePage/promo-text-nahw.png",
    alt: { ar: "نحو", en: "To" },
  },
  {
    src: "/homePage/promo-text-injaz.png",
    alt: { ar: "الإنجاز", en: "Excellence" },
  },
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
      className="promo-section"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <div className="promo-panel">
        {/* Dot grid behind everything */}
        <div aria-hidden="true" className="promo-dots" />

        {/* Text image rows */}
        <div className="promo-text-rows">
          {TEXT_ROWS.map((row, i) => (
            <div
              key={row.src}
              className="promo-text-row"
              style={{
                opacity: animateIn ? 1 : 0,
                transform: animateIn ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.65s ease ${i * 140}ms, transform 0.65s ease ${
                  i * 140
                }ms`,
              }}
            >
              <Image
                src={row.src}
                alt={row.alt[lang]}
                width={1400}
                height={120}
                priority={i === 0}
                className="promo-text-image"
              />
            </div>
          ))}
        </div>

        {/* Bottom black arc */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="promo-arc"
        >
          <path
            d="M0,320 C200,120 520,60 720,60 C940,60 1240,130 1440,320 H0 Z"
            fill="#050f0a"
          />
        </svg>

        {/* Player image */}
        <div className="promo-player">
          <Image
            src={playerImageSrc}
            alt={isAr ? "لاعب" : "Player"}
            fill
            priority
            sizes="(max-width: 480px) 94vw, (max-width: 768px) 88vw, (max-width: 1024px) 55vw, 520px"
            className="promo-player-image"
          />
        </div>
      </div>

      <style jsx>{`
        .promo-section {
          position: relative;
          overflow: hidden;
          width: 100%;
          background: #000000;
        }

        .promo-panel {
          position: relative;
          width: 100%;
          min-height: 810px;
          overflow: hidden;
          background: linear-gradient(
            145deg,
            #3dd68c 0%,
            #35ce83 40%,
            #35ce83 100%
          );
          clip-path: polygon(
            16% 0%,
            100% 0%,
            100% 100%,
            0% 100%,
            0% 18%
          );
          padding-bottom: clamp(120px, 18vw, 200px);
          border: 0;
          outline: 0;
        }

        .promo-dots {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.04) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
        }
          
        .promo-text-rows {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: clamp(48px, 8vw, 96px) clamp(16px, 3vw, 40px) 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: clamp(8px, 1.5vw, 18px);
        }

        .promo-text-row {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .promo-text-image {
          display: block;
          width: min(100%, 1400px);
          height: auto;
        }

        .promo-arc {
          position: absolute;
          bottom: -6px;
          left: 0;
          z-index: 3;
          width: 100%;
          height: calc(clamp(120px, 18vw, 210px) + 8px);
          pointer-events: none;
          display: block;
        }

        .promo-player {
          position: absolute;
          bottom: clamp(40px, 8vw, 130px);
          left: 50%;
          z-index: 4;
          width: clamp(240px, 36vw, 520px);
          height: clamp(280px, 46vw, 640px);
          transform: translateX(-50%);
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.45));
        }

        .promo-player-image {
          object-fit: contain;
          object-position: bottom center;
        }

        @media (max-width: 768px) {
          .promo-panel {
            min-height: 620px;
            clip-path: none;
            padding-bottom: 250px;
          }

          .promo-text-rows {
            padding: 36px 0 0;
            gap: 8px;
          }

          .promo-text-image {
            width: 100%;
            max-width: none;
          }

          .promo-player {
            bottom: 34px;
            width: min(88vw, 360px);
            height: min(95vw, 430px);
          }

          .promo-arc {
            height: 125px;
          }
        }

        @media (max-width: 480px) {
          .promo-panel {
            min-height: 540px;
            padding-bottom: 220px;
          }

          .promo-text-rows {
            padding-top: 30px;
            gap: 6px;
          }

          .promo-player {
            bottom: 24px;
            width: min(90vw, 320px);
            height: min(100vw, 390px);
          }

          .promo-arc {
            height: 105px;
          }
        }
      `}</style>
    </section>
  );
}