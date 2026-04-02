"use client";

import { useEffect, useState } from "react";

export function Hero() {
  const [bgPosition, setBgPosition] = useState("center 15%");

  useEffect(() => {
    const updatePosition = () => {
      if (window.innerWidth < 768) {
        setBgPosition("center 30%");
      } else {
        setBgPosition("center 15%");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  return (
    <section
      className="relative h-[100vh] max-h-[100vh] w-full shrink-0 overflow-hidden"
      aria-label="Introduction"
    >
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url(/images/hero.webp)",
          backgroundPosition: bgPosition,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 60%, #0a0a0a 100%)",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
        <div className="hero-fade-in">
          <h1 className="font-display text-[12vw] font-medium leading-none tracking-tight text-[#F5F0E8]">
            DMANTA
          </h1>
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.45em] text-[#72d5c2] md:text-sm md:tracking-[0.5em]">
            <span>Swiss precision.</span>{" "}
            <br className="md:hidden" />
            <span>African soul.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
