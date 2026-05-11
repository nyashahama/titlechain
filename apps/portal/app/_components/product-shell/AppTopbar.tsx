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

export function AppTopbar({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const pathname = usePathname();
  const activeRoute = resolveActiveProductRoute(pathname);
  const navigation = getVisibleProductNavigation(user.role);

  return (
    <header className="sticky top-0 z-20 border-b border-tc-border bg-tc-bg/95 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2 rounded-md">
          <TitlechainMark className="size-7 shrink-0 text-tc-text" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-tc-text">TitleChain</p>
            <p className="truncate text-[12px] text-tc-text-muted">
              {user.organization.name} workspace
            </p>
          </div>
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden min-w-0 text-right min-[420px]:block">
            <p className="truncate text-[12px] font-medium text-tc-text">{user.display_name}</p>
            <p className="truncate text-[11px] text-tc-text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-tc-border bg-tc-surface-subtle text-tc-text-muted transition-colors hover:text-tc-text"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav
        aria-label="Mobile product navigation"
        className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {navigation.flatMap((group) =>
          group.items.map((item) => {
            const active = activeRoute === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-[12px] font-medium transition-colors",
                  active
                    ? "border-tc-border-strong bg-white/[0.08] text-tc-text"
                    : "border-tc-border bg-tc-surface-subtle text-tc-text-muted hover:text-tc-text",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          }),
        )}
      </nav>
    </header>
  );
}
