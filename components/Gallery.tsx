import { Gallery3D } from "./gallery3d/Gallery3D";
import { listImages } from "./gallery3d/listImages";
import { GalleryClient } from "./GalleryClient";

export async function Gallery() {
  const images = listImages("portraits");

  return (
    <Gallery3D
      images={images}
      ring="work"
      label="Work"
      stageClassName="h-[88svh] min-h-[520px]"
      nextHref="#about"
      title={
        <div className="hero-fade-in">
          <h1 className="font-display text-[12vw] font-medium leading-none tracking-tight text-[#F5F0E8] md:text-[5.5vw]">
            DMANTA
          </h1>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.45em] text-[#72d5c2] md:text-sm md:tracking-[0.5em]">
            <span>Swiss precision.</span> <br className="md:hidden" />
            <span>African soul.</span>
          </p>
        </div>
      }
    >
      <GalleryClient images={images.map((i) => i.src)} />
    </Gallery3D>
  );
}
