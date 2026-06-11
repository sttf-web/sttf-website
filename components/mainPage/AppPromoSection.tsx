"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Lang = "ar" | "en";

interface AppPromoSectionProps {
  lang?: Lang;
  appImageSrc?: string;
}

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

function StarBlock() {
  return (
    <div
      aria-hidden="true"
      className="
        relative mb-10 h-[260px] w-full max-w-[520px] overflow-hidden
        sm:h-[320px]
        lg:mb-12 lg:h-[380px]
      "
    >
      {/* Star */}
      <div className="absolute left-1/2 top-0 h-[360px] w-[360px] -translate-x-1/2 sm:h-[430px] sm:w-[430px] lg:h-[370px] lg:w-[370px]">
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes="520px"
          className="object-contain opacity-70"
        />
      </div>

      {/* Green bar over the star */}
      <div
        className="
          absolute bottom-0 left-1/2 h-[48%] w-[120%] -translate-x-1/2
          bg-[#003f2a]/50
        "
      />
    </div>
  );
}

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
      className="relative overflow-hidden bg-[#050f0a] py-16 text-white sm:py-20 lg:py-[100px]"
      style={{
        fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
      }}
    >
      <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12">
        {/* Image on the right */}
        <div
          className="order-1 flex items-end justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 0.8s ease 0s, transform 0.8s ease 0s",
          }}
        >
          <div className="relative h-[min(105vw,390px)] w-[min(82vw,300px)] drop-shadow-[0_20px_80px_rgba(0,200,150,0.18)] sm:h-[min(72vw,430px)] sm:w-[min(56vw,340px)] lg:h-[clamp(320px,40vw,580px)] lg:w-[clamp(260px,32vw,460px)]">
            <Image
              src={appImageSrc}
              alt={isAr ? "تطبيق STTF" : "STTF App"}
              fill
              sizes="(max-width: 520px) 82vw, (max-width: 900px) 56vw, 460px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Text on the left */}
        <div
          className="order-2 flex flex-col items-center text-center lg:items-start lg:text-start"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateX(0)"
              : `translateX(${isAr ? -40 : 40}px)`,
            transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          }}
        >
          <StarBlock />

          <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <span className="text-4xl leading-none text-white md:text-5xl">
              {isAr ? "→" : "→"}
            </span>

            <div className="rounded-lg border border-white/15 bg-white/20 px-6 py-1.5 font-sans text-xl font-black tracking-[1px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
              {t.appTag}
            </div>

            <span className="text-xl font-black text-[#00d984] md:text-2xl">
              {t.preLabel}
            </span>
          </div>

          <h2 className="mt-5 max-w-[540px] text-[clamp(24px,7vw,36px)] font-black leading-[1.35] text-white md:text-[clamp(28px,3vw,44px)]">
            {t.headline}
          </h2>
        </div>
      </div>
    </section>
  );
}