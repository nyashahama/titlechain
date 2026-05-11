"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyAction({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex size-7 items-center justify-center rounded-md text-tc-text-faint hover:bg-white/[0.05] hover:text-tc-text"
      aria-label={label}
      title={label}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
