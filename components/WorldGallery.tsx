import { Gallery3D } from "./gallery3d/Gallery3D";
import { listImages } from "./gallery3d/listImages";
import { World } from "./World";

export function WorldGallery() {
  return (
    <Gallery3D
      images={listImages("world")}
      ring="world"
      label="World"
      printRequest
      nextHref="#contact"
      stageClassName="h-[85svh] min-h-[480px]"
      heading={
        <h2
          className="text-center font-sans font-medium uppercase text-[#666]"
          style={{ fontSize: "0.75rem", letterSpacing: "0.3em", padding: "4rem 1rem 2rem" }}
        >
          WORLD
        </h2>
      }
    >
      <World />
    </Gallery3D>
  );
}
