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
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#050f0a",
        color: "#ffffff",
        padding: "84px 0",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Top + bottom curved green bands (like the design) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          width: "100%",
          height: 140,
          zIndex: 0,
          opacity: 0.95,
        }}
      >
        <path
          d="M0,0 H1440 V70 C1100,140 760,150 0,80 Z"
          fill="#005043"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: -1,
          left: 0,
          width: "100%",
          height: 140,
          zIndex: 0,
          opacity: 0.95,
        }}
      >
        <path
          d="M0,160 C760,240 1100,220 1440,150 V240 H0 Z"
          fill="#005043"
        />
      </svg>

      {/* Background star motif behind image (image asset) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: isAr ? "auto" : "6%",
          right: isAr ? "6%" : "auto",
          top: "50%",
          transform: "translateY(-50%)",
          opacity: 0.25,
          zIndex: 0,
          filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))",
          width: 520,
          height: 520,
          pointerEvents: "none",
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
          display: "grid",
          gridTemplateColumns: "460px 1fr",
          alignItems: "center",
          gap: 64,
        }}
      >
        {/* Photo side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 360,
              height: 420,
              borderRadius: 28,
              overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 40px 90px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.08)",
              position: "relative",
              transform: "translateZ(0)",
            }}
          >
            <Image
              src={imageSrc}
              alt={isAr ? "صورة رئيس الاتحاد" : "President photo"}
              fill
              priority={false}
              sizes="(max-width: 900px) 280px, 360px"
              style={{ objectFit: "cover" }}
            />

            {/* Subtle gradient overlay */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.25) 100%)",
              }}
            />
          </div>
        </div>

        {/* Copy side */}
        <div style={{ maxWidth: 620 }}>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 40px)",
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 18,
              letterSpacing: isAr ? 0 : -0.6,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.85)" }}>{t.headlinePrefix} </span>
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

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 900px) {
          section {
            padding: 72px 0;
          }
        }
        @media (max-width: 860px) {
          section > div {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
        @media (max-width: 520px) {
          section > div {
            padding: 0 20px !important;
          }
        }
      `}</style>
    </section>
  );
}
