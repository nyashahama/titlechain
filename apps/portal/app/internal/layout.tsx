import type { ReactNode } from "react";
import { AppShell } from "@/app/_components/product-shell/AppShell";
import { requirePilotAdmin } from "@/app/_lib/product/server-auth";

export default async function InternalLayout({ children }: { children: ReactNode }) {
  await requirePilotAdmin();
  return <AppShell>{children}</AppShell>;
}
