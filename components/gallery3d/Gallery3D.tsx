"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { GalleryScene } from "./scene";
import { Lightbox } from "./Lightbox";

export type GalleryImage = {
  /** Original, nur für die grosse Ansicht */
  src: string;
  /** verkleinerte Textur für den Gang */
  tex: string;
  /** echte Masse des Originals (bestimmen Hoch-/Querformat) */
  w: number;
  h: number;
};

type Props = {
  images: GalleryImage[];
  ring: "work" | "world";
  label: string;
  /** Überschrift über der Bühne */
  heading?: ReactNode;
  /** 2D-Titel im unteren Drittel, blendet beim Losgehen aus */
  title?: ReactNode;
  /** Anker des nächsten Abschnitts (Pfeil am Ende des Gangs) */
  nextHref: string;
  /** Höhe der Bühne */
  stageClassName?: string;
  printRequest?: boolean;
  /** Bisheriges Bildraster, wenn kein WebGL verfügbar ist */
  children: ReactNode;
};

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

// Letzte Eingabeart merken: Fokusrahmen nur nach Tastaturbedienung (auch bei
// programmatischem Fokus, z. B. Schliessen-Knopf der grossen Ansicht).
let modalityInstalled = false;
function installInputModality() {
  if (modalityInstalled) return;
  modalityInstalled = true;
  const root = document.documentElement;
  root.dataset.input = "pointer";
  window.addEventListener("keydown", (e) => {
    if (!e.metaKey && !e.ctrlKey && !e.altKey) root.dataset.input = "keyboard";
  }, true);
  window.addEventListener("pointerdown", () => (root.dataset.input = "pointer"), true);
}

const btn =
  "pointer-events-auto cursor-pointer border-none bg-transparent p-3 text-2xl leading-none text-white transition-opacity hover:opacity-80 md:text-3xl";

export function Gallery3D({
  images,
  ring,
  label,
  heading,
  title,
  nextHref,
  stageClassName = "h-[85svh]",
  printRequest,
  children,
}: Props) {
  const [support, setSupport] = useState<"unknown" | "yes" | "no">("unknown");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [edge, setEdge] = useState({ atStart: true, atEnd: false });
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<GalleryScene | null>(null);

  useEffect(() => {
    installInputModality();
    setSupport(hasWebGL() ? "yes" : "no");
  }, []);

  const scrollToNext = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector(nextHref)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [nextHref]);

  useEffect(() => {
    if (support !== "yes") return;
    const stage = stageRef.current;
    const wrap = canvasWrapRef.current;
    if (!stage || !wrap) return;

    let cancelled = false;
    let visible = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const create = async () => {
      if (sceneRef.current) return;
      try {
        const mod = await import("./scene");
        if (cancelled || sceneRef.current) return;
        const scene = new mod.GalleryScene(
          wrap,
          images.map((i) => ({ tex: i.tex, w: i.w, h: i.h })),
          mod.RINGS[ring],
          {
            onFocusChange: setFocused,
            onOpen: setLightbox,
            onFirstTexture: () => setReady(true),
            onEdge: setEdge,
            onExit: scrollToNext,
          },
          reduced,
        );
        sceneRef.current = scene;
        scene.loadTextures();
        scene.setActive(visible);
      } catch {
        if (!cancelled) setSupport("no");
      }
    };

    // Szene + Texturen erst laden, wenn der Gang in die Nähe kommt
    const near = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          near.disconnect();
          void create();
        }
      },
      { rootMargin: "100% 0px" },
    );
    // Nur rendern, solange die Bühne sichtbar ist
    const vis = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sceneRef.current?.setActive(visible);
    });
    near.observe(stage);
    vis.observe(stage);

    return () => {
      cancelled = true;
      near.disconnect();
      vis.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [support, images, ring, scrollToNext]);

  const closeLightbox = useCallback(() => {
    setLightbox((i) => {
      if (i !== null) sceneRef.current?.focusImage(i);
      return null;
    });
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  const leaveLightbox = useCallback(() => {
    setLightbox(null);
    sceneRef.current?.back();
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  if (support === "no") return <>{children}</>;

  const atEnd = edge.atEnd && focused === null;
  const showTitle = edge.atStart && focused === null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const s = sceneRef.current;
    if (!s || e.target !== e.currentTarget) return;
    // Hoch/Runter, Bild-Tasten und Leertaste bleiben beim Seiten-Scrollen
    if (e.key === "ArrowRight") {
      e.preventDefault();
      s.step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      s.step(-1);
    } else if (e.key === "Escape") {
      s.back();
    } else if (e.key === "Enter") {
      if (focused !== null) {
        e.preventDefault();
        s.openFocused();
      }
    }
  };

  return (
    <section data-theme="dark" className="g3d relative w-full bg-[#0a0a0a]" aria-label={label}>
      {heading}
      <div
        ref={stageRef}
        tabIndex={0}
        role="region"
        aria-roledescription="3D gallery"
        aria-label={`${label} – Pfeiltasten zum Gehen, Enter öffnet das gewählte Bild`}
        onKeyDown={onKeyDown}
        className={`relative w-full overflow-hidden outline-none select-none focus-visible:ring-1 focus-visible:ring-[#72d5c2] ${stageClassName}`}
      >
        <div
          ref={canvasWrapRef}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: ready ? 1 : 0.35 }}
        />

        {/* Untere Zone: Titel (Anfang) bzw. Endpfeil, darunter die Bedienung */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-3 md:pb-5">
          <div className="grid place-items-center">
            {title ? (
              <div
                className="[grid-area:1/1] text-center transition-opacity duration-700"
                style={{ opacity: showTitle ? 1 : 0 }}
              >
                {title}
              </div>
            ) : null}
            <button
              type="button"
              tabIndex={atEnd ? 0 : -1}
              aria-hidden={!atEnd}
              aria-label="Zum nächsten Abschnitt"
              onClick={scrollToNext}
              className={`[grid-area:1/1] cursor-pointer border-none bg-transparent p-3 text-3xl leading-none text-white transition-opacity duration-700 hover:opacity-80 md:text-4xl ${atEnd ? "pointer-events-auto opacity-100" : "opacity-0"}`}
            >
              ↓
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-4 md:mt-6">
            <button
              type="button"
              tabIndex={-1}
              className={btn}
              aria-label="Previous"
              onClick={() => sceneRef.current?.step(-1)}
            >
              ‹
            </button>
            <span
              className="font-sans font-medium uppercase text-[#666]"
              style={{ fontSize: "0.7rem", letterSpacing: "0.3em" }}
            >
              {focused !== null ? "Click to open" : "Scroll · Drag · Click"}
            </span>
            <button
              type="button"
              tabIndex={-1}
              className={btn}
              aria-label="Next"
              onClick={() => sceneRef.current?.step(1)}
            >
              ›
            </button>
          </div>

        </div>
      </div>

      {/* Für Screenreader und Tastatur: direkte Liste aller Bilder */}
      <ul className="sr-only">
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" onClick={() => setLightbox(i)}>
              {`${label}: Bild ${i + 1} von ${images.length} öffnen`}
            </button>
          </li>
        ))}
      </ul>

      {lightbox !== null ? (
        <Lightbox
          images={images.map((i) => i.src)}
          index={lightbox}
          label={label}
          onIndex={setLightbox}
          onClose={closeLightbox}
          onLeave={leaveLightbox}
          printRequest={printRequest}
        />
      ) : null}
    </section>
  );
}
