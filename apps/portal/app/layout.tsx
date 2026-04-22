import type { Metadata } from "next";
import { Playfair_Display, DM_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TitleChain — Property Transaction Intelligence",
  description:
    "South Africa's first normalized, queryable, historically versioned property intelligence layer — built for conveyancers, banks, and insurers who need to know before they commit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmMono.variable} ${instrumentSans.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
