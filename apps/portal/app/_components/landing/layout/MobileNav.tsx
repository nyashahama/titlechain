"use client";

import Link from "next/link";
import { Button } from "@/app/_components/landing/shared/Button";
import { siteConfig } from "@/app/siteConfig";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/app/_lib/cn";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}

export function MobileNav({ open, onClose, links }: MobileNavProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 w-72 border-l border-white/[0.06] bg-black p-6 transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-medium text-white/60">Menu</span>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={onClose}
              className="text-base text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex flex-col gap-3">
          <Button href={siteConfig.baseLinks.signin} variant="secondary">
            Sign in
          </Button>
          <Button href={siteConfig.baseLinks.signin}>
            Get started
          </Button>
        </div>
      </div>
    </>
  );
}
