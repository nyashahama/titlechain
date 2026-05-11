"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { StateView } from "@/app/_components/product/StateView";
import { useAuth } from "@/app/_providers/auth-provider";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/signin");
    }
  }, [isLoading, router, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-tc-bg text-tc-text">
        <StateView kind="loading" title="Loading workspace" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tc-bg text-tc-text lg:grid lg:grid-cols-[248px_1fr]">
      <AppSidebar user={user} onSignOut={signOut} />
      <div className="min-w-0">
        <AppTopbar user={user} onSignOut={signOut} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
