import type { CSSProperties, ReactNode } from "react";
import { listImages } from "./gallery3d/listImages";

// Farben: bestehende Werte der Seite plus Papierweiss (= bestehendes #F5F0E8) und ein warmes
// Fast-Schwarz für Text auf hellem Grund. Kontraste (WCAG): #C8C0B8 auf #0a0a0a 11:1,
// #1c1a17 auf #F5F0E8 15:1, #1c1a17 auf #72d5c2 9.9:1.
const DARK = "#0a0a0a";
const PAPER = "#F5F0E8";
const TEAL = "#72d5c2";
const INK = "#1c1a17";
const TEXT_ON_DARK = "#C8C0B8";

/**
 * Portraits zwischen den Abschnitten, jede Person nur einmal:
 * nach a) Tänzerin S/W, nach b) Frau mit blauem Kopftuch, nach c) Clown, vor e) DJ mit gelbem Hut.
 */
const ABOUT_PORTRAITS = ["03_p15.webp", "09_p10.webp", "26_p26.webp", "10_p04.webp"];

type Tone = "dark" | "paper";
const bg = (t: Tone) => (t === "dark" ? DARK : PAPER);
/** data-theme für die Menüfarbe (siehe Navigation) */
const themeOf = (color: string) => (color === DARK ? "dark" : color === TEAL ? "teal" : "light");

// Innenabstände inline (nicht über generierte Tailwind-Klassen), damit der Text nie am Rand klebt
const PAD_X = "clamp(1.25rem, 5vw, 3rem)";

