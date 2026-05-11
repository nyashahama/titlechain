"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TitlechainLogo } from "@/app/_components/landing/shared/TitlechainLogo";
import { Button } from "@/app/_components/landing/shared/Button";
import { MobileNav } from "./MobileNav";
import { siteConfig } from "@/app/siteConfig";
import { cn } from "@/app/_lib/cn";
import { Menu } from "lucide-react";

const navLinks = [
  { label: "Solutions", href: "#solutions" },
  { label: "Security", href: "#security" },
  { label: "Coverage", href: "#coverage" },
  { label: "Pricing", href: "#pricing" },
];

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-black/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <TitlechainLogo className="h-8 w-auto" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button href={siteConfig.baseLinks.signin} variant="text">
            Sign in
          </Button>
          <Button href={siteConfig.baseLinks.signin} variant="primary">
            Get started
          </Button>
        </div>

        <button
          className="flex size-10 items-center justify-center rounded-lg md:hidden"
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
