import { cn } from "@/app/_lib/cn";

interface GridPaperProps {
  className?: string;
}

export function GridPaper({ className }: GridPaperProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.03'%3E%3Cpath d='M36 0L0 36M60 24L24 60M60 36L36 60' stroke-dasharray='2 2'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}
