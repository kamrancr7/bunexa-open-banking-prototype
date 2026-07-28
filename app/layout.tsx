import type { Metadata } from "next";
import "./globals.css";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://kamrancr7.github.io/bunexa-open-banking-prototype"
).replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title: "Bunexa — Complete Open Banking Platform Prototype",
  description:
    "Explore the complete Bunexa platform prototype: participant onboarding, consent, bank connectors, normalized APIs, operations and customer control.",
  openGraph: {
    title: "Bunexa — Consent-led bank connectivity",
    description:
      "The operating system for consent-led bank connectivity in Pakistan.",
    type: "website",
    images: [
      {
        url: `${siteUrl}/og.png`,
        width: 1731,
        height: 909,
        alt: "Bunexa complete open banking platform prototype",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bunexa — Consent-led bank connectivity",
    description:
      "The operating system for consent-led bank connectivity in Pakistan.",
    images: [`${siteUrl}/og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
