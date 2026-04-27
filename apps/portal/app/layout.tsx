import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./_providers/auth-provider";
import { AnimationProvider } from "@/app/_providers/animation-provider";
import { Toaster } from "sonner";
import { CommandPalette } from "@/app/_components/command-palette";
import { KeyboardShortcutsHelp } from "@/app/_components/keyboard-shortcuts-help";
import { LandingChrome } from "@/app/_components/solar/landing-chrome";

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
    "South Africa's property title intelligence platform. Verify titles, assess risk, and make Clear-to-Lodge decisions with confidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="overflow-x-hidden scroll-auto bg-gray-50 antialiased">
        <AuthProvider>
          <AnimationProvider>
            <LandingChrome>
              {children}
            </LandingChrome>
            <CommandPalette />
            <KeyboardShortcutsHelp />
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
