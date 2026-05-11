import type { ReactNode } from "react";
import { AppShell } from "@/app/_components/product-shell/AppShell";

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
