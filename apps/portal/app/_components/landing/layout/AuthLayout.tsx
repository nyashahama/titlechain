"use client";

import Link from "next/link";
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";
import { GradientText } from "@/app/_components/landing/Fancy";

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
      {/* Gradient blur backgrounds (matching Console's unauthenticated layout) */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* Teal/mint blur top-right */}
        <div
          className="absolute top-0 right-0 size-[500px] translate-x-1/4 -translate-y-1/4 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(167, 243, 208, 0.3) 0%, rgba(167, 243, 208, 0) 70%)",
            filter: "blur(150px)",
          }}
        />
        {/* Orange blur bottom-left */}
        <div
          className="absolute bottom-0 left-0 size-[600px] -translate-x-1/4 translate-y-1/4 opacity-25"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(254, 149, 103, 0.4) 28%, rgba(253, 54, 110, 0.25) 59%, rgba(253, 54, 110, 0) 100%)",
            filter: "blur(200px)",
          }}
        />
      </div>

      <div className="relative z-10 grid w-full grid-cols-1 lg:grid-cols-2">
        {/* Left column — branding */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-8 lg:flex xl:p-12">
          {/* Logo */}
          <Link href="/" className="inline-block">
            <TitlechainLogo className="h-8 w-auto text-white" />
          </Link>

          {/* Tagline */}
          <div className="flex flex-col gap-4">
            <GradientText className="block">
              <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl xl:leading-tight">
                Property title
                <br />
                intelligence,
                <br />
                instantly<span className="text-orange-500">_</span>
              </h1>
            </GradientText>
            {subtitle && (
              <p className="max-w-md text-base text-white/45">{subtitle}</p>
            )}
          </div>

          {/* Dashboard screenshot background */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='1'%3E%3Cpath d='M36 0L0 36M60 24L24 60M60 36L36 60' stroke-dasharray='2 2'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
            aria-hidden="true"
          />
        </div>

        {/* Right column — form */}
        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
          <div className="w-full max-w-[27.5rem] animate-fade-in">
            {/* Mobile logo (hidden on desktop) */}
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
