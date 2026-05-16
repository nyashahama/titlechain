"use client";

import Link from "next/link";
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";
import { ParcelIntelligenceVisual } from "./ParcelIntelligenceVisual";

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen max-w-screen items-stretch overflow-hidden bg-black text-white">
      <div
        data-testid="auth-mobile-atmosphere"
        className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-30 lg:hidden"
        aria-hidden="true"
      >
        <ParcelIntelligenceVisual compact testId="parcel-intelligence-visual-mobile" />
      </div>

      <div
        data-testid="auth-shell"
        className="relative z-10 grid w-full grid-cols-1 lg:grid-cols-2"
      >
        <div className="relative hidden min-h-screen overflow-hidden lg:block">
          <ParcelIntelligenceVisual />
        </div>

        <div className="relative flex items-center justify-center p-6 pt-14 sm:p-8 lg:p-12 xl:p-16">
          <div
            data-testid="auth-form-panel"
            className="w-full max-w-[27.5rem] animate-fade-in"
          >
            <div className="mb-8 flex justify-center lg:hidden">
              <Link href="/">
                <TitlechainLogo className="h-7 w-auto text-white" />
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-white/45">{subtitle}</p>
              )}
            </div>

            {children}

            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
