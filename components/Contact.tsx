export function Contact() {
  return (
    <section
      className="bg-[#0a0a0a] text-center"
      style={{ padding: "8rem 2rem" }}
      aria-label="Contact"
    >
      <h2
        className="font-display font-medium not-italic text-[#F5F0E8]"
        style={{ fontSize: "4rem", fontStyle: "normal" }}
      >
        Let&apos;s work together.
      </h2>

      <p
        className="mt-8 font-sans font-medium uppercase tracking-[0.2em] text-[#666]"
        style={{
          fontSize: "0.8rem",
          marginTop: "2rem",
        }}
      >
        <a
          href="mailto:d.manta@icloud.com"
          className="text-[#F5F0E8] transition-colors duration-300 hover:text-[#72d5c2]"
        >
          d.manta@icloud.com
        </a>
        <span className="text-[#666]"> · </span>
        <a
          href="https://instagram.com/1dmanta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[#F5F0E8] transition-colors duration-300 hover:text-[#72d5c2]"
          style={{ gap: "0.4rem" }}
        >
          <span className="inline-flex shrink-0 text-white" aria-hidden>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
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
        <span className="text-[#666]"> · </span>
        <a
          href="https://unsplash.com/@1dmanta"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-[#F5F0E8] transition-colors duration-300 hover:text-[#72d5c2]"
          style={{ gap: "0.4rem" }}
        >
          <span className="inline-flex shrink-0 text-white" aria-hidden>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={14} height={14} fill="currentColor">
              <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z" />
            </svg>
          </span>
          @1dmanta
        </a>
      </p>
    </section>
  );
}
