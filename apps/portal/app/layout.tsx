import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./_providers/auth-provider";
import { AnimationProvider } from "@/app/_providers/animation-provider";
import { Toaster } from "sonner";
import { CommandPalette } from "@/app/_components/command-palette";
import { KeyboardShortcutsHelp } from "@/app/_components/keyboard-shortcuts-help";

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: "../../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TitleChain — Property Transaction Intelligence",
  description:
    "South Africa's property title intelligence platform. Verify titles, assess risk, and make Clear-to-Lodge decisions with confidence.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistMono.variable}>
      <body className="antialiased">
        <AuthProvider>
          <AnimationProvider>
            {children}
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
