import { cn } from "@/app/_lib/cn";
import type { ProductTone } from "@/app/_lib/product/status";

const toneClass: Record<ProductTone, string> = {
  muted: "border-tc-border bg-white/[0.03] text-tc-text-muted",
  info: "border-tc-info/30 bg-tc-info/10 text-tc-info",
  success: "border-tc-success/30 bg-tc-success/10 text-tc-success",
  warning: "border-tc-warning/30 bg-tc-warning/10 text-tc-warning",
  danger: "border-tc-danger/30 bg-tc-danger/10 text-tc-danger",
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
