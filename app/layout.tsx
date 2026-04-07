import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Cormorant_Garamond, Syne } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DMANTA – Portrait Photographer | Swiss Precision. African Soul.",
  description:
    "Daniel Manta is a portrait photographer based in Bern, Switzerland. Specializing in portrait photography, event photography and editorial work. Available for collaborations worldwide.",
  keywords: [
    "portrait photographer",
    "portrait fotograf",
    "fotograf bern",
    "portrait photography switzerland",
    "photographer bern",
    "swiss photographer",
    "editorial photographer",
    "event photographer switzerland",
    "dmanta",
  ],
  authors: [{ name: "Daniel Manta" }],
  creator: "Daniel Manta",
  openGraph: {
    title: "DMANTA – Portrait Photographer",
    description:
      "Swiss precision. African soul. Portrait and editorial photography by Daniel Manta, based in Bern, Switzerland.",
    url: "https://www.dmanta.ch",
    siteName: "DMANTA",
    images: [
      {
        url: "/images/hero.webp",
        width: 1200,
        height: 630,
        alt: "DMANTA – Portrait Photography",
      },
    ],
    locale: "de_CH",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMANTA – Portrait Photographer",
    description: "Swiss precision. African soul.",
    images: ["/images/hero.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://www.dmanta.ch"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${syne.variable} h-full`}
    >
      <body className={`${syne.className} min-h-full antialiased`}>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Daniel Manta",
              url: "https://www.dmanta.ch",
              image: "https://www.dmanta.ch/images/hero.webp",
              sameAs: ["https://www.instagram.com/1dmanta"],
              jobTitle: "Portrait Photographer",
              worksFor: {
                "@type": "Organization",
                name: "DMANTA",
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Bern",
                addressCountry: "CH",
              },
              description:
                "Portrait and editorial photographer based in Bern, Switzerland. Swiss precision. African soul.",
            }),
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
