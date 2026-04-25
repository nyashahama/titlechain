"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback(async (value: string, message = "Copied to clipboard") => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(message);
      timer.current = setTimeout(() => setCopied(false), timeout);
    } catch {
      toast.error("Failed to copy");
    }
  }, [timeout]);

  useEffect(() => () => clearTimeout(timer.current), []);
  return { copied, copy };
}
