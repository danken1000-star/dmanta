"use client";

import { useCallback, useEffect, useRef } from "react";

type Props = {
  images: string[];
  index: number;
  label: string;
  onIndex: (i: number) => void;
  onClose: () => void;
  /** Wheel in der grossen Ansicht: zurück in den Gang */
  onLeave: () => void;
  printRequest?: boolean;
};

export function Lightbox({ images, index, label, onIndex, onClose, onLeave, printRequest }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const n = images.length;

  const goPrev = useCallback(() => onIndex((index - 1 + n) % n), [index, n, onIndex]);
  const goNext = useCallback(() => onIndex((index + 1) % n), [index, n, onIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.key === "Tab") {
      // Fokus-Falle
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${label}: Bild ${index + 1} von ${n}`}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      onClick={onClose}
      onKeyDown={onKeyDown}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > 8) onLeave();
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (delta < -50) goNext();
        else if (delta > 50) goPrev();
        touchStartX.current = null;
      }}
    >
      <span
        className="absolute top-5 right-16 z-10 font-sans text-sm leading-none text-white/60 tabular-nums md:top-7 md:right-auto md:left-1/2 md:-translate-x-1/2"
        aria-live="polite"
      >
        {index + 1} / {n}
      </span>

      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-10 cursor-pointer border-none bg-transparent p-3 text-3xl leading-none text-white transition-opacity hover:opacity-80 md:top-6 md:right-6 md:text-4xl"
        aria-label="Close"
      >
        ×
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer border-none bg-transparent p-4 text-2xl text-white transition-opacity hover:opacity-80 md:left-6 md:text-3xl"
        aria-label="Previous image"
      >
        ‹
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer border-none bg-transparent p-4 text-2xl text-white transition-opacity hover:opacity-80 md:right-6 md:text-3xl"
        aria-label="Next image"
      >
        ›
      </button>

      <div
        role="presentation"
        className={`relative z-0 flex max-h-full max-w-full items-center justify-center p-6 ${printRequest ? "md:pb-16" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Original in voller Grösse, ganzes Bild sichtbar */}
        <img
          src={images[index]}
          alt=""
          className="object-contain"
          style={{ maxWidth: "90vw", maxHeight: "90vh" }}
        />
      </div>

      {printRequest ? (
        <a
          href={`mailto:d.manta@icloud.com?subject=${encodeURIComponent(`Print-Anfrage: World #${String(index + 1).padStart(2, "0")}`)}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 cursor-pointer border border-white/20 px-5 py-2 font-sans text-xs uppercase tracking-[0.2em] text-white/50 transition-all hover:border-white/40 hover:text-white/80 md:bottom-8"
        >
          Print anfragen
        </a>
      ) : null}
    </div>
  );
}
