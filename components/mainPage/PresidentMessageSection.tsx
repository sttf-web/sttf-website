"use client";

import Image from "next/image";

interface PresidentMessageSectionProps {
  imageSrc?: string;
}

export default function PresidentMessageSection({
  imageSrc = "/homePage/president.png",
}: PresidentMessageSectionProps) {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden bg-[#050f0a] px-0 py-16 text-white md:py-20 lg:py-[84px]"
    >
      {/* Top curved green band */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-[-1px] z-0 h-[100px] w-full opacity-95 sm:h-[120px] lg:h-[140px]"
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
        className="pointer-events-none absolute bottom-[-1px] left-0 z-0 h-[100px] w-full opacity-95 sm:h-[120px] lg:h-[140px]"
      >
        <path
          d="M0,160 C760,240 1100,220 1440,150 V240 H0 Z"
          fill="#005043"
        />
      </svg>

      {/* Background star motif */}
      <div className="pointer-events-none absolute right-[6%] top-1/2 z-0 h-[320px] w-[320px] -translate-y-1/2 opacity-20 drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)] sm:h-[420px] sm:w-[420px] lg:h-[520px] lg:w-[520px] lg:opacity-25">
        <Image
          src="/homePage/star.png"
          alt=""
          fill
          sizes="520px"
          className="object-contain"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-9 px-5 md:px-12 lg:grid-cols-[460px_1fr] lg:gap-16">
        {/* Photo side */}
        <div className="flex items-center justify-center">
          <div className="relative h-[380px] w-full max-w-[320px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-[420px] sm:max-w-[360px]">
            <Image
              src={imageSrc}
              alt="صورة رئيس الاتحاد"
              fill
              sizes="(max-width: 900px) 280px, 360px"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/25" />
          </div>
        </div>

        {/* Copy side */}
        <div className="mx-auto max-w-[620px] text-center lg:mx-0 lg:text-right">
          <h2 className="mb-5 text-[clamp(26px,3.5vw,40px)] font-black leading-[1.15]">
            <span className="text-white/85">هدفنا أن </span>
            <span className="text-[#00e0aa]">← </span>
            <span className="text-[#00e0aa]">نقود كرة الطاولة <br/></span>
            <span className="inline-block rounded-sm border-b-4 border-[#00e0aa]/65 pb-1.5 text-[#00e0aa]">
              عالميًا
            </span>
          </h2>

          <div className="text-2xl font-medium leading-[1.9] text-white/75">
            <p className="mb-1.5">رئيس الاتحاد السعودي لكرة الطاولة</p>
            <p className="mb-1.5">صاحب السمو الملكي</p>
            <p className="mb-1.5">
              الأمير محمد بن عبدالرحمن بن ناصر آل سعود
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}