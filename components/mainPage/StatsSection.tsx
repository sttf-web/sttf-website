"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface StatItem {
  id: string;
  value: number;
  prefix?: string;
  label: string;
  icon: "players" | "growth";
}

interface StatsSectionProps {
  players?: number;
  clubs?: number;
}

const DEFAULTS = {
  players: 4733,
  clubs: 186,
} as const;

function getStatItems(players: number, clubs: number): StatItem[] {
  return [
    {
      id: "players",
      value: players,
      prefix: "+",
      label: "لاعب ولاعبة",
      icon: "players",
    },
    {
      id: "clubs",
      value: clubs,
      prefix: "+",
      label: "نادٍ مسجل",
      icon: "growth",
    },
  ];
}

function useInViewOnce<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        const firstEntry = entries[0];

        if (firstEntry?.isIntersecting) {
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

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setValue(Math.round(target * easedProgress));

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [target, enabled, durationMs]);

  return value;
}

function PlayersIcon() {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="34" cy="22" r="12" fill="#00c896" opacity="0.98" />
      <path
        d="M14 56c0-10.5 8.5-19 19-19h2c10.5 0 19 8.5 19 19v2H14v-2z"
        fill="#00c896"
        opacity="0.98"
      />
    </svg>
  );
}

function GrowthBarsIcon() {
  const bars = [0, 12, 16, 18, 22, 20, 26, 30, 34, 40, 48];

  return (
    <svg
      width="90"
      height="70"
      viewBox="0 0 96 64"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {bars.map((height: number, index: number) => {
        const width = 5;
        const gap = 2;
        const x = 6 + index * (width + gap);
        const y = 56 - height;

        return (
          <rect
            key={`${height}-${index}`}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={1.5}
            fill="#00c896"
            opacity={0.55 + index * 0.04}
          />
        );
      })}
    </svg>
  );
}

export default function StatsSection({
  players = DEFAULTS.players,
  clubs = DEFAULTS.clubs,
}: StatsSectionProps) {
  const items = useMemo(() => getStatItems(players, clubs), [players, clubs]);
  const { ref, inView } = useInViewOnce<HTMLElement>(0.22);

  return (
    <section
      ref={ref}
      dir="rtl"
      className="relative overflow-hidden bg-black py-[120px] text-white md:py-[130px] lg:py-[120px_140px]"
    >
      {/* Top curve */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-0 top-[-1px] z-0 h-[140px] w-full md:h-[170px]"
      >
        <path d="M0,0 H1440 V80 C1100,20 760,20 0,90 Z" fill="#005043" />
      </svg>

      {/* Bottom curve desktop */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[-2px] left-0 z-0 hidden h-[160px] w-full md:block"
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

      {/* Bottom curve mobile */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[-2px] left-0 z-0 h-[clamp(130px,18vw,180px)] w-full md:hidden"
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
      <div className="pointer-events-none absolute inset-0 z-0 opacity-65 [background-image:radial-gradient(circle,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-12">
        <div className="grid grid-cols-1 items-center gap-9 text-center md:grid-cols-2 md:gap-16">
          {items.map((item: StatItem) => (
            <StatBlock key={item.id} item={item} animate={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatBlock({
  item,
  animate,
}: {
  item: StatItem;
  animate: boolean;
}) {
  const value = useCountUp(item.value, animate, 1100);

return (
  <div
    className={`
      mt-5 mb-10 flex items-end justify-center gap-8 md:gap-10
      transition-all duration-700 ease-out
      ${animate ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
    `}
  >
    {/* Icon */}
    <div className="flex scale-125 items-end pb-5 md:scale-230">
      {item.icon === "players" ? <PlayersIcon /> : <GrowthBarsIcon />}
    </div>

    {/* Text */}
    <div className="min-w-0 text-right">
      <div className="flex items-baseline justify-end">
        <span
          dir="ltr"
          className="whitespace-nowrap text-[clamp(52px,6vw,88px)] font-black leading-none tracking-[-1.5px]"
        >
          {item.prefix}
          {value.toLocaleString("ar-SA")}
        </span>
      </div>

      <div className="mt-3 whitespace-nowrap text-[clamp(18px,2.2vw,28px)] font-medium leading-none text-white/85">
        {item.label}
      </div>
    </div>
  </div>
);
}