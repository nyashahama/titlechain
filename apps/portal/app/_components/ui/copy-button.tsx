"use client";
import { Check, Copy } from "lucide-react";
import { cn } from "@/app/_lib/cn";
import { useCopyToClipboard } from "@/app/_lib/use-copy-to-clipboard";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "sm" | "md";
  message?: string;
}

export function CopyButton({ value, className, size = "sm", message }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); copy(value, message); }}
      className={cn(
        "rounded-md p-1 transition-all hover:bg-white/[0.08]",
        copied && "text-success",
        !copied && "text-muted",
        className
      )}
      title="Copy to clipboard"
    >
      <span className="sr-only">Copy</span>
      {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
    </button>
  );
}
