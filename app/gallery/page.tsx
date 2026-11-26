import type { Metadata } from "next";
import { GallerySection } from "@/components/GallerySection";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Gallery – DMANTA",
  description: "Alle Portraits und World-Bilder von Daniel Manta als Übersicht.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <Navigation />
      <main className="m-0 p-0">
        <GallerySection />
      </main>
    </>
  );
}
