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
    preLabel: "من خلال تطبيق",
    appTag: "STTF",
    headline: "نقيس اداء اللاعبين باحترافية..",
    description:
      "تطبيق الاتحاد السعودي لكرة الطاولة يتيح لك متابعة أدائك بدقة عالية، وتحليل نقاط القوة والضعف، وتطوير مستواك باستمرار نحو الاحتراف.",
    cta: "تحميل التطبيق",
  },
  en: {
    preLabel: "Through the",
    appTag: "STTF",
    headline: "We measure player performance professionally..",
    description:
      "The Saudi Table Tennis Federation app lets you track your performance with precision, analyse strengths and weaknesses, and continuously develop your skills toward excellence.",
    cta: "Download App",
  },
} as const;

// ─── Star background motif ───────────────────────────────────────────────────

function StarMotif() {
  return (
    <div aria-hidden="true" className="app-promo-star">
      <Image
        src="/homePage/star.png"
        alt=""
        fill
        sizes="(max-width: 768px) 280px, 620px"
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
      className="app-promo-section"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Background dots */}
      <div aria-hidden="true" className="app-promo-dots" />

      {/* Background star motif */}
      <StarMotif />

      {/* Main grid */}
      <div className="app-promo-inner">
        {/* App image */}
        <div
          className="app-promo-image-side"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s ease 0s, transform 0.8s ease 0s",
          }}
        >
          <div className="app-promo-phone">
            <Image
              src={appImageSrc}
              alt={isAr ? "تطبيق STTF" : "STTF App"}
              fill
              priority={false}
              sizes="(max-width: 520px) 82vw, (max-width: 900px) 56vw, 460px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Text content */}
        <div
          className="app-promo-copy"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateX(0)"
              : `translateX(${isAr ? -40 : 40}px)`,
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          {/* Arrow + pre-label + STTF tag */}
          <div
            className="app-promo-label-row"
            style={{
              flexDirection: isAr ? "row-reverse" : "row",
              justifyContent: isAr ? "flex-end" : "flex-start",
            }}
          >
            <span className="app-promo-arrow">{isAr ? "←" : "→"}</span>

            <div className="app-promo-tag">{t.appTag}</div>

            <span className="app-promo-pre-label">{t.preLabel}</span>
          </div>

          <h2
            className="app-promo-headline"
            style={{
              textAlign: isAr ? "right" : "left",
            }}
          >
            {t.headline}
          </h2>

          <p
            className="app-promo-description"
            style={{
              textAlign: isAr ? "right" : "left",
            }}
          >
            {t.description}
          </p>

          <div
            className="app-promo-cta-wrap"
            style={{
              justifyContent: isAr ? "flex-start" : "flex-end",
            }}
          >
            {/* <a
              href="#"
              className="app-promo-cta"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 32px rgba(0,200,150,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(0,200,150,0.35)";
              }}
            >
              <span>📱</span>
              <span>{t.cta}</span>
            </a> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        .app-promo-section {
          position: relative;
          overflow: hidden;
          background: #050f0a;
          color: #ffffff;
          padding: 100px 0;
        }

        .app-promo-dots {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.04) 1px,
            transparent 1px
          );
          background-size: 28px 28px;
        }

        .app-promo-star {
          position: absolute;
          top: 50%;
          right: 4%;
          width: clamp(160px, 32vw, 620px);
          height: clamp(160px, 32vw, 620px);
          transform: translateY(-50%);
          opacity: 0.7;
          pointer-events: none;
          z-index: 0;
        }

        .app-promo-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 64px;
        }

        .app-promo-image-side {
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }

        .app-promo-phone {
          position: relative;
          width: clamp(260px, 32vw, 460px);
          height: clamp(320px, 40vw, 580px);
          filter: drop-shadow(0 20px 80px rgba(0, 200, 150, 0.18))
            drop-shadow(0 20px 40px rgba(0, 0, 0, 0.7));
        }

        .app-promo-copy {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .app-promo-label-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .app-promo-arrow {
          font-size: 28px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1;
        }

        .app-promo-tag {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 8px;
          padding: 6px 16px;
          font-family: "Inter", sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1px;
          color: #ffffff;
        }

        .app-promo-pre-label {
          font-size: 18px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        .app-promo-headline {
          font-size: clamp(22px, 3vw, 36px);
          font-weight: 900;
          line-height: 1.35;
          color: #ffffff;
          margin: 0;
        }

        .app-promo-description {
          font-size: clamp(14px, 1.4vw, 17px);
          font-weight: 400;
          line-height: 1.85;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          max-width: 480px;
        }

        .app-promo-cta-wrap {
          display: flex;
        }

        .app-promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 13px 30px;
          border-radius: 50px;
          background: linear-gradient(135deg, #00c896, #008f6a);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(0, 200, 150, 0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        @media (max-width: 900px) {
          .app-promo-section {
            padding: 80px 0;
          }

          .app-promo-inner {
            grid-template-columns: 1fr;
            gap: 42px;
            padding: 0 28px;
          }

          .app-promo-image-side {
            order: 1;
          }

          .app-promo-copy {
            order: 2;
            align-items: center;
            text-align: center;
            gap: 20px;
          }

          .app-promo-label-row {
            justify-content: center !important;
            flex-direction: row !important;
            flex-wrap: wrap;
          }

          .app-promo-headline,
          .app-promo-description {
            text-align: center !important;
          }

          .app-promo-description {
            max-width: 640px;
          }

          .app-promo-cta-wrap {
            justify-content: center !important;
          }

          .app-promo-phone {
            width: min(56vw, 340px);
            height: min(72vw, 430px);
          }

          .app-promo-star {
            top: 24%;
            right: 50%;
            width: 360px;
            height: 360px;
            transform: translateX(50%);
            opacity: 0.35;
          }
        }

        @media (max-width: 520px) {
          .app-promo-section {
            padding: 64px 0;
          }

          .app-promo-inner {
            padding: 0 18px;
            gap: 32px;
          }

          .app-promo-phone {
            width: min(82vw, 300px);
            height: min(105vw, 390px);
          }

          .app-promo-label-row {
            gap: 10px;
          }

          .app-promo-arrow {
            font-size: 24px;
          }

          .app-promo-tag {
            font-size: 13px;
            padding: 5px 14px;
          }

          .app-promo-pre-label {
            font-size: 15px;
          }

          .app-promo-headline {
            font-size: clamp(24px, 8vw, 32px);
          }

          .app-promo-description {
            font-size: 14px;
            line-height: 1.8;
          }

          .app-promo-cta {
            width: 100%;
            max-width: 260px;
            justify-content: center;
            padding: 13px 22px;
          }

          .app-promo-star {
            top: 24%;
            width: 280px;
            height: 280px;
            opacity: 0.28;
          }
        }
      `}</style>
    </section>
  );
}