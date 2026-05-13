export function About() {
  const bodyStyle = {
    fontSize: "1.05rem",
    lineHeight: 1.95,
    fontWeight: 300,
    marginBottom: "1.8rem",
    color: "#C8C0B8",
  } as const;

  return (
    <section
      className="bg-[#0a0a0a] text-left px-[1.5rem] md:px-[3rem]"
      style={{ paddingTop: "8rem", paddingBottom: "8rem" }}
      aria-label="About"
    >
      <div className="mx-auto max-w-[720px]">
        <div
          className="mx-auto"
          style={{
            width: "40px",
            height: "1px",
            backgroundColor: "#72d5c2",
            marginBottom: "3rem",
          }}
          aria-hidden
        />

        <div
          className="not-italic"
          style={{ fontFamily: "'Lora', serif" }}
        >
          <p style={bodyStyle}>
            There is a moment in every shoot I cannot plan.
          </p>
          <p style={bodyStyle}>
            It usually comes when the person in front of me has stopped thinking
            about the camera. When the music is playing and we have long since
            stopped talking about the shoot, and started talking about the sister
            who moved away, or the job they never really wanted, or a morning from
            childhood when the world was still simple. In that moment something
            changes in their face. Something opens. And I press the shutter.
          </p>
          <p style={bodyStyle}>
            Not because the light is perfect. But because I am seeing something
            most people never get to see in themselves.
          </p>
          <p style={bodyStyle}>
            I have been photographing since I was ten years old. Back then I asked
            for a digital camera for my birthday without really knowing why. I only
            knew that I looked at people in a certain way that others noticed before
            I understood it myself. &quot;You look at them as if you can see their
            spirit, not just their face&quot;, they said. People told me this often
            as a child. I thought it was normal. That everyone looked that way.
          </p>
          <p style={bodyStyle}>
            It was not normal. It was a gift. And it took years before I understood
            that photography is the only place where I can truly use it.
          </p>
          <p style={bodyStyle}>
            I do not photograph faces. I photograph what waits behind the face when
            someone is ready to let it show. That is the difference between a photo
            and a portrait. A photo documents. A portrait remembers. Not how
            someone looked. But who they were in that one moment.
          </p>
          <p style={bodyStyle}>
            My shoots take longer than they need to. I play music. I ask about life.
            I share my own. Sometimes we talk for twenty minutes before I even raise
            the camera. Not because I am wasting time, but because I know: the image
            I am looking for does not appear when someone poses. It appears when
            someone forgets they are being photographed.
          </p>
          <p style={bodyStyle}>
            A close friend once told me, at a moment when I was doubting myself and
            unsure whether my images were worth anything: &quot;Never doubt whether
            portrait photography is the right path. Can you not see how you capture
            the souls of people in these images?&quot; That evening I looked at my
            photographs for a long time. And for the first time I saw what she meant.
          </p>
          <p style={bodyStyle}>
            I grew up in Switzerland with two cultures, three languages and a gaze
            that sometimes goes further than I intend. Perhaps that is why I
            photograph people the way I do. Because I know what it feels like to
            stand between worlds. Because I know that behind every face there is a
            story that deserves to be seen.
          </p>
          <p style={bodyStyle}>
            Every shoot leaves behind more than an image. A story I did not know. A
            person I now know. An encounter that stays. That is the gift of this work.
            I carry a piece of every person I meet with me. That may sound like a lot.
            But anyone who has truly been seen knows exactly what I mean.
          </p>
          <p
            className="font-display italic"
            style={{
              fontSize: "1.4rem",
              lineHeight: 1.95,
              marginBottom: "1.8rem",
              color: "#72d5c2",
            }}
          >
            If you are ready to be seen, I am ready to look.
          </p>
        </div>
      </div>
    </section>
  );
}
