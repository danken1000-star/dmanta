import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Gallery } from "@/components/Gallery";
import { Navigation } from "@/components/Navigation";
import { WorldGallery } from "@/components/WorldGallery";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="m-0 p-0">
        <div id="work">
          <Gallery />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="world">
          <WorldGallery />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </main>
    </>
  );
}
