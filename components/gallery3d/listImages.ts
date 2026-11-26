import fs from "node:fs";
import path from "node:path";
import type { GalleryImage } from "./Gallery3D";

/** Breite/Höhe aus dem WebP-Header (VP8, VP8L, VP8X), ohne das Bild zu dekodieren. */
function webpSize(file: string): { w: number; h: number } | null {
  const fd = fs.openSync(file, "r");
  try {
    const b = Buffer.alloc(30);
    fs.readSync(fd, b, 0, 30, 0);
    if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") return null;
    const chunk = b.toString("ascii", 12, 16);
    if (chunk === "VP8 ") {
      return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const b1 = b[22], b2 = b[23], b3 = b[24];
      return {
        w: 1 + (((b1 & 0x3f) << 8) | b[21]),
        h: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
      };
    }
    if (chunk === "VP8X") {
      return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    }
    return null;
  } finally {
    fs.closeSync(fd);
  }
}

/** Liest public/images/<set>/, ordnet jedem Original die verkleinerte Textur zu und ermittelt die Masse. */
export function listImages(set: "portraits" | "world"): GalleryImage[] {
  const pub = path.join(process.cwd(), "public");
  const dir = path.join(pub, "images", set);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".webp"))
    .sort();
  return files.map((file) => {
    const src = `/images/${set}/${file}`;
    const tex = `/images/tex/${set}/${file}`;
    // Fallback Hochformat, falls der Header unbekannt ist
    const size = webpSize(path.join(dir, file)) ?? { w: 2, h: 3 };
    return { src, tex: fs.existsSync(path.join(pub, tex)) ? tex : src, w: size.w, h: size.h };
  });
}
