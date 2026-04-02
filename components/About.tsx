export function About() {
  return (
    <section
      className="bg-[#0a0a0a] text-center"
      style={{ padding: "8rem 2rem" }}
      aria-label="About"
    >
      <div className="mx-auto max-w-[600px]">
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

        <p
          className="font-display not-italic text-[#F5F0E8]"
          style={{
            fontSize: "1.6rem",
            lineHeight: 1.8,
            fontStyle: "normal",
          }}
        >
          The work speaks. If you want to know more — find me on Instagram or
          send me a line.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6 font-sans uppercase md:mt-12">
          <a
            href="https://instagram.com/1dmanta"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#72d5c2] transition-opacity hover:opacity-80"
            style={{
              fontSize: "0.9rem",
              letterSpacing: "0.2em",
            }}
          >
            <span className="inline-flex shrink-0 text-white" aria-hidden>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </span>
            @1dmanta
          </a>
          <a
            href="mailto:d.manta@icloud.com"
            className="text-[#72d5c2] transition-opacity hover:opacity-80"
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
            }}
          >
            → d.manta@icloud.com
          </a>
        </div>
      </div>
    </section>
  );
}
