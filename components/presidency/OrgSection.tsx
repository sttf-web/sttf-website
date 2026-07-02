"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface OrgMember {
  id: number;
  name: string;
  role: string;
  image: string;
  featured?: boolean;
}

const MEMBERS: OrgMember[] = [
  {
    id: 1,
    featured: true,
    image: "/presidency/profile1.png",
    name: "صاحب السمو الملكي الأمير محمد بن عبدالرحمن بن ناصر آل سعود",
    role: "رئيس الاتحاد",
  },
  {
    id: 2,
    image: "/presidency/profile2.png",
    name: "أحمد بن علي آل محمد",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 3,
    image: "/presidency/profile3.png",
    name: "عبدالله بن فهد المغيرة",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 4,
    image: "/presidency/profile4.png",
    name: "نورة فهاد العليان",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 5,
    image: "/presidency/profile5.png",
    name: "ايثار فهد البلطان",
    role: "نائب رئيس مجلس الادارة",
  },
  {
    id: 6,
    image: "/presidency/profile6.png",
    name: "عبدالعزيز رائد اباالخيل",
    role: "المدير التنفيذي",
  },
  {
    id: 7,
    image: "/presidency/profile7.png",
    name: "وائل بن سعيد القو",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 8,
    image: "/presidency/profile8.png",
    name: "محمد بن ناصر مهاوش ",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 9,
    image: "/presidency/profile9.png",
    name: "حسن الزهراني",
    role: "عضو مجلس الإدارة",
  },
  {
    id: 10,
    image: "/presidency/profile10.png",
    name: "صاحب السمو الملكي الامير سعود بن سلطان آل سعود",
    role: "عضو مجلس الإدارة",
  },
];

function useInViewOnce<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
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

export default function OrgSection() {
  const { ref, visible } = useInViewOnce<HTMLElement>();

  const featuredMember = MEMBERS.find(
    (member: OrgMember) => member.featured === true
  );

  const regularMembers = MEMBERS.filter(
    (member: OrgMember) => member.featured !== true
  );

  return (
    <section
      ref={ref}
      dir="rtl"
      className="relative overflow-hidden bg-black py-[clamp(72px,8vw,120px)] text-white"
    >
      {/* Subtle dot grid */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[length:30px_30px]" />

      {/* Green glows */}
      <div className="pointer-events-none absolute left-[8%] top-[-180px] z-0 h-[300px] w-[300px] rounded-full bg-[#005043]/45 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[8%] z-0 h-[340px] w-[340px] rounded-full bg-[#005043]/40 blur-[80px]" />

      <div className="relative z-[1] mx-auto max-w-7xl px-[clamp(18px,5vw,64px)]">
        {/* Heading */}
        <div
          className={`
            mx-auto mb-[clamp(32px,5vw,54px)] w-fit text-center
            transition-all duration-700 ease-out
            ${visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}
          `}
        >
          <h2 className="m-0 text-[clamp(34px,5vw,58px)] font-black leading-[1.1] tracking-[-0.04em] text-white">
            أعضاء مجلس الإدارة
          </h2>

          <div className="mt-2.5 flex justify-center gap-1 sm:gap-1.5">
            {Array.from({ length: 18 }).map((_: unknown, index: number) => (
              <span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-[#35ce83] shadow-[0_0_14px_rgba(53,206,131,0.7)] sm:h-[7px] sm:w-[7px]"
              />
            ))}
          </div>
        </div>

        {featuredMember && (
          <div className="mb-[clamp(32px,5vw,54px)] flex justify-center">
            <OrgCard
              member={featuredMember}
              visible={visible}
              index={0}
              featured
            />
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 min-[520px]:grid-cols-2 min-[820px]:gap-7 min-[1100px]:grid-cols-4 min-[820px]:grid-cols-3 xl:gap-[clamp(24px,4vw,54px)]">
          {regularMembers.map((member: OrgMember, index: number) => (
            <OrgCard
              key={member.id}
              member={member}
              visible={visible}
              index={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function OrgCard({
  member,
  index,
  visible,
  featured = false,
}: {
  member: OrgMember;
  index: number;
  visible: boolean;
  featured?: boolean;
}) {
  return (
    <article
      className={`
        group relative isolate mx-auto w-full overflow-hidden
        border-[1.5px] border-[#35ce83]/70
        bg-[linear-gradient(180deg,#020705_0%,#030d09_100%)]
        shadow-[0_24px_60px_rgba(0,0,0,0.52)]
        transition-all duration-500 ease-out
        hover:border-[#35ce83] hover:shadow-[0_28px_70px_rgba(0,200,150,0.18),0_0_0_1px_rgba(53,206,131,0.25)]
        ${
          featured
            ? "min-h-[350px] max-w-[285px] rounded-xl sm:min-h-[365px] sm:max-w-[320px]"
            : "min-h-[330px] max-w-[260px] rounded-[10px] sm:min-h-[300px] sm:max-w-[230px]"
        }
        ${
          visible
            ? "translate-y-0 scale-100 opacity-100 hover:-translate-y-2 hover:scale-[1.015]"
            : "translate-y-8 scale-[0.96] opacity-0"
        }
      `}
      style={{
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {/* Star background */}
      <div
        aria-hidden="true"
        className={`
          absolute z-0 opacity-45
          ${featured ? "inset-4 opacity-50" : "inset-3"}
        `}
      >
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes={featured ? "320px" : "220px"}
          className="object-contain object-center drop-shadow-[0_0_20px_rgba(0,200,150,0.16)]"
        />
      </div>

      {/* Grid lines */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 z-[1] opacity-50
          [background:linear-gradient(rgba(0,200,150,0.28),rgba(0,200,150,0.28))_center_44%/100%_1px_no-repeat,linear-gradient(rgba(0,200,150,0.25),rgba(0,200,150,0.25))_center_58%/100%_1px_no-repeat,linear-gradient(90deg,rgba(0,200,150,0.22),rgba(0,200,150,0.22))_center/1px_100%_no-repeat]
        "
      />

      {/* Person image */}
      <div
        className={`
          absolute left-1/2 z-[2] -translate-x-1/2
          ${featured ? "bottom-[68px] h-[78%] w-[90%]" : "bottom-[58px] h-[78%] w-[88%]"}
        `}
      >
        <Image
          src={member.image}
          alt={member.name}
          fill
          priority={featured}
          sizes={
            featured
              ? "(max-width: 520px) 260px, 340px"
              : "(max-width: 520px) 240px, 260px"
          }
          className="object-contain object-bottom drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Copy */}
      <div className="absolute inset-x-0 bottom-0 z-[4] bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.75)_20%,rgba(0,0,0,0.95)_100%)] px-3 pb-4 pt-3.5 text-center">
        <h3
          className={`
            mb-1 text-center font-black leading-[1.35] text-white
            ${featured ? "text-[13px] sm:text-sm" : "text-[12.5px] sm:text-xs"}
          `}
        >
          {member.name}
        </h3>

        <p
          className={`
            m-0 text-center font-semibold leading-[1.4] text-white/70
            ${featured ? "text-[10px]" : "text-[10px] sm:text-[9px]"}
          `}
        >
          {member.role}
        </p>
      </div>
    </article>
  );
}