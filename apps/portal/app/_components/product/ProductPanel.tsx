import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/app/_lib/cn";

export function ProductPanel({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section {...props} className={cn("rounded-lg border border-tc-border bg-tc-surface p-5", className)}>
      {children}
    </section>
  );
}
