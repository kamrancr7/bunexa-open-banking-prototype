import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bunexa — Pakistan Open Banking Prototype",
  description:
    "A consent-led, bank-integrated connectivity prototype for normalized account information in Pakistan.",
  openGraph: {
    title: "Bunexa — One connection to Pakistan's financial data",
    description:
      "Explore the interactive account-linking, customer control and developer sandbox prototype.",
    type: "website",
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
