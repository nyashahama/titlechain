"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "error";

export function CopyAction({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimeout = useRef<number | null>(null);

  function scheduleReset() {
    if (resetTimeout.current) {
      window.clearTimeout(resetTimeout.current);
    }

    resetTimeout.current = window.setTimeout(() => {
      setCopyState("idle");
      resetTimeout.current = null;
    }, 1400);
  }

  useEffect(() => {
    return () => {
      if (resetTimeout.current) {
        window.clearTimeout(resetTimeout.current);
      }
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }

    scheduleReset();
  }

  const Icon = copyState === "copied" ? Check : Copy;
  const statusLabel = copyState === "copied" ? "Copied" : copyState === "error" ? "Copy failed" : label;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex size-7 items-center justify-center rounded-md text-tc-text-faint hover:bg-white/[0.05] hover:text-tc-text"
      aria-label={statusLabel}
      title={statusLabel}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
