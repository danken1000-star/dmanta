"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#world", label: "World" },
  { href: "#contact", label: "Contact" },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const readHash = () => {
      setHash(typeof window !== "undefined" ? window.location.hash : "");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-[background-color,backdrop-filter] duration-300 ease-out ${
        scrolled ? "backdrop-blur-md" : ""
      }`}
      style={{
        backgroundColor: scrolled ? "#0a0a0aDD" : "transparent",
      }}
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-white md:py-6"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-white md:text-base"
        >
          DMANTA
        </Link>

        <ul className="hidden items-center gap-1 md:flex md:gap-0">
          {links.map((item, i) => {
            const active = hash === item.href;
            return (
              <li key={item.href} className="flex items-center">
                {i > 0 && (
                  <span className="px-3 text-white/40 select-none" aria-hidden>
                    ·
                  </span>
                )}
                <a
                  href={item.href}
                  className={`relative pb-1 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90 ${
                    active
                      ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#72d5c2]"
                      : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
          <li className="flex items-center">
            <span className="px-3 text-white/40 select-none" aria-hidden>
              ·
            </span>
            <a
              href="https://www.instagram.com/1dmanta"
              target="_blank"
              rel="noopener noreferrer"
              className="relative pb-1 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-90"
            >
              @1dmanta
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
          <span className="flex w-6 flex-col gap-1.5" aria-hidden>
            <span
              className={`h-px w-full bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-px w-full bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-full bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-white/10 bg-[#0a0a0a] transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen
            ? "pointer-events-auto max-h-96 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <ul className="flex flex-col px-6 py-4">
          {links.map((item) => {
            const active = hash === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 text-base font-medium text-white ${
                    active
                      ? "border-b border-[#72d5c2] pb-3"
                      : "border-b border-white/10"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
          <li>
            <a
              href="https://www.instagram.com/1dmanta"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="block border-b border-white/10 py-3 text-base font-medium text-white"
            >
              @1dmanta
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
