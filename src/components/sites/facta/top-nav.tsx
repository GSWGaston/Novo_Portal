"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navMenus } from "./data";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <ul ref={ref} className="flex h-full flex-wrap items-center text-[14.5px] text-white/70">
      {navMenus.map((menu) => {
        const active =
          menu.href === pathname || menu.items?.some((i) => i.href === pathname);
        const base = `flex h-[43px] items-center gap-1.5 px-[14px] hover:text-white ${active ? "font-medium text-white" : ""}`;
        const content = (
          <>
            <i className={`fa ${menu.icon} text-[15px]`} />
            {menu.label}
            {menu.items && (
              <span className="ml-0.5 inline-block border-x-[3.5px] border-t-[4px] border-x-transparent border-t-current" />
            )}
          </>
        );
        return (
          <li key={menu.label} className="relative">
            {menu.href ? (
              <Link href={menu.href} className={base}>
                {content}
              </Link>
            ) : (
              <button
                type="button"
                className={base}
                aria-expanded={open === menu.label}
                onClick={() => setOpen(open === menu.label ? null : menu.label)}
              >
                {content}
              </button>
            )}
            {open === menu.label && menu.items && menu.items.length > 0 && (
              <ul className="absolute left-0 top-full z-30 min-w-[160px] whitespace-nowrap rounded-[3px] border border-black/15 bg-white py-[5px] text-[#67757c] shadow-[0_6px_12px_rgba(0,0,0,0.175)]">
                {menu.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(null)}
                      className="block px-5 py-[7px] text-[12px] hover:bg-[#f4f5f6]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
