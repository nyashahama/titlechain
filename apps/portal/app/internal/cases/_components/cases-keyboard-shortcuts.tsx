"use client";

import { useRouter } from "next/navigation";
import { useKeyboardShortcuts } from "@/app/_hooks/use-keyboard-shortcuts";

export function CasesKeyboardShortcuts() {
  const router = useRouter();
  useKeyboardShortcuts([
    { key: "c", meta: true, action: () => router.push("/internal/cases/new") },
  ]);
  return null;
}
