import { ImageGrid } from "./gallery3d/ImageGrid";
import { listImages } from "./gallery3d/listImages";

const headingStyle = { fontSize: "0.75rem", letterSpacing: "0.3em", marginBottom: "2rem" } as const;

/** Alle Bilder als ruhiges Raster: erst Work (Portraits), dann World. */
export function GallerySection() {
  return (
    <section
      data-theme="dark"
      className="g3d bg-[#0a0a0a] px-[1rem] md:px-[1.5rem]"
      style={{ paddingTop: "8rem", paddingBottom: "4rem" }}
      aria-label="Gallery"
    >
      <h2 className="sr-only">Gallery</h2>
      <h3 className="text-center font-sans font-medium uppercase text-[#666]" style={headingStyle}>
        Work
      </h3>
      <ImageGrid images={listImages("portraits")} label="Work" />

      <h3
        className="text-center font-sans font-medium uppercase text-[#666]"
        style={{ ...headingStyle, marginTop: "6rem" }}
      >
        World
      </h3>
      <ImageGrid images={listImages("world")} label="World" printRequest />
    </section>
  );
}
