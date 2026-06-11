"use client";

import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface MissionItem {
  icon: React.ReactNode;
  text: { ar: string; en: string };
}

interface MissionSectionProps {
  lang?: Lang;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconTarget() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#00c896" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="5" stroke="#00c896" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="1.5" fill="#00c896" />
    </svg>
  );
}

function IconPlayers() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9"  cy="7"  r="3" stroke="#00c896" strokeWidth="1.8" />
      <circle cx="16" cy="7"  r="3" stroke="#00c896" strokeWidth="1.8" />
      <path d="M2,20 C2,15.6 5.1,12 9,12 h6 c3.9,0 7,3.6 7,8" stroke="#00c896" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6,3 H18 V11 C18,15 15,18 12,18 C9,18 6,15 6,11 Z" stroke="#00c896" strokeWidth="1.8" />
      <path d="M6,6 H3 C3,10 5,12 7,13" stroke="#00c896" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18,6 H21 C21,10 19,12 17,13" stroke="#00c896" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12,18 V21" stroke="#00c896" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8,21 H16" stroke="#00c896" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MISSION_ITEMS: MissionItem[] = [
  {
    icon: <IconTarget />,
    text: {
      ar: "تطوير كرة الطاولة للجميع من خلال بيئة شاملة وبرامج جذابة",
      en: "Develop table tennis for all through inclusive environments and engaging programmes",
    },
  },
  {
    icon: <IconPlayers />,
    text: {
      ar: "رعاية الجيل القادم من النجوم",
      en: "Nurture the next generation of stars",
    },
  },
  {
    icon: <IconTrophy />,
    text: {
      ar: "بناء مستقبل مستدام لكرة الطاولة",
      en: "Build a sustainable future for table tennis",
    },
  },
];

const COPY = {
  ar: { sectionTag: "الرسالة" },
  en: { sectionTag: "Mission"  },
} as const;

// ─── Mission Item Row ─────────────────────────────────────────────────────────

function MissionRow({
  item,
  lang,
  index,
  visible,
}: {
  item: MissionItem;
  lang: Lang;
  index: number;
  visible: boolean;
}) {
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: isAr ? "row" : "row-reverse",
        gap: 20,
        padding: "clamp(18px, 2.5vw, 26px) clamp(20px, 3vw, 36px)",
        borderBottom: index < MISSION_ITEMS.length - 1
          ? "1px solid rgba(255,255,255,0.07)"
          : "none",
        background: hovered ? "rgba(0,200,150,0.04)" : "transparent",
        transition: "background 0.25s ease, opacity 0.6s ease, transform 0.6s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : `translateX(${isAr ? 30 : -30}px)`,
        // stagger each row
        transitionDelay: visible ? `${index * 0.12 + 0.2}s` : "0s",
        cursor: "default",
      }}
    >
            {/* Icon bubble */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "#247B34",
          background: "#E9F0EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.25s ease, background 0.25s ease",
        }}
      >
        {item.icon}
      </div>
      {/* Text */}
      <p
        style={{
          fontSize: "clamp(14px, 1.5vw, 18px)",
          fontWeight: 600,
          color: "#000000" ,
          margin: 0,
          lineHeight: 1.7,
          textAlign: isAr ? "right" : "left",
          transition: "color 0.25s ease",
          flex: 1,
        }}
      >
        {item.text[lang]}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MissionSection({ lang = "ar" }: MissionSectionProps) {
  const isAr = lang === "ar";
  const t = COPY[lang];
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
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
        padding: "0 clamp(24px, 5vw, 80px) clamp(80px, 10vw, 120px)",
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        color: "#ffffff",
      }}
    >

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto" }}>

        {/* ── Section tag ──────────────────────────────────────────────────── */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: isAr ? "flex-start" : "flex-end",
    gap: 10,
    marginBottom: 28,
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateX(0)"
      : `translateX(${isAr ? 20 : -20}px)`,
    transition: "opacity 0.6s ease 0s, transform 0.6s ease 0s",
  }}
>
  <div style={{ position: "relative", display: "inline-block" }}>
    {/* Green bar behind the text */}
    <div
      style={{
        position: "absolute",
        right: isAr ? 0 : "auto",
        left: isAr ? "auto" : 0,
        top: "58%",
        width: "42%",
        height: 14,
        background: "#54C879",
        transform: "translateY(-50%)",
        zIndex: 0,
      }}
    />

    <h2
      style={{
        position: "relative",
        zIndex: 1,
        fontSize: "clamp(28px, 3.5vw, 44px)",
        fontWeight: 900,
        margin: 0,
        letterSpacing: isAr ? 0 : -0.5,
      }}
    >
      {t.sectionTag}
    </h2>
  </div>
</div>

        {/* ── Mission card ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgb(255, 255, 255)",
            overflow: "hidden",
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 0.1s",
          }}
        >
          {MISSION_ITEMS.map((item, i) => (
            <MissionRow
              key={i}
              item={item}
              lang={lang}
              index={i}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
