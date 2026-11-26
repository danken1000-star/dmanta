"use client";

import { useRef, useState } from "react";
import type { GalleryImage } from "./Gallery3D";
import { Lightbox } from "./Lightbox";

/** Normales Bildraster ohne Zuschnitt; Klick öffnet die grosse Ansicht wie in den 3D-Gängen. */
export function ImageGrid({
  images,
  label,
  printRequest,
}: {
  images: GalleryImage[];
  label: string;
  printRequest?: boolean;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const lastIndex = useRef(0);

  const open = (i: number) => {
    lastIndex.current = i;
    setIndex(i);
  };
  const close = () => {
    setIndex(null);
    // Fokus zurück auf das zuletzt gezeigte Vorschaubild
    const target = buttons.current[lastIndex.current];
    requestAnimationFrame(() => target?.focus({ preventScroll: true }));
  };

  return (
    <>
      <ul
        className="columns-1 sm:columns-2 lg:columns-3"
        style={{ columnGap: "8px" }}
      >
        {images.map((img, i) => (
          <li key={img.src} className="break-inside-avoid" style={{ marginBottom: "8px" }}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              onClick={() => open(i)}
              aria-label={`${label}: Bild ${i + 1} von ${images.length} öffnen`}
              className="block w-full cursor-pointer border-none bg-transparent p-0 transition-opacity duration-300 hover:opacity-[0.85] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#72d5c2]"
            >
              <img
                src={img.tex}
                width={img.w}
                height={img.h}
                alt=""
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
                style={{ aspectRatio: `${img.w} / ${img.h}`, backgroundColor: "#111" }}
              />
            </button>
          </li>
        ))}
      </ul>

      {index !== null ? (
        <Lightbox
          images={images.map((im) => im.src)}
          index={index}
          label={label}
          onIndex={(i) => {
            lastIndex.current = i;
            setIndex(i);
          }}
          onClose={close}
          onLeave={close}
          printRequest={printRequest}
        />
      ) : null}
    </>
  );
}
