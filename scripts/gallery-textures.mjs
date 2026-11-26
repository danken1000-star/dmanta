// Erzeugt verkleinerte Texturen (längste Seite 1200 px, webp) für die 3D-Galerie.
// Originale in public/images/<set>/ bleiben unverändert; Ausgabe nach public/images/tex/<set>/.
// Aufruf: npm run textures
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images");
const sets = ["portraits", "world"];
const MAX = 1200;

for (const set of sets) {
  const srcDir = path.join(root, set);
  const outDir = path.join(root, "tex", set);
  fs.mkdirSync(outDir, { recursive: true });
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.toLowerCase().endsWith(".webp"))
    .sort();
  for (const file of files) {
    const src = path.join(srcDir, file);
    const out = path.join(outDir, file);
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    await sharp(src)
      .rotate()
      .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(out);
    console.log(`${set}/${file}`);
  }
}
