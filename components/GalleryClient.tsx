"use client";

import { useCallback, useEffect, useState } from "react";

function MasonryGridImage({
  src,
  onOpen,
}: {
  src: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full cursor-pointer break-inside-avoid border-none bg-transparent p-0"
      style={{ marginBottom: "8px" }}
    >
      <img
        src={src}
        alt=""
        className="block w-full opacity-100 transition-opacity duration-300 hover:opacity-[0.85]"
        loading="lazy"
        decoding="async"
      />
    </button>
  );
}

export function GalleryClient({ images }: { images: string[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || images.length === 0) return i;
      return (i - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || images.length === 0) return i;
      return (i + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLightboxIndex((i) => {
          if (i === null || images.length === 0) return i;
          return (i - 1 + images.length) % images.length;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setLightboxIndex((i) => {
          if (i === null || images.length === 0) return i;
          return (i + 1) % images.length;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, images.length]);

  const lightboxSrc =
    lightboxIndex !== null ? images[lightboxIndex] ?? null : null;

  return (
    <section className="w-full" aria-label="Gallery">
      <div
        className="columns-1 bg-[#0a0a0a] md:columns-2 lg:columns-3"
        style={{
          columnGap: "8px",
          padding: "0 1rem 4rem",
        }}
      >
        {images.map((src, index) => (
          <MasonryGridImage key={src} src={src} onOpen={() => openAt(index)} />
        ))}
      </div>

      {lightboxSrc !== null && lightboxIndex !== null ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
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
            className="flex max-h-full max-w-full items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxSrc}
              alt=""
              className="object-contain"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
              }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

