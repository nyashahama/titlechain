import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/app/_components/product-shell/AppShell";

type SessionUser = {
  role?: string;
};

export default async function InternalLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");
  const apiBaseUrl = process.env.TITLECHAIN_API_BASE_URL ?? "http://localhost:8080";
  const response = await fetch(`${apiBaseUrl}/api/pilot/me`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!response.ok) {
    redirect("/auth/signin");
  }

  const user = (await response.json()) as SessionUser;

  if (user.role !== "pilot_admin") {
    redirect("/dashboard");
  }

  return <AppShell>{children}</AppShell>;
}
