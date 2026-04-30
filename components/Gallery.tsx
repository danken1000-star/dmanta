import fs from "node:fs";
import path from "node:path";
import { GalleryClient } from "./GalleryClient";

export async function Gallery() {
  const portraitsDir = path.join(
    process.cwd(),
    "public",
    "images",
    "portraits",
  );

  const files = fs
    .readdirSync(portraitsDir)
    .filter((f) => f.toLowerCase().endsWith(".webp"));

  files.sort();

  const images = files.map((file) => `/images/portraits/${file}`);

  return <GalleryClient images={images} />;
}
