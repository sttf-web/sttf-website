"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface PromoSectionProps {
  playerImageSrc?: string;
}

const TEXT_ROWS = [
  {
    src: "/homePage/promo-text-iltizam.png",
    alt: "التزام",
  },
  {
    src: "/homePage/promo-text-nahw.png",
    alt: "نحو",
  },
  {
    src: "/homePage/promo-text-injaz.png",
    alt: "الإنجاز",
  },
] as const;

export default function PromoSection({
  playerImageSrc = "/homePage/player.png",
}: PromoSectionProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimateIn(true), 120);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section
      dir="rtl"
      aria-label="التزام نحو الإنجاز"
      className="relative w-full overflow-hidden bg-black"
    >
      <div className="relative min-h-[540px] w-full overflow-hidden bg-gradient-to-br from-[#3dd68c] via-[#35ce83] to-[#35ce83] pb-[220px] sm:min-h-[620px] sm:pb-[250px] md:min-h-[810px] md:pb-[clamp(120px,18vw,200px)] md:[clip-path:polygon(16%_0%,100%_0%,100%_100%,0%_100%,0%_18%)]">
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:28px_28px]" />

        {/* Text image rows */}
        <div className="relative z-[2] flex w-full flex-col items-center gap-1.5 px-0 pt-[30px] sm:gap-2 sm:pt-9 md:gap-[clamp(8px,1.5vw,18px)] md:px-[clamp(16px,3vw,40px)] md:pt-[clamp(48px,8vw,96px)]">
          {TEXT_ROWS.map((row, index: number) => (
            <div
              key={row.src}
              className={`
                flex w-full justify-center transition-all duration-700 ease-out
                ${animateIn ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
              `}
              style={{
                transitionDelay: `${index * 140}ms`,
              }}
            >
              <Image
                src={row.src}
                alt={row.alt}
                width={1400}
                height={120}
                priority={index === 0}
                className="block h-auto w-full md:w-[min(100%,1400px)]"
              />
            </div>
          ))}
        </div>

      {/* Bottom black arc */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[-6px] left-0 z-[5] block h-[105px] w-full sm:h-[125px] md:h-[calc(clamp(120px,18vw,210px)+8px)]"
      >
        <path
          d="M0,320 C200,120 520,60 720,60 C940,60 1240,130 1440,320 H0 Z"
          fill="#050f0a"
        />
      </svg>
              
      {/* Player image */}
      <div className="absolute bottom-6 left-1/2 z-[4] h-[min(100vw,390px)] w-[min(90vw,320px)] -translate-x-1/2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)] sm:bottom-[34px] sm:h-[min(95vw,430px)] sm:w-[min(88vw,360px)] md:bottom-[clamp(40px,8vw,130px)] md:h-[clamp(280px,46vw,640px)] md:w-[clamp(240px,36vw,520px)]">
        <Image
          src={playerImageSrc}
          alt="لاعب"
          fill
          priority
          sizes="(max-width: 480px) 94vw, (max-width: 768px) 88vw, (max-width: 1024px) 55vw, 520px"
          className="object-contain object-bottom"
        />
      </div>
      </div>
    </section>
  );
}