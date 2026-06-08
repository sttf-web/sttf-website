"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PARTICLE_COUNT = 90;

const COLLAGE_IMAGE_SRC = "/homePage/table-tennis-collage.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createParticle(w: number, h: number): Particle {
  const maxLife = 0.4 + Math.random() * 0.5;
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 2.2 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3 - 0.15,
    life: Math.random() * maxLife,
    maxLife,
  };
}

function resetParticle(_p: Particle, w: number, h: number): Particle {
  return createParticle(w, h);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const init = () => {
      resize();
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.map((p) => {
        const next = { ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life + 0.002 };
        if (next.life > next.maxLife) return resetParticle(next, canvas.width, canvas.height);

        const alpha = Math.sin((next.life / next.maxLife) * Math.PI) * 0.55;
        ctx.beginPath();
        ctx.arc(next.x, next.y, next.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,150,${alpha})`;
        ctx.fill();

        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    init();
    tick();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DiamondCollage — renders the collage image clipped into a diamond shape
// with the star badge and glow orbs overlaid on top.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

function DiamondStar() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        width: 86,
        height: 86,
        background: "#ffffff",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 0 0 12px rgba(255,255,255,0.12), 0 0 0 24px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)",
        animation: "starPulse 3s ease-in-out infinite",
      }}
    >
      <svg width={44} height={44} viewBox="0 0 44 44" fill="none">
        <g transform="translate(22,22)">
          <rect x={-3} y={-20} width={6} height={40} rx={3} fill="#002b23" />
          <rect x={-3} y={-20} width={6} height={40} rx={3} fill="#002b23" transform="rotate(60)" />
          <rect x={-3} y={-20} width={6} height={40} rx={3} fill="#002b23" transform="rotate(120)" />
        </g>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// Glow orb positions around the diamond
const GLOW_ORBS = [
  { size: 220, top: -60,        right: -60,       left: undefined, bottom: undefined, delay: "0s" },
  { size: 160, bottom: 10,      left: -40,         top: undefined,  right: undefined, delay: "2s" },
  { size: 100, top: 40,         left: -20,         bottom: undefined, right: undefined, delay: "4s" },
] as const;

function DiamondCollage() {
  return (
    <div style={{ position: "relative", width: 520, height: 520 }}>

      {/* Ambient glow orbs */}
      {GLOW_ORBS.map((orb, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            top: orb.top ?? undefined,
            bottom: orb.bottom ?? undefined,
            left: orb.left ?? undefined,
            right: orb.right ?? undefined,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,200,150,0.16) 0%, transparent 70%)",
            animation: "orbFloat 6s ease-in-out infinite",
            animationDelay: orb.delay,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Diamond clip wrapper — rotated 45° then clipped */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "rotate(45deg) scale(0.72)",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 0 0 3px rgba(0,200,150,0.25), 0 40px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Collage image — counter-rotated so it appears upright */}
        <div
          style={{
            position: "absolute",
            inset: "-40%",
            transform: "rotate(-45deg)",
          }}
        >
          <Image
            src={COLLAGE_IMAGE_SRC}
            alt="Saudi table tennis players collage"
            fill
            priority
            sizes="(max-width: 900px) 340px, 520px"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        {/* Subtle depth vignette inside diamond */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(0,10,8,0.25) 0%, transparent 50%, rgba(0,10,8,0.2) 100%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* Center asterisk star badge */}
      <DiamondStar />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ScrollChevrons() {
  const handleScroll = () => {
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleScroll}
      aria-label="Scroll down"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        padding: 0,
      }}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            width: 28,
            height: 16,
            position: "relative",
            animation: "chevronBounce 1.8s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
            marginTop: i > 0 ? -6 : 0,
          }}
        >
          {/* Left arm */}
          <span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 16,
              height: 2.5,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 2,
              transform: "rotate(40deg)",
              transformOrigin: "left center",
              display: "block",
            }}
          />
          {/* Right arm */}
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 16,
              height: 2.5,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 2,
              transform: "rotate(-40deg)",
              transformOrigin: "right center",
              display: "block",
            }}
          />
        </div>
      ))}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function HeroContent({ lang }: { lang: "ar" | "en" }) {
  const isAr = lang === "ar";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        padding: "40px 0",
      }}
    >
      {/* Federation name */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: "clamp(38px, 5vw, 60px)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: -0.5,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          {isAr ? (
            <>
              الاتحاد السعودي
              <br />
              لكـرة الطـاولة
            </>
          ) : (
            <>
              Saudi Table
              <br />
              Tennis Federation
            </>
          )}
        </h1>
        {isAr && (
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            SAUDI TABLE TENNIS FEDERATION
          </p>
        )}
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 800,
          marginBottom: 36,
          lineHeight: 1.3,
          background: "linear-gradient(90deg, #ffffff 0%, #00e0aa 60%, #ffffff 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
        }}
      >
        {isAr ? "نحن نصنع الأبطال.." : "We Create Champions.."}
      </p>

      {/* CTA */}
      <a
        href="#"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 32px",
          borderRadius: 50,
          border: "1.5px solid rgba(255,255,255,0.45)",
          background: "transparent",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          width: "fit-content",
          marginBottom: 48,
          textDecoration: "none",
          transition: "border-color .3s, transform .2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "#00e0aa";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.45)";
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
        }}
      >
        {isAr ? "انضم للأبطال" : "Join the Champions"}
      </a>

      <ScrollChevrons />
    </div>
  );
}

// ─── Keyframes injected once ──────────────────────────────────────────────────

function GlobalKeyframes() {
  return (
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% center; }
        100% { background-position: -200% center; }
      }
      @keyframes starPulse {
        0%, 100% { box-shadow: 0 0 0 12px rgba(255,255,255,0.12), 0 0 0 24px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5); }
        50%       { box-shadow: 0 0 0 16px rgba(255,255,255,0.16), 0 0 0 32px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5); }
      }
      @keyframes orbFloat {
        0%, 100% { transform: translateY(0) scale(1); }
        50%       { transform: translateY(-18px) scale(1.05); }
      }
      @keyframes chevronBounce {
        0%, 100% { opacity: .5; transform: translateY(0); }
        50%       { opacity: 1;  transform: translateY(5px); }
      }

      @keyframes bgPulse {
        0%   { filter: brightness(1); }
        100% { filter: brightness(1.1); }
      }

      .hero-main-grid {
        position: relative;
        z-index: 3;
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 48px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        gap: 48px;
        min-height: 100vh;
      }

      .hero-visual-wrap {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 600px;
      }

      .hero-main-image {
        position: relative;
        width: min(100%, 620px);
        height: min(52vw, 620px);
        min-height: 440px;
      }

      @media (max-width: 1024px) {
        .hero-main-grid {
          grid-template-columns: 1fr;
          gap: 24px;
          padding: 120px 32px 80px;
          min-height: auto;
          text-align: center;
        }

        .hero-main-grid > div:first-child {
          align-items: center;
        }

        .hero-visual-wrap {
          min-height: auto;
          order: 2;
        }

        .hero-main-image {
          width: min(82vw, 560px);
          height: min(82vw, 560px);
          min-height: 340px;
        }
      }

      @media (max-width: 680px) {
        .hero-main-grid {
          padding: 110px 20px 90px;
          gap: 12px;
        }

        .hero-main-image {
          width: min(96vw, 420px);
          height: min(96vw, 420px);
          min-height: 300px;
        }
      }

      @media (max-width: 520px) {
        .hero-main-grid {
          padding: 96px 18px 82px;
        }

        .hero-main-image,
        .hero-visual-wrap {
          display: none;
        }
      }
    `}</style>
  );
}
// ─── Main Component ───────────────────────────────────────────────────────────

interface HeroSectionProps {
  lang?: "ar" | "en";
}

export default function HeroSection({ lang = "ar" }: HeroSectionProps) {
  const isAr = lang === "ar";
  const visualRef = useRef<HTMLDivElement>(null);

  // Subtle parallax on mouse move
  useEffect(() => {
    if (window.innerWidth <= 1024) return;
    const section = document.getElementById("hero-section");
    if (!section || !visualRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      if (visualRef.current) {
        visualRef.current.style.transform = `translate(${dx * -12}px, ${dy * -8}px)`;
        visualRef.current.style.transition = "transform 0.1s ease";
      }
    };

    const handleMouseLeave = () => {
      if (visualRef.current) {
        visualRef.current.style.transform = "translate(0, 0)";
        visualRef.current.style.transition = "transform 0.6s ease";
      }
    };

    section.addEventListener("mousemove", handleMouseMove);
    section.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      <GlobalKeyframes />

      <section
        id="hero-section"
        dir={isAr ? "rtl" : "ltr"}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background: "#001a12",
          fontFamily: isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif",
        }}
      >
        {/* ── Background layers ── */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 20% 50%, rgba(0,80,67,0.55) 0%, transparent 70%),
              radial-gradient(ellipse 60% 80% at 80% 20%, rgba(0,40,30,0.8) 0%, transparent 65%),
              radial-gradient(ellipse 50% 50% at 60% 80%, rgba(0,60,50,0.4) 0%, transparent 60%),
              linear-gradient(160deg, #001a12 0%, #003328 40%, #001f18 100%)
            `,
            animation: "bgPulse 8s ease-in-out infinite alternate",
          }}
        />

        {/* Dot grid */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />

        {/* Diagonal depth overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(108deg, rgba(0,10,8,0.55) 0%, rgba(0,10,8,0.3) 45%, transparent 60%)",
          }}
        />

        {/* Particle canvas */}
        <ParticleCanvas />

        {/* ── Main content grid ── */}
{/* ── Main content grid ── */}
<div className="hero-main-grid">
  <HeroContent lang={lang} />

  <div ref={visualRef} className="hero-visual-wrap">
    <div className="hero-main-image">
      <Image
        src={COLLAGE_IMAGE_SRC}
        alt="Saudi table tennis players collage"
        fill
        priority
        sizes="(max-width: 520px) 0px, (max-width: 680px) 92vw, (max-width: 1024px) 78vw, 560px"
        style={{
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
    </div>
  </div>
</div>
        {/* Bottom fade to black */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "120px",
              zIndex: 2,
              pointerEvents: "none",
              background:
                "linear-gradient(to bottom, rgba(0, 26, 18, 0) 0%, rgba(0, 10, 7, 0.75) 55%, #050F0A 100%)",
            }}
          />
      </section>
    </>
  );
}
