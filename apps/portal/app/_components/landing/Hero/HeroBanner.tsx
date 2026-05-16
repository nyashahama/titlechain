import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroBannerProps {
  title: string;
  href: string;
}

export function HeroBanner({ title, href }: HeroBannerProps) {
  return (
    <Link
      href={href}
      className="group relative mb-4 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white/90"
    >
      <Sparkles className="size-3.5 shrink-0 text-indigo-400" aria-hidden="true" />
      <span className="h-3 w-px bg-white/[0.12]" aria-hidden="true" />
      <span>{title}</span>
      <ArrowRight className="size-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden="true" />
    </Link>
  );
}
