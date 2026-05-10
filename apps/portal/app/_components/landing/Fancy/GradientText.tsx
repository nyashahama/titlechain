import { type ReactNode } from "react";
import { cn } from "@/app/_lib/cn";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-linear-145 from-orange-300 to-white bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
