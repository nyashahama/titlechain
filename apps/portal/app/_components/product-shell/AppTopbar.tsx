"use client";

import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { TitlechainMark } from "@/app/_components/landing/shared/TitlechainMark";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Open navigation"
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-tc-border bg-tc-surface-subtle px-3 text-[12px] font-medium text-tc-text-muted transition-colors hover:text-tc-text"
              >
                <Menu className="size-4" aria-hidden="true" />
                <span>Navigate</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 border-tc-border bg-tc-surface p-2 text-tc-text shadow-xl"
            >
              {navigation.map((group, groupIndex) => (
                <div key={group.label}>
                  {groupIndex > 0 ? <DropdownMenuSeparator className="bg-tc-border" /> : null}
                  <DropdownMenuLabel className="px-2 py-2 text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.items.map((item) => {
                    const active = activeRoute === item.href;
                    const Icon = item.icon;

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium outline-none transition-colors",
                            active
                              ? "bg-white/[0.07] text-tc-text"
                              : "text-tc-text-muted hover:bg-white/[0.04] hover:text-tc-text",
                          )}
                        >
                          <Icon className="size-4 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
    </header>
  );
}
