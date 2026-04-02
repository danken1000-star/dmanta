import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Syne } from "next/font/google";
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
  title: 'DMANTA',
  description: 'Swiss precision. African soul.',
  icons: {
    icon: '/favicon.svg',
  },
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
      </body>
    </html>
  );
}
