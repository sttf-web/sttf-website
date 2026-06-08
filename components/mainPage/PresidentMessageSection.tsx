"use client";

import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PresidentMessageSectionProps {
  lang?: "ar" | "en";
  imageSrc?: string;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const COPY = {
  ar: {
    headlinePrefix: "هدفنا أن",
    headlineStrong: "تقود كرة الطاولة",
    headlineAccent: "عالميًا",
    bodyLines: [
      "رئيس الاتحاد السعودي لكرة الطاولة",
      "صاحب السمو الملكي",
      "الأمير محمد بن عبدالرحمن بن ناصر آل سعود",
    ],
  },
  en: {
    headlinePrefix: "Our goal is to",
    headlineStrong: "lead table tennis",
    headlineAccent: "globally",
    bodyLines: [
      "President, Saudi Table Tennis Federation",
      "His Royal Highness",
      "Prince Mohammed bin Abdulrahman bin Nasser Al Saud",
    ],
  },
} as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PresidentMessageSection({
  lang = "ar",
  imageSrc = "/homePage/president.png",
}: PresidentMessageSectionProps) {
  const isAr = lang === "ar";
  const t = COPY[lang];

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      className="president-message-section"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Top curved green band */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="president-message-top-curve"
      >
        <path
          d="M0,0 H1440 V70 C1100,140 760,150 0,80 Z"
          fill="#005043"
        />
      </svg>

      {/* Bottom curved green band */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="president-message-bottom-curve"
      >
        <path
          d="M0,160 C760,240 1100,220 1440,150 V240 H0 Z"
          fill="#005043"
        />
      </svg>

      {/* Background star motif behind image */}
      <div
        aria-hidden="true"
        className="president-message-star"
        style={{
          left: isAr ? "auto" : "6%",
          right: isAr ? "6%" : "auto",
        }}
      >
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes="520px"
          style={{ objectFit: "contain" }}
          priority={false}
        />
      </div>

      <div className="president-message-inner">
        {/* Photo side */}
        <div className="president-message-photo-side">
          <div className="president-message-photo-card">
            <Image
              src={imageSrc}
              alt={isAr ? "صورة رئيس الاتحاد" : "President photo"}
              fill
              priority={false}
              sizes="(max-width: 900px) 280px, 360px"
              style={{ objectFit: "cover" }}
            />

            <div className="president-message-photo-overlay" aria-hidden="true" />
          </div>
        </div>

        {/* Copy side */}
        <div className="president-message-copy">
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 18,
              letterSpacing: isAr ? 0 : -0.6,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.85)" }}>
              {t.headlinePrefix}{" "}
            </span>
            <span style={{ color: "#00e0aa" }}>{isAr ? "←" : "→"} </span>
            <span style={{ color: "#00e0aa" }}>{t.headlineStrong} </span>
            <span
              style={{
                color: "#00e0aa",
                display: "inline-block",
                paddingBottom: 6,
                borderBottom: "4px solid rgba(0,224,170,0.65)",
                borderRadius: 2,
              }}
            >
              {t.headlineAccent}
            </span>
          </h2>

          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {t.bodyLines.map((line) => (
              <p key={line} style={{ marginBottom: 6 }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .president-message-section {
          position: relative;
          overflow: hidden;
          background: #050f0a;
          color: #ffffff;
          padding: 84px 0;
        }

        .president-message-top-curve {
          position: absolute;
          top: -1px;
          left: 0;
          width: 100%;
          height: 140px;
          z-index: 0;
          opacity: 0.95;
          pointer-events: none;
        }

        .president-message-bottom-curve {
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 140px;
          z-index: 0;
          opacity: 0.95;
          pointer-events: none;
        }

        .president-message-star {
          position: absolute;
          top: 50%;
          width: 520px;
          height: 520px;
          transform: translateY(-50%);
          opacity: 0.25;
          z-index: 0;
          filter: drop-shadow(0 20px 60px rgba(0, 0, 0, 0.6));
          pointer-events: none;
        }

        .president-message-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 460px 1fr;
          align-items: center;
          gap: 64px;
        }

        .president-message-photo-side {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .president-message-photo-card {
          width: 360px;
          height: 420px;
          border-radius: 28px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 10 -20px 50px rgba(0, 0, 0, 0.75),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          transform: translateZ(0);
        }

        .president-message-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 40%,
            rgba(0, 0, 0, 0.25) 100%
          );
        }

        .president-message-copy {
          max-width: 620px;
        }

        @media (max-width: 860px) {
          .president-message-section {
            padding: 72px 0 96px;
          }

          .president-message-inner {
            grid-template-columns: 1fr;
            gap: 36px;
          }

          .president-message-copy {
            max-width: 100%;
            text-align: center;
          }

          .president-message-star {
            width: 420px;
            height: 420px;
            opacity: 0.18;
          }
        }

        @media (max-width: 520px) {
          .president-message-section {
            padding: 64px 0 88px;
          }

          .president-message-inner {
            padding: 0 20px;
          }

          .president-message-photo-card {
            width: min(100%, 320px);
            height: 380px;
          }

          .president-message-top-curve,
          .president-message-bottom-curve {
            height: 100px;
          }

          .president-message-star {
            width: 320px;
            height: 320px;
          }
        }
      `}</style>
    </section>
  );
}