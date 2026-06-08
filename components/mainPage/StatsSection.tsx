"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface StatItem {
  id: string;
  value: number;
  prefix?: string;
  label: {
    ar: string;
    en: string;
  };
  icon: "players" | "growth";
}

interface StatsSectionProps {
  lang?: Lang;
  players?: number;
  clubs?: number;
}

// ─── Copy / Defaults ──────────────────────────────────────────────────────────

const DEFAULTS = {
  players: 4733,
  clubs: 186,
} as const;

const STAT_ITEMS = (players: number, clubs: number): StatItem[] => [
  {
    id: "players",
    value: players,
    prefix: "+",
    label: {
      ar: "لاعب ولاعبة",
      en: "Players",
    },
    icon: "players",
  },
  {
    id: "clubs",
    value: clubs,
    prefix: "+",
    label: {
      ar: "نادٍ مسجل",
      en: "Registered Clubs",
    },
    icon: "growth",
  },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInViewOnce<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

function useCountUp(target: number, enabled: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, durationMs]);

  return value;
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────

function PlayersIcon({ color = "#00c896" }: { color?: string }) {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="34" cy="22" r="12" fill={color} opacity="0.98" />
      <path
        d="M14 56c0-10.5 8.5-19 19-19h2c10.5 0 19 8.5 19 19v2H14v-2z"
        fill={color}
        opacity="0.98"
      />
    </svg>
  );
}

function GrowthBarsIcon({ color = "#00c896" }: { color?: string }) {
  const bars = [8, 12, 16, 18, 22, 20, 26, 30, 34, 40, 48];
  return (
    <svg
      width="90"
      height="70"
      viewBox="0 0 96 64"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {bars.map((h, i) => {
        const w = 5;
        const gap = 2;
        const x = 6 + i * (w + gap);
        const y = 56 - h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={w}
            height={h}
            rx={1.5}
            fill={color}
            opacity={0.55 + i * 0.04}
          />
        );
      })}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StatsSection({
  lang = "ar",
  players = DEFAULTS.players,
  clubs = DEFAULTS.clubs,
}: StatsSectionProps) {
  const isAr = lang === "ar";
  const items = useMemo(() => STAT_ITEMS(players, clubs), [players, clubs]);
  const { ref, inView } = useInViewOnce<HTMLElement>(0.22);

  return (
    <section
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "#000000",
        color: "#ffffff",
        padding: "120px 0 140px",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Top curve */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: -1,
          left: 0,
          width: "100%",
          height: 170,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <path d="M0,0 H1440 V80 C1100,20 760,20 0,90 Z" fill="#005043" />
      </svg>


      {/* Bottom curve — desktop/tablet above 760px */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="stats-bottom-curve stats-bottom-curve-desktop"
      >
        <defs>
          <linearGradient id="sttfHillDesktop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="100%" stopColor="#35CE83" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          d="M0,320 L100,515 C280,140 600,80 720,80 C1100,80 1260,220 1440,310 L1440,320 Z"
          fill="url(#sttfHillDesktop)"
        />
      </svg>

      {/* Bottom curve — mobile below 760px */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="stats-bottom-curve stats-bottom-curve-mobile"
      >
        <defs>
          <linearGradient id="sttfHillMobile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="100%" stopColor="#35CE83" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          d="M0,320 C240,120 480,70 720,70 C960,70 1200,120 1440,320 L1440,320 L0,320 Z"
          fill="url(#sttfHillMobile)"
        />
      </svg>

      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          pointerEvents: "none",
          opacity: 0.65,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 48px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            alignItems: "center",
            gap: 64,
          }}
        >
          {items.map((item) => (
            <StatBlock key={item.id} item={item} lang={lang} animate={inView} />
          ))}
        </div>
      </div>

<style>{`
  .stats-bottom-curve {
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    z-index: 0;
    pointer-events: none;
  }

  .stats-bottom-curve-desktop {
    display: block;
    height: 160px;
  }

  .stats-bottom-curve-mobile {
    display: none;
    height: clamp(130px, 18vw, 180px);
  }

  @media (max-width: 770px) {
    section > div > div {
      grid-template-columns: 1fr !important;
      gap: 36px !important;
      text-align: center;
    }

    .stats-bottom-curve-desktop {
      display: none;
    }

    .stats-bottom-curve-mobile {
      display: block;
    }
  }
`}</style>
    </section>
  );
}

// ─── Subcomponent: StatBlock ─────────────────────────────────────────────────

function StatBlock({
  item,
  lang,
  animate,
}: {
  item: StatItem;
  lang: Lang;
  animate: boolean;
}) {
  const isAr = lang === "ar";
  const value = useCountUp(item.value, animate, 1100);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 18,
        marginTop: 20,
        marginBottom: 40,
        transform: animate ? "translateY(0)" : "translateY(12px)",
        opacity: animate ? 1 : 0,
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      {/* Number */}
      <div style={{ textAlign: isAr ? "right" : "left" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: isAr ? "flex-end" : "flex-start",
            gap: 10,
          }}
        >
          <span
            style={{
              fontSize: "clamp(52px, 6vw, 88px)",
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: -1.5,
            }}
          >
            {item.prefix}
            {value.toLocaleString(isAr ? "ar-SA" : "en-US")}
          </span>
        </div>
        <div
          style={{
            fontSize: "clamp(18px, 2.2vw, 28px)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            marginTop: 20,
          }}
        >
          {item.label[lang]}
        </div>
      </div>

      {/* Icon */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {item.icon === "players" ? <PlayersIcon /> : <GrowthBarsIcon />}
      </div>
    </div>
  );
}
