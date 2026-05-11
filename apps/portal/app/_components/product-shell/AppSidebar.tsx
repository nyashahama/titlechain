"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { TitlechainMark } from "@/app/_components/landing/shared/TitlechainMark";
import { cn } from "@/app/_lib/cn";
import {
  getVisibleProductNavigation,
  resolveActiveProductRoute,
} from "@/app/_lib/product/navigation";
import type { User } from "@/app/_providers/auth-provider";

export function AppSidebar({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const pathname = usePathname();
  const activeRoute = resolveActiveProductRoute(pathname);
  const navigation = getVisibleProductNavigation(user.role);
  const initials = getInitials(user.display_name);

  return (
    <aside className="hidden min-h-screen flex-col border-r border-tc-border bg-tc-surface lg:flex">
      <div className="border-b border-tc-border px-4 py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 rounded-md px-2 py-1">
          <TitlechainMark className="size-6 text-tc-text" />
          <span className="text-sm font-semibold text-tc-text">TitleChain</span>
        </Link>
      </div>

      <nav aria-label="Product navigation" className="flex-1 space-y-6 px-3 py-5">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-tc-text-faint">
              {group.label}
            </p>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const active = activeRoute === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                      active
                        ? "border border-tc-border-strong bg-white/[0.07] text-tc-text"
                        : "text-tc-text-muted hover:bg-white/[0.04] hover:text-tc-text",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-tc-border p-3">
        <div className="mb-2 flex min-w-0 items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-tc-border bg-tc-surface-subtle text-[11px] font-semibold text-tc-text">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-tc-text">{user.display_name}</p>
            <p className="truncate text-[12px] text-tc-text-muted">{user.organization.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-tc-text-muted transition-colors hover:bg-white/[0.04] hover:text-tc-text"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
