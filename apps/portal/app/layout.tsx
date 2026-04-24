import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./_providers/auth-provider";
import { AnimationProvider } from "@/app/_providers/animation-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>
          <AnimationProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-card border border-border text-foreground",
              }}
            />
          </AnimationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
