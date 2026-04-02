import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { Navigation } from "@/components/Navigation";
import { World } from "@/components/World";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="m-0 p-0">
        <Hero />
        <div id="work">
          <Gallery />
        </div>
        <div id="about">
          <About />
        </div>
        <div id="world">
          <World />
        </div>
        <div id="contact">
          <Contact />
        </div>
      </main>
    </>
  );
}
