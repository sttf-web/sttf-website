"use client";
import React from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";



const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white text-white hover:border hover:rounded-full hover:bg-gray-200 hover:text-black px-2 py-1"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_0.9rem)] left-1/2 transform -translate-x-1/2 pt-1">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
<nav
  onMouseLeave={() => setActive(null)}
  className="relative flex items-center rounded-full border border-transparent bg-white/20 px-8 py-4 shadow-input dark:bg-black/20"
>
  {/* Logo at start */}
  <Link href="/" className="relative z-10 flex shrink-0 items-center hover:scale-[1.05] active:scale-[0.99]">
    <Image
      src="/Logo.png"
      alt="Saudi Table Tennis Federation"
      width={120}
      height={40}
      priority
      className="h-10 w-auto object-contain"
    />
  </Link>

  {/* Menu items centered in full nav */}
  <div className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center space-x-4">
    {children}
  </div>
</nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
  lang = "ar",
}: {
  title: string;
  description: string;
  href: string;
  src: string;
  lang?: "ar" | "en";
}) => {
  const isAr = lang === "ar";

  return (
    <a
      href={href}
      dir={isAr ? "rtl" : "ltr"}
      className={`flex gap-2 ${isAr ? "flex-row-reverse" : "flex-row"}`}
    >
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />

      <div className={isAr ? "text-right" : "text-left"}>
        <h4 className="mb-1 text-xl font-bold text-black dark:text-white">
          {title}
        </h4>

        <p className="max-w-[10rem] text-sm text-neutral-700 dark:text-neutral-300">
          {description}
        </p>
      </div>
    </a>
  );
};

export const HoveredLink = ({ children, ...rest }: any) => {
  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200  "
    >
      {children}
    </a>
  );
};
