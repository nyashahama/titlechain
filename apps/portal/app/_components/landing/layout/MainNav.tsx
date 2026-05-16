"use client";

import { useState } from "react";
import Link from "next/link";
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";
import { Button } from "@/app/_components/landing/shared/Button";
import { MobileNav } from "./MobileNav";
import { siteConfig } from "@/app/siteConfig";
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-[#151518]/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 w-full max-w-[86.875rem] items-center justify-between px-5">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center">
            <TitlechainLogo className="h-7 w-auto" />
          </Link>

          <div className="hidden items-center gap-8 xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 text-[0.9375rem] font-medium text-white/64 transition-colors hover:text-white"
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
            className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm font-medium text-white/62 transition-colors hover:text-white"
            target="_blank"
            rel="noreferrer"
            aria-label="TitleChain on GitHub"
          >
            <GithubMark className="size-5" />
            <span className="rounded bg-white/[0.12] px-1.5 py-0.5 leading-none text-white/86">
              Pilot
            </span>
          </a>
          <Button href={siteConfig.baseLinks.signin} variant="text">
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

        <button
          className="flex size-10 items-center justify-center rounded-lg text-white xl:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </nav>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} links={navLinks} />
    </header>
  );
}