function Chapter({
  tone,
  core,
  children,
  accent,
}: {
  tone: Tone;
  core: ReactNode;
  children: ReactNode;
  accent?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <div
      data-theme={dark ? "dark" : "light"}
      style={{
        backgroundColor: bg(tone),
        paddingInline: PAD_X,
        paddingBlock: "clamp(4.5rem, 9vw, 7rem)",
      }}
    >
      {/* margin inline: die globale Regel "* { margin: 0 }" überstimmt Tailwinds mx-auto */}
      <div style={{ maxWidth: "640px", marginInline: "auto" }}>
        {accent ? (
          <div
            aria-hidden
            style={{ width: 40, height: 1, backgroundColor: TEAL, marginBottom: "3rem" }}
          />
        ) : null}
        <p
          className="font-display font-medium"
          style={{
            color: dark ? PAPER : INK,
            fontSize: "clamp(2rem, 1.1rem + 3vw, 3.1rem)",
            lineHeight: 1.15,
            marginBottom: "2.5rem",
            textWrap: "balance",
            overflowWrap: "break-word",
          }}
        >
          {core}
        </p>
        <div
          className="prose-reading"
          style={{ "--reading-color": dark ? TEXT_ON_DARK : INK } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Weicher Übergang zwischen zwei Hintergründen, mit Portrait in der Mitte. */
function Interlude({
  from,
  to,
  image,
}: {
  from: string;
  to: string;
  image?: { src: string; w: number; h: number };
}) {
  return (
    <div
      className="relative flex justify-center"
      style={{
        paddingInline: PAD_X,
        // 1px Überlappung: verhindert Haarlinien durch Subpixel-Lücken zwischen den Flächen
        marginTop: -1,
        marginBottom: -1,
        background: `linear-gradient(to bottom, ${from} 0%, ${from} 12%, ${to} 88%, ${to} 100%)`,
        paddingTop: image ? "3rem" : "0",
        paddingBottom: image ? "3rem" : "0",
        minHeight: image ? undefined : "6rem",
      }}
      aria-hidden={!image}
    >
      {/* Menüfarbe im Verlauf: obere Hälfte wie der Abschnitt davor, untere wie danach */}
      <div data-theme={themeOf(from)} className="pointer-events-none absolute inset-x-0 top-0 h-1/2" />
      <div data-theme={themeOf(to)} className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
      {image ? (
        <img
          src={image.src}
          width={image.w}
          height={image.h}
          alt=""
          loading="lazy"
          decoding="async"
          className="relative block h-auto"
          // inline: die globale Regel "img { max-width: 100% }" überstimmt Tailwinds max-w
          style={{ width: "min(72vw, 360px)", aspectRatio: `${image.w} / ${image.h}` }}
        />
      ) : null}
    </div>
  );
}

export function About() {
  const all = listImages("portraits");
  const pics = ABOUT_PORTRAITS.map((f) => all.find((i) => i.src.endsWith(`/${f}`))).map((i) =>
    i ? { src: i.tex, w: i.w, h: i.h } : undefined,
  );

  return (
    <section className="text-left" style={{ overflowX: "clip" }} aria-label="About">
      {/* a) Der Moment */}
      <Chapter tone="dark" accent core="There is a moment in every shoot I cannot plan.">
        <p>
          It usually comes when the person in front of me has stopped thinking about the camera.
          When the music is playing and we have long since stopped talking about the shoot, and
          started talking about the sister who moved away, or the job they never really wanted, or
          a morning from childhood when the world was still simple. In that moment something
          changes in their face. Something opens. And I press the shutter.
        </p>
        <p>
          Not because the light is perfect. But because I am seeing something most people never get
          to see in themselves.
        </p>
      </Chapter>

      <Interlude from={DARK} to={PAPER} image={pics[0]} />

      {/* b) Die Kamera, der Blick, die Gabe */}
      <Chapter
        tone="paper"
        core={<>&quot;You look at them as if you can see their spirit, not just their face&quot;</>}
      >
        <p>
          I have been photographing since I was ten years old. Back then I asked for a digital
          camera for my birthday without really knowing why. I only knew that I looked at people in
          a certain way that others noticed before I understood it myself. &quot;You look at them
          as if you can see their spirit, not just their face&quot;, they said. People told me this
          often as a child. I thought it was normal. That everyone looked that way.
        </p>
        <p>
          It was not normal. It was a gift. And it took years before I understood that photography
          is the only place where I can truly use it.
        </p>
      </Chapter>

      <Interlude from={PAPER} to={DARK} image={pics[1]} />

      {/* c) Foto und Portrait */}
      <Chapter tone="dark" core="A photo documents. A portrait remembers.">
        <p>
          I do not photograph faces. I photograph what waits behind the face when someone is ready
          to let it show. That is the difference between a photo and a portrait. A photo documents.
          A portrait remembers. Not how someone looked. But who they were in that one moment.
        </p>
      </Chapter>

      <Interlude from={DARK} to={PAPER} image={pics[2]} />

      {/* d) Wie ein Shooting abläuft */}
      <Chapter
        tone="paper"
        core="It appears when someone forgets they are being photographed."
      >
        <p>
          My shoots take longer than they need to. I play music. I ask about life. I share my own.
          Sometimes we talk for twenty minutes before I even raise the camera. Not because I am
          wasting time, but because I know: the image I am looking for does not appear when someone
          poses. It appears when someone forgets they are being photographed.
        </p>
        <p>
          A close friend once told me, at a moment when I was doubting myself and unsure whether my
          images were worth anything: &quot;Never doubt whether portrait photography is the right
          path. Can you not see how you capture the souls of people in these images?&quot; That
          evening I looked at my photographs for a long time. And for the first time I saw what she
          meant.
        </p>
        <p>
          I grew up in Switzerland with two cultures, three languages and a gaze that sometimes goes
          further than I intend. Perhaps that is why I photograph people the way I do. Because I
          know what it feels like to stand between worlds. Because I know that behind every face
          there is a story that deserves to be seen.
        </p>
        <p>
          Every shoot leaves behind more than an image. A story I did not know. A person I now know.
          An encounter that stays. That is the gift of this work. I carry a piece of every person I
          meet with me. That may sound like a lot. But anyone who has truly been seen knows exactly
          what I mean.
        </p>
      </Chapter>

      <Interlude from={PAPER} to={TEAL} image={pics[3]} />

      {/* e) Schluss: Streifen in Türkis */}
      <div
        data-theme="teal"
        className="text-center"
        style={{
          backgroundColor: TEAL,
          paddingInline: PAD_X,
          paddingBlock: "clamp(4.5rem, 8vw, 6rem)",
        }}
      >
        <p
          className="font-display font-medium italic"
          style={{
            marginInline: "auto",
            color: INK,
            fontSize: "clamp(1.9rem, 1.1rem + 2.8vw, 3rem)",
            lineHeight: 1.2,
            maxWidth: "24ch",
            textWrap: "balance",
          }}
        >
          If you are ready to be seen, I am ready to look.
        </p>
      </div>

      <Interlude from={TEAL} to={DARK} />
    </section>
  );
}
