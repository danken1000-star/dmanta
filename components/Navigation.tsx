"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Anker der Hauptseite; "Gallery" ist eine eigene Seite
const links = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#world", label: "World" },
  { href: "/gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" },
] as const;

/** Auf Unterseiten zeigen die Anker zurück auf die Hauptseite (z. B. /#work). */
function resolve(href: string, pathname: string) {
  return href.startsWith("#") && pathname !== "/" ? `/${href}` : href;
}

function isActive(href: string, pathname: string, hash: string) {
  if (href.startsWith("/")) return pathname === href;
  return pathname === "/" && hash === href;
}

/**
 * Menüfarbe je nach Abschnitt unter der Menüleiste (data-theme). Kontrast (WCAG):
 * Weiss auf #0a0a0a 19.8:1, #1c1a17 auf #F5F0E8 15.3:1, #1c1a17 auf #72d5c2 9.9:1.
 * Weiss auf Türkis hätte nur 1.75:1, deshalb ist das Menü dort dunkel.
 */
type Theme = "dark" | "light" | "teal";
const THEMES: Record<Theme, { fg: string; bg: string }> = {
  dark: { fg: "#ffffff", bg: "10, 10, 10" },
  light: { fg: "#1c1a17", bg: "245, 240, 232" },
  teal: { fg: "#1c1a17", bg: "114, 213, 194" },
};
/** Höhe der Linie (px von oben), an der der Abschnitt unter dem Menü bestimmt wird. */
const PROBE_Y = 36;

function useThemeUnderNav(pathname: string): Theme {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const visible = new Set<Element>();
    let io: IntersectionObserver | null = null;
    const pick = () => {
      // tiefstes Element gewinnt (z. B. Hälfte eines Verlaufs innerhalb eines Abschnitts)
      const list = [...visible];
      const el = list.find((a) => !list.some((b) => b !== a && a.contains(b)));
      const t = el?.getAttribute("data-theme");
      setTheme(t === "light" || t === "teal" ? t : "dark");
    };
    const setup = () => {
      io?.disconnect();
      visible.clear();
      // schmales Band auf Höhe der Menüleiste
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          pick();
        },
        { rootMargin: `-${PROBE_Y}px 0px -${Math.max(0, window.innerHeight - PROBE_Y - 1)}px 0px` },
      );
      document.querySelectorAll("[data-theme]").forEach((el) => io!.observe(el));
    };
    setup();
    window.addEventListener("resize", setup);
    return () => {
      window.removeEventListener("resize", setup);
      io?.disconnect();
    };
  }, [pathname]);
  return theme;
}

export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hash, setHash] = useState("");
  const theme = useThemeUnderNav(pathname);
  const { fg, bg } = THEMES[theme];

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
      className="fixed top-0 right-0 left-0 z-50"
      style={{ color: fg, transition: "color 200ms ease" }}
    >
      {/* Weicher Hintergrund in der Farbe des Abschnitts: Unschärfe + Farbe, nach unten ausgeblendet */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "calc(100% + 28px)",
          backgroundColor: `rgba(${bg}, ${scrolled ? 0.82 : 0})`,
          backdropFilter: scrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
          maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
          transition: "background-color 200ms ease",
        }}
      />
      <nav
        className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:py-6"
        aria-label="Main"
      >
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] md:text-base"
        >
          DMANTA
        </Link>

        <ul className="hidden items-center gap-1 md:flex md:gap-0">
          {links.map((item, i) => {
            const active = isActive(item.href, pathname, hash);
            return (
              <li key={item.href} className="flex items-center">
                {i > 0 && (
                  <span className="px-3 opacity-40 select-none" aria-hidden>
                    ·
                  </span>
                )}
                <Link
                  href={resolve(item.href, pathname)}
                  className={`relative pb-1 text-sm font-medium tracking-wide transition-opacity hover:opacity-80 ${
                    active
                      ? "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[#72d5c2]"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex items-center">
            <span className="px-3 opacity-40 select-none" aria-hidden>
              ·
            </span>
            <a
              href="https://www.instagram.com/1dmanta"
              target="_blank"
              rel="noopener noreferrer"
              className="relative pb-1 text-sm font-medium tracking-wide transition-opacity hover:opacity-80"
            >
              @1dmanta
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="sr-only">{menuOpen ? "Close" : "Menu"}</span>
          <span className="flex w-6 flex-col gap-1.5" aria-hidden>
            <span
              className={`h-px w-full bg-current transition-[transform,background-color] duration-200 ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`h-px w-full bg-current transition-[opacity,background-color] duration-200 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-full bg-current transition-[transform,background-color] duration-200 ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={`relative md:hidden overflow-hidden border-t border-white/10 bg-[#0a0a0a] text-white transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen
            ? "pointer-events-auto max-h-96 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        {/* Innenabstand inline: die globale Regel "ul { padding: 0 }" überstimmt Tailwinds px-6 */}
        <ul className="flex flex-col" style={{ padding: "1rem 1.5rem" }}>
          {links.map((item) => {
            const active = isActive(item.href, pathname, hash);
            return (
              <li key={item.href}>
                <Link
                  href={resolve(item.href, pathname)}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 text-base font-medium text-white ${
                    active
                      ? "border-b border-[#72d5c2] pb-3"
                      : "border-b border-white/10"
                  }`}
                >
                  {item.label}
                </Link>
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
