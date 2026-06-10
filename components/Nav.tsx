"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";

export function Nav() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        
        <MenuItem setActive={setActive} active={active} item="الاتحاد">

          <div className="flex flex-col justify-end space-y-4 text-sm text-white">
            <HoveredLink href="/presidency">الرئيسية</HoveredLink>
            <HoveredLink href="/news">الأخبار</HoveredLink>
            <HoveredLink href="/contact">عن الاتحاد</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="الخدمات">
          <div className="  text-sm grid grid-cols-2 gap-10 p-4 text-white">
            <ProductItem
              title="المنتخبات"
              href="/team"
              src="/images/nav/team.png"
              description="منتخباتنا ولاعبونا."
            />

            <ProductItem
              title="الأندية"
              href="/clubs"
              src="/images/nav/clubs.png"
              description="الأندية المسجلة."
            />

            <ProductItem
              title="الدوري"
              href="/league"
              src="/images/nav/tournament.png"
              description="جداول وترتيب الدوري."
            />

            <ProductItem
              title="المباريات"
              href="/matches"
              src="/images/nav/matches.png"
              description="المباريات والنتائج."
            />
          </div>
        </MenuItem>
        {/* <MenuItem setActive={setActive} active={active} item="الحوكمة">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/board">اللوائح</HoveredLink>
            <HoveredLink href="/committee">اللجان</HoveredLink>
          </div>
        </MenuItem> */}
      </Menu>
    </div>
  );
}
