"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";
import { Button } from "@/app/_components/landing/shared/Button";
import { MobileNav } from "./MobileNav";
import { siteConfig } from "@/app/siteConfig";
import { cn } from "@/app/_lib/cn";
import { ChevronDown, Menu } from "lucide-react";

const navLinks = [
  { label: "Products", href: "#solutions", hasMenu: true },
  { label: "Security", href: "#security" },
  { label: "Coverage", href: "#coverage" },
  { label: "Pricing", href: "#pricing" },
  { label: "Enterprise", href: "#pricing" },
  { label: "Customers", href: "#case-studies" },
];

function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    let frame = 0;

    const updateTheme = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const probeY = 36;
        const lightSections = Array.from(
          document.querySelectorAll<HTMLElement>('[data-nav-theme="light"]')
        );
        const isOverLightSection = lightSections.some((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top <= probeY && rect.bottom > probeY;
        });
        const pricingRect = document.getElementById("pricing")?.getBoundingClientRect();
        const isPricingBridge = pricingRect
          ? pricingRect.top <= 80 && pricingRect.top > -140
          : false;

        setIsLight(isOverLightSection || isPricingBridge);
      });
    };

    updateTheme();
    window.addEventListener("scroll", updateTheme, { passive: true });
    window.addEventListener("resize", updateTheme);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateTheme);
      window.removeEventListener("resize", updateTheme);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#151518]/95 text-white backdrop-blur-xl transition-colors duration-200",
        isLight && "border-[#d8d8df] bg-[#ededf0]/95 text-[#1c1c20]"
      )}
    >
      <nav className="mx-auto flex h-[4.5rem] w-full max-w-[86.875rem] items-center justify-between px-5">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center">
            <TitlechainLogo
              className={cn("h-7 w-auto", isLight && "text-[#1c1c20]")}
            />
          </Link>

          <div className="hidden items-center gap-8 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1 text-[0.9375rem] font-medium text-white/64 transition-colors hover:text-white",
                  isLight && "text-[#4a4a52] hover:text-[#1c1c20]"
                )}
              >
                {link.label}
                {link.hasMenu ? (
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden="true" />
                ) : null}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <a
            href="https://github.com/nyashahama/titlechain"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-white/62 transition-colors hover:text-white",
              isLight && "text-[#5b5b64] hover:text-[#1c1c20]"
            )}
            target="_blank"
            rel="noreferrer"
            aria-label="TitleChain on GitHub"
          >
            <GithubMark className="size-5" />
            <span
              className={cn(
                "rounded bg-white/[0.12] px-1.5 py-0.5 leading-none text-white/86",
                isLight && "bg-black/[0.08] text-[#1c1c20]"
              )}
            >
              Pilot
            </span>
          </a>
          <Button
            href={siteConfig.baseLinks.signin}
            variant="text"
            className={cn(isLight && "text-[#5b5b64] hover:text-[#1c1c20]")}
          >
            Sign in
          </Button>
          <Button
            href={siteConfig.baseLinks.signin}
            variant="primary"
            className="h-11 rounded-lg px-5 text-[0.9375rem]"
          >
            Start project
          </Button>
        </div>

        <div className="flex items-center gap-3 xl:hidden">
          <Button
            href={siteConfig.baseLinks.signin}
            variant="primary"
            className="h-10 rounded-lg px-4 text-sm min-[380px]:h-11 min-[380px]:px-5 min-[380px]:text-[0.9375rem]"
          >
            Start project
          </Button>
          <button
            className={cn(
              "flex size-10 items-center justify-center rounded-lg text-white",
              isLight && "text-[#1c1c20]"
            )}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </nav>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </header>
  );
}
