"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "الرئيسية", href: "/presidency" },
  { label: "عن الاتحاد", href: "/contact" },
  { label: "المنتخبات", href: "/team" },
  { label: "الأندية", href: "/clubs" },
  // { label: "اللوائح", href: "/board" },
  { label: "الدوري", href: "/league" },
  // { label: "اللجان", href: "/committee" },
  { label: "المباريات", href: "/matches" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <div className="relative w-full bg-gradient-to-b from-[#003f2c] via-[#002719] to-[#020504]/95 shadow-[0_18px_45px_rgba(0,0,0,0.45)]">
        <div className="mx-auto flex h-[106px] max-w-[1280px] items-center justify-between px-5 md:px-8 lg:px-10">
          {/* Desktop nav */}
          <nav
            dir="rtl"
            className="hidden items-center gap-1 rounded-lg border border-white/15 bg-black/45 p-1 shadow-xl backdrop-blur-md lg:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-4 py-4 text-sm font-bold text-white/95",
                  "transition hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions
          <div className="hidden items-center gap-1 lg:flex">
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-[52px] w-[56px] items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md transition hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </Link>

            <Link
              href="/en"
              className="flex h-[52px] w-[56px] items-center justify-center rounded-lg border border-white/15 bg-black/45 text-2xl font-black text-white shadow-xl backdrop-blur-md transition hover:bg-white/10"
            >
              E
            </Link>
          </div> */}

          {/* Logo */}
          <Link href="/" className="relative z-20 ml-auto lg:ml-0">
            <Image
              src="/navlogo.png"
              alt="Saudi Table Tennis Federation"
              width={260}
              height={90}
              priority
              className="h-auto w-[190px] object-contain sm:w-[220px]"
            />
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/15 bg-black/45 text-white shadow-xl backdrop-blur-md lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div
          className={cn(
            "overflow-hidden border-t border-white/10 bg-black/80 backdrop-blur-xl transition-all duration-300 lg:hidden",
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav dir="rtl" className="grid gap-2 px-5 py-5 text-right">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}

            {/* <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/search"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href="/en"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl font-black text-white transition hover:bg-white/10"
              >
                E
              </Link>
            </div> */}
          </nav>
        </div>
      </div>
    </header>
  );
}