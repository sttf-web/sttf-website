"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type PartnerLogo = {
  id: string;
  name: string;
  image: string;
};

type PartnersResponse = {
  success: boolean;
  partners: PartnerLogo[];
  error?: string;
};

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
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

function PartnersStrip({
  visible,
  partners,
}: {
  visible: boolean;
  partners: PartnerLogo[];
}) {
  return (
    <div className="flex flex-col gap-7 px-6 py-[52px] pb-[60px] md:px-[clamp(24px,5vw,80px)]">
      <p
        className={`
          m-0 text-right text-[35px] font-bold text-white
          transition-all duration-700 ease-out
          ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}
        `}
      >
        شركاؤنا الاستراتيجيون:
      </p>

      <div className="flex flex-wrap items-center justify-end gap-[clamp(24px,4vw,56px)]">
        {partners.map((partner: PartnerLogo, index: number) => (
          <div
            key={partner.id}
            className={`
              relative h-12 w-[clamp(60px,8vw,110px)] brightness-0 invert
              transition-all duration-700 ease-out
              ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}
            `}
            style={{
              transitionDelay: `${index * 80 + 100}ms`,
            }}
          >
            <Image
              src={partner.image}
              alt={partner.name}
              fill
              sizes="110px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationPanel({ visible }: { visible: boolean }) {
  return (
    <div className="grid min-h-[380px] grid-cols-1 items-center gap-[clamp(24px,4vw,64px)] px-6 py-[clamp(48px,6vw,80px)] md:grid-cols-2 md:px-[clamp(24px,5vw,80px)]">
      <div
        className={`
          relative h-[clamp(220px,28vw,380px)] w-full
          transition-all duration-700 ease-out
          ${visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
        `}
      >
        <Image
          src="/homePage/saudiLand.png"
          alt="خريطة المملكة العربية السعودية"
          fill
          sizes="(max-width: 768px) 90vw, 480px"
          className="object-contain object-right"
        />
      </div>

      <div
        className={`
          flex flex-col gap-4 text-right
          transition-all duration-700 ease-out delay-200
          ${visible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}
        `}
      >
        <h2 className="m-0 text-[clamp(28px,3.5vw,48px)] font-black leading-tight text-[#005043]">
          أين تجدنا ؟
        </h2>

        <p className="m-0 max-w-[360px] text-[clamp(14px,1.4vw,17px)] font-medium leading-[1.85] text-[#2a4a40]">
          أبحث عن صالة الاتحاد السعودي لكرة الطاولة و انشئ عضويتك الآن
        </p>

        <div>
          <Link
            href="/contact"
            className="mt-2 inline-block rounded-lg border-[1.5px] border-[#005043] px-6 py-2.5 text-sm font-bold text-[#005043] no-underline transition-colors duration-200 hover:bg-[#005043] hover:text-white"
          >
            أنقر هنا
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CredibilitySection() {
  const { ref, visible } = useInViewOnce<HTMLElement>(0.12);
  const [partners, setPartners] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const response = await fetch("/api/partners", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as PartnersResponse;

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch partners.");
        }

        setPartners(data.partners);
      } catch (error: unknown) {
        console.error("Failed to load partners:", error);
      }
    }

    fetchPartners();
  }, []);

  return (
    <section ref={ref} dir="rtl" className="relative overflow-hidden">
      <div className="relative overflow-hidden bg-[#050F0A]">
        <div className="relative z-[1] mx-auto max-w-7xl">
          <PartnersStrip visible={visible} partners={partners} />
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="mt-[-2px] block h-[clamp(60px,8vw,120px)] w-full"
        >
          <path
            d="M0,0 C400,120 1040,120 1440,0 L1440,120 H0 Z"
            fill="#BDE8DF"
          />
        </svg>
      </div>

      <div className="relative overflow-hidden bg-[linear-gradient(160deg,#c8ede6_0%,#9fd8cc_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,80,67,0.06)_1px,transparent_1px)] bg-[length:28px_28px]" />

        <div className="relative z-[1] mx-auto max-w-7xl">
          <LocationPanel visible={visible} />
        </div>

        <svg
          aria-hidden="true"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="block h-[clamp(60px,8vw,120px)] w-full"
        >
          <path
            d="M0,120 C400,0 1040,0 1440,120 L1440,120 H0 Z"
            fill="#000000"
          />
        </svg>
      </div>
    </section>
  );
}