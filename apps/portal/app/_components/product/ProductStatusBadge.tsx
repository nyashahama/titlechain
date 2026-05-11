import { cn } from "@/app/_lib/cn";
import type { ProductTone } from "@/app/_lib/product/status";

const toneClass: Record<ProductTone, string> = {
  muted: "border-tc-border bg-white/[0.03] text-tc-text-muted",
  info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  danger: "border-red-400/20 bg-red-400/10 text-red-200",
};

export function ProductStatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: ProductTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md border px-2 text-[11px] font-medium leading-none",
        toneClass[tone],
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
