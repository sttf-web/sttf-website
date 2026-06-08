"use client";

import { useEffect, useRef, useState } from "react";
import {
  Award,
  Handshake,
  Target,
  Trophy,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface GoalsSectionProps {
  lang?: Lang;
}

interface GoalItem {
  id: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  icon: React.ReactNode;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const GOALS: GoalItem[] = [
  {
    id: "excellence",
    title: {
      ar: "الأداء",
      en: "Performance",
    },
    description: {
      ar: "نسعى للتميز",
      en: "We strive for excellence",
    },
    icon: <Award size={26} />,
  },
  {
    id: "strength",
    title: {
      ar: "القوة",
      en: "Strength",
    },
    description: {
      ar: "نعطي كل ما لدينا",
      en: "We give our best",
    },
    icon: <Users size={26} />,
  },
  {
    id: "competition",
    title: {
      ar: "المنافسة",
      en: "Competition",
    },
    description: {
      ar: "نؤمن بروح المنافسة أولًا",
      en: "We believe in true competition",
    },
    icon: <Trophy size={26} />,
  },
  {
    id: "passion",
    title: {
      ar: "الشغف",
      en: "Passion",
    },
    description: {
      ar: "نلعب ونعمل بشغفنا",
      en: "We play and work with passion",
    },
    icon: <Handshake size={26} />,
  },
  {
    id: "goal",
    title: {
      ar: "الهدف",
      en: "Goal",
    },
    description: {
      ar: "نحن مدفوعون برسالة واضحة",
      en: "Driven by a clear mission",
    },
    icon: <Target size={26} />,
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useInViewOnce<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoalsSection({ lang = "ar" }: GoalsSectionProps) {
  const isAr = lang === "ar";
  const { ref, visible } = useInViewOnce<HTMLElement>(0.2);

  return (
    <section
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      className="goals-section"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Background dots */}
      <div className="goals-dots" aria-hidden="true" />

      {/* Soft glow */}
      <div className="goals-glow goals-glow-one" aria-hidden="true" />
      <div className="goals-glow goals-glow-two" aria-hidden="true" />

      <div className="goals-inner">
        {/* Heading */}
        <div
          className="goals-heading-wrap"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <h2 className="goals-heading">
            {isAr ? "القيم الجوهرية" : "Core Values"}
          </h2>

          <div className="goals-heading-accent" />
        </div>

        {/* Cards */}
        <div className="goals-grid">
          {GOALS.map((goal, index) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              lang={lang}
              index={index}
              visible={visible}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .goals-section {
          position: relative;
          overflow: hidden;
          background: #050F0A;
          color: #ffffff;
          padding: clamp(70px, 8vw, 120px) 0;
        }

        .goals-dots {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.04) 1px,
            transparent 1px
          );
          background-size: 30px 30px;
        }

        .goals-glow {
          position: absolute;
          z-index: 0;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(70px);
        }

        .goals-glow-one {
          width: 260px;
          height: 260px;
          top: 160px;
          right: 10%;
          background: rgba(0, 200, 150, 0.18);
        }

        .goals-glow-two {
          width: 300px;
          height: 300px;
          bottom: -140px;
          left: 8%;
          background: rgba(0, 80, 67, 0.45);
        }

        .goals-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(18px, 5vw, 64px);
        }

        .goals-heading-wrap {
          position: relative;
          width: fit-content;
          margin: 0 auto clamp(34px, 5vw, 56px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .goals-heading {
          position: relative;
          z-index: 2;
          margin: 0;
          font-size: clamp(34px, 5vw, 62px);
          font-weight: 950;
          line-height: 1.05;
          letter-spacing: -0.04em;
          color: #ffffff;
          text-align: center;
        }

        .goals-heading-accent {
          position: absolute;
          z-index: 1;
          right: -18px;
          bottom: 4px;
          width: 46%;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, #00c896, #35ce83);
          opacity: 0.9;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: clamp(14px, 2vw, 22px);
        }

        @media (max-width: 1100px) {
          .goals-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .goals-section {
            padding: 70px 0;
          }

          .goals-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .goals-heading-accent {
            right: 0;
            width: 52%;
            height: 9px;
          }
        }

        @media (max-width: 520px) {
          .goals-grid {
            grid-template-columns: 1fr;
          }

          .goals-inner {
            padding: 0 18px;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  lang,
  index,
  visible,
}: {
  goal: GoalItem;
  lang: Lang;
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isAr = lang === "ar";

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="goal-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? "translateY(-8px)"
            : "translateY(0)"
          : "translateY(28px)",
        transition: `opacity 0.65s ease ${index * 0.1}s, transform 0.35s ease ${
          index * 0.1
        }s, border-color 0.25s ease, background 0.25s ease`,
        background: "#ffffff",
        borderColor: hovered ? "rgba(0,200,150,0.55)" : "rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="goal-icon"
        style={{
          background: hovered ? "rgba(0,200,150,0.14)" : "rgba(0,80,67,0.08)",
          color: hovered ? "#008f6a" : "#00835f",
          transform: hovered ? "scale(1.08) rotate(-4deg)" : "scale(1)",
        }}
      >
        {goal.icon}
      </div>

      <h3 className="goal-title">{goal.title[lang]}</h3>

      <p
        className="goal-description"
        style={{
          textAlign: isAr ? "center" : "center",
        }}
      >
        {goal.description[lang]}
      </p>

      <style jsx>{`
        .goal-card {
          min-height: 190px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 18px;
          border-radius: 18px;
          border: 1px solid;
          color: #061b14;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
          cursor: default;
          position: relative;
          overflow: hidden;
        }

        .goal-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at top,
            rgba(0, 200, 150, 0.14),
            transparent 45%
          );
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .goal-card:hover::before {
          opacity: 1;
        }

        .goal-icon {
          position: relative;
          z-index: 1;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
          transition: transform 0.25s ease, background 0.25s ease,
            color 0.25s ease;
        }

        .goal-title {
          position: relative;
          z-index: 1;
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 900;
          color: #061b14;
          text-align: center;
        }

        .goal-description {
          position: relative;
          z-index: 1;
          margin: 0;
          max-width: 180px;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 600;
          color: rgba(6, 27, 20, 0.68);
        }

        @media (max-width: 760px) {
          .goal-card {
            min-height: 170px;
            padding: 24px 16px;
          }
        }
      `}</style>
    </article>
  );
}