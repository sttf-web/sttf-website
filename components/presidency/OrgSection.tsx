"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Lang = "ar" | "en";

interface OrgSectionProps {
  lang?: Lang;
}

interface OrgMember {
  id: number;
  name: {
    ar: string;
    en: string;
  };
  role: {
    ar: string;
    en: string;
  };
  image: string;
  featured?: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const MEMBERS: OrgMember[] = [
  {
    id: 1,
    featured: true,
    image: "/presidency/profile1.png",
    name: {
      ar: "صاحب السمو الملكي الأمير محمد بن عبدالرحمن بن ناصر آل سعود",
      en: "HRH Prince Mohammed bin Abdulrahman bin Nasser Al Saud",
    },
    role: {
      ar: "رئيس الاتحاد",
      en: "President",
    },
  },
  {
    id: 2,
    image: "/presidency/profile2.png",
    name: {
      ar: "أحمد بن علي آل محمد",
      en: "Ahmed bin Ali Al Mohammed",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 3,
    image: "/presidency/profile3.png",
    name: {
      ar: "عبدالله بن فهد المغيرة",
      en: "Abdullah bin Fahad Al Mughirah",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 4,
    image: "/presidency/profile4.png",
    name: {
      ar: "نورة فؤاد العليان",
      en: "Noura Fouad Al Olayan",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 5,
    image: "/presidency/profile5.png",
    name: {
      ar: "أليناه فهد المطلقان",
      en: "Alenah Fahad Al Mutlaqan",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 6,
    image: "/presidency/profile6.png",
    name: {
      ar: "عبدالعزيز راشد الدخيل",
      en: "Abdulaziz Rashed Al Dakheel",
    },
    role: {
      ar: "المدير التنفيذي",
      en: "Executive Director",
    },
  },
  {
    id: 7,
    image: "/presidency/profile7.png",
    name: {
      ar: "وائل بن عبدالله التو",
      en: "Wael bin Abdullah Alto",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 8,
    image: "/presidency/profile8.png",
    name: {
      ar: "محمد بن ناصر مهناش",
      en: "Mohammed bin Nasser Mihnash",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
  {
    id: 9,
    image: "/presidency/profile9.png",
    name: {
      ar: "حسن الزهراني",
      en: "Hassan Al Zahrani",
    },
    role: {
      ar: "عضو مجلس الإدارة",
      en: "Board Member",
    },
  },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useInViewOnce<T extends HTMLElement>(threshold = 0.18) {
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

export default function OrgSection({ lang = "ar" }: OrgSectionProps) {
  const isAr = lang === "ar";
  const { ref, visible } = useInViewOnce<HTMLElement>();

  const featuredMember = MEMBERS.find((member) => member.featured);
  const regularMembers = MEMBERS.filter((member) => !member.featured);

  return (
    <section
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      className="org-section"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <div className="org-dots" aria-hidden="true" />
      <div className="org-glow org-glow-one" aria-hidden="true" />
      <div className="org-glow org-glow-two" aria-hidden="true" />

      <div className="org-inner">
        <div
          className="org-heading-wrap"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <h2 className="org-heading">
            {isAr ? "أعضاء مجلس الإدارة" : "Board Members"}
          </h2>

          <div className="org-heading-dots" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>

        {featuredMember && (
          <div className="org-featured-wrap">
            <OrgCard
              member={featuredMember}
              lang={lang}
              visible={visible}
              index={0}
              featured
            />
          </div>
        )}

        <div className="org-grid">
          {regularMembers.map((member, index) => (
            <OrgCard
              key={member.id}
              member={member}
              lang={lang}
              visible={visible}
              index={index + 1}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .org-section {
          position: relative;
          overflow: hidden;
          background: #050F0A;
          color: #ffffff;
          padding: clamp(72px, 8vw, 120px) 0;
        }

        .org-dots {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.035) 1px,
            transparent 1px
          );
          background-size: 30px 30px;
        }

        .org-glow {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(80px);
        }

        .org-glow-one {
          width: 300px;
          height: 300px;
          top: -180px;
          left: 8%;
          background: rgba(0, 80, 67, 0.45);
        }

        .org-glow-two {
          width: 340px;
          height: 340px;
          bottom: -180px;
          left: 8%;
          background: rgba(0, 80, 67, 0.42);
        }

        .org-inner {
          position: relative;
          z-index: 1;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 clamp(18px, 5vw, 64px);
        }

        .org-heading-wrap {
          width: fit-content;
          margin: 0 auto clamp(32px, 5vw, 54px);
          text-align: center;
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .org-heading {
          margin: 0;
          font-size: clamp(34px, 5vw, 58px);
          font-weight: 950;
          line-height: 1.1;
          color: #ffffff;
          letter-spacing: -0.04em;
        }

        .org-heading-dots {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .org-heading-dots span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #35ce83;
          box-shadow: 0 0 14px rgba(53, 206, 131, 0.7);
        }

        .org-featured-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: clamp(32px, 5vw, 54px);
        }

        .org-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: clamp(24px, 4vw, 54px);
          align-items: start;
        }

        @media (max-width: 1100px) {
          .org-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .org-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 28px;
          }
        }

        @media (max-width: 520px) {
          .org-section {
            padding: 70px 0;
          }

          .org-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .org-heading-dots {
            gap: 4px;
          }

          .org-heading-dots span {
            width: 5px;
            height: 5px;
          }
        }
      `}</style>
    </section>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function OrgCard({
  member,
  lang,
  index,
  visible,
  featured = false,
}: {
  member: OrgMember;
  lang: Lang;
  index: number;
  visible: boolean;
  featured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isAr = lang === "ar";

  return (
    <article
      className={`org-card ${featured ? "org-card-featured" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? "translateY(-8px) scale(1.015)"
            : "translateY(0) scale(1)"
          : "translateY(32px) scale(0.96)",
        transition: `opacity 0.65s ease ${index * 0.08}s, transform 0.38s ease ${
          index * 0.08
        }s, border-color 0.25s ease, box-shadow 0.25s ease`,
        borderColor: hovered ? "rgba(53, 206, 131, 0.95)" : "rgba(53, 206, 131, 0.72)",
        boxShadow: hovered
          ? "0 28px 70px rgba(0, 200, 150, 0.18), 0 0 0 1px rgba(53,206,131,0.25)"
          : "0 24px 60px rgba(0,0,0,0.52)",
      }}
    >
      <div className="org-card-star" aria-hidden="true">
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes={featured ? "320px" : "220px"}
          className="org-card-star-image"
        />
      </div>

      <div className="org-card-grid-lines" aria-hidden="true" />

      <div className="org-person-wrap">
        <Image
          src={member.image}
          alt={member.name[lang]}
          fill
          priority={featured}
          sizes={
            featured
              ? "(max-width: 520px) 260px, 340px"
              : "(max-width: 520px) 240px, 260px"
          }
          className="org-person-image"
        />
      </div>

      <div className="org-card-copy">
        <h3 className="org-card-name">{member.name[lang]}</h3>
        <p className="org-card-role">{member.role[lang]}</p>
      </div>

      <style jsx>{`
        .org-card {
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 230px;
          min-height: 300px;
          margin: 0 auto;
          border: 1.5px solid;
          border-radius: 10px;
          background: linear-gradient(180deg, #020705 0%, #030d09 100%);
          isolation: isolate;
        }

        .org-card-featured {
          max-width: 320px;
          min-height: 365px;
          border-radius: 12px;
        }

        .org-card-star {
          position: absolute;
          inset: 12px;
          z-index: 0;
          opacity: 0.45;
        }

        .org-card-featured .org-card-star {
          inset: 16px;
          opacity: 0.48;
        }

        .org-card-star-image {
          object-fit: contain;
          object-position: center;
          filter: drop-shadow(0 0 20px rgba(0, 200, 150, 0.16));
        }

        .org-card-grid-lines {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.5;
          background:
            linear-gradient(rgba(0, 200, 150, 0.28), rgba(0, 200, 150, 0.28))
              center 44% / 100% 1px no-repeat,
            linear-gradient(rgba(0, 200, 150, 0.25), rgba(0, 200, 150, 0.25))
              center 58% / 100% 1px no-repeat,
            linear-gradient(90deg, rgba(0, 200, 150, 0.22), rgba(0, 200, 150, 0.22))
              center / 1px 100% no-repeat;
        }

        .org-person-wrap {
          position: absolute;
          left: 50%;
          bottom: 58px;
          z-index: 2;
          width: 88%;
          height: 78%;
          transform: translateX(-50%);
        }

        .org-card-featured .org-person-wrap {
          bottom: 68px;
          width: 90%;
          height: 78%;
        }

        .org-person-image {
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.5));
        }

        .org-card-copy {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 4;
          padding: 14px 12px 16px;
          text-align: center;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.75) 20%,
            rgba(0, 0, 0, 0.95) 100%
          );
        }

        .org-card-name {
          margin: 0 0 4px;
          font-size: ${featured ? "14px" : "12px"};
          line-height: 1.35;
          font-weight: 900;
          color: #ffffff;
          text-align: center;
          direction: ${isAr ? "rtl" : "ltr"};
        }

        .org-card-role {
          margin: 0;
          font-size: ${featured ? "10px" : "9px"};
          line-height: 1.4;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.72);
          text-align: center;
        }

        @media (max-width: 520px) {
          .org-card {
            max-width: 260px;
            min-height: 330px;
          }

          .org-card-featured {
            max-width: 285px;
            min-height: 350px;
          }

          .org-card-name {
            font-size: ${featured ? "13px" : "12.5px"};
          }

          .org-card-role {
            font-size: 10px;
          }
        }
      `}</style>
    </article>
  );
}