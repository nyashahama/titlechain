import type { ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

export function ProductPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-tc-border bg-tc-surface p-5", className)}>
      {children}
    </section>
  );
}
