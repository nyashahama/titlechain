"use client";

import { useState } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/app/_providers/auth-provider";
import { ProductPanel } from "@/app/_components/product/ProductPanel";
import { ProductStatusBadge } from "@/app/_components/product/ProductStatusBadge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";

const notificationPreferences = [
  { id: "completed", label: "Check completed", defaultChecked: true },
  { id: "stop", label: "Stop decisions", defaultChecked: true },
  { id: "weekly", label: "Weekly summary", defaultChecked: false },
  { id: "product", label: "Product updates", defaultChecked: true },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ReadOnlyField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-tc-text-muted">{label}</span>
      <input
        readOnly
        value={value}
        className={[
          "w-full cursor-not-allowed rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[13px] text-tc-text-muted outline-none",
          mono ? "font-mono" : "",
        ].join(" ")}
      />
    </label>
  );
}

export function SettingsSections() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const displayName = user?.display_name ?? "TitleChain User";
  const email = user?.email ?? "user@titlechain.local";
  const firmName = user?.organization.name ?? "TitleChain Workspace";
  const firmId = user?.organization.id ?? "FIRM-2025-001";
  const role = user?.role ?? "pilot_user";
  const roleLabel = role.replace(/_/g, " ");
  const initials = getInitials(displayName) || "TC";

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-4">
        <ProductPanel aria-labelledby="profile-settings-title" className="space-y-5">
          <div>
            <h2 id="profile-settings-title" className="text-sm font-medium text-tc-text">
              Profile
            </h2>
            <p className="mt-1 text-[13px] text-tc-text-muted">Account identity synced from the pilot workspace.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg border border-tc-border bg-tc-accent/10 text-sm font-semibold text-tc-accent">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-tc-text">{displayName}</p>
              <p className="truncate text-[13px] text-tc-text-muted">{email}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Full Name" value={displayName} />
            <ReadOnlyField label="Email" value={email} />
          </div>
        </ProductPanel>

        <ProductPanel aria-labelledby="firm-settings-title" className="space-y-5">
          <h2 id="firm-settings-title" className="text-sm font-medium text-tc-text">
            Firm
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadOnlyField label="Firm Name" value={firmName} />
            <ReadOnlyField label="Firm ID" value={firmId} mono />
          </div>
        </ProductPanel>

        <ProductPanel aria-labelledby="notification-settings-title" className="space-y-4">
          <h2 id="notification-settings-title" className="text-sm font-medium text-tc-text">
            Notifications
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {notificationPreferences.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2 text-[13px] text-tc-text"
              >
                <span>{item.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={item.defaultChecked}
                  className="size-4 rounded border-tc-border bg-tc-surface text-tc-accent accent-tc-accent"
                />
              </label>
            ))}
          </div>
        </ProductPanel>

        <ProductPanel aria-labelledby="security-settings-title" className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-tc-border bg-tc-surface-subtle text-tc-text-faint">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h2 id="security-settings-title" className="text-sm font-medium text-tc-text">
                Security
              </h2>
              <p className="mt-1 text-[13px] text-tc-text-muted">Session access is scoped to the current pilot organization.</p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">Role</dt>
              <dd className="mt-1 capitalize text-[13px] text-tc-text">{roleLabel}</dd>
            </div>
            <div className="rounded-md border border-tc-border bg-tc-surface-subtle px-3 py-2">
              <dt className="text-[11px] uppercase tracking-[0.08em] text-tc-text-faint">Access</dt>
              <dd className="mt-1 text-[13px] text-tc-text">{role === "pilot_admin" ? "Workspace and operations" : "Workspace"}</dd>
            </div>
          </dl>
        </ProductPanel>

        <ProductPanel aria-labelledby="danger-settings-title" className="border-tc-danger/30 bg-tc-danger/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="danger-settings-title" className="text-sm font-medium text-tc-danger">
                Danger
              </h2>
              <p className="mt-1 text-[13px] text-tc-text-muted">Account deletion requires confirmation.</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-tc-danger/40 px-3 text-[13px] font-medium text-tc-danger transition-colors hover:bg-tc-danger/10"
                >
                  <Trash2 className="size-4" />
                  Delete Account
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete account?</DialogTitle>
                  <DialogDescription>
                    This demo action is disabled, but production deletion must be confirmed before it can proceed.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="rounded-md border border-tc-border px-3 py-2 text-[13px] font-medium text-tc-text hover:bg-white/[0.05]"
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    type="button"
                    disabled
                    className="rounded-md bg-tc-danger px-3 py-2 text-[13px] font-medium text-white opacity-50"
                  >
                    Delete Account
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </ProductPanel>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <ProductPanel aria-labelledby="plan-settings-title" className="space-y-4">
          <h2 id="plan-settings-title" className="text-sm font-medium text-tc-text">
            Plan
          </h2>
          <div className="space-y-3 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-tc-text-muted">Current plan</span>
              <ProductStatusBadge label="Starter" tone="info" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-tc-text-muted">Checks / month</span>
              <span className="font-medium text-tc-text">50</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-tc-text-muted">Price</span>
              <span className="font-medium text-tc-text">R2,499/mo</span>
            </div>
          </div>
        </ProductPanel>

        <ProductPanel aria-labelledby="usage-settings-title" className="space-y-4">
          <h2 id="usage-settings-title" className="text-sm font-medium text-tc-text">
            Usage
          </h2>
          <div>
            <div className="mb-2 flex items-center justify-between text-[12px]">
              <span className="text-tc-text-muted">Checks used</span>
              <span className="font-medium text-tc-text">12 / 50</span>
            </div>
            <div className="h-2 overflow-hidden rounded-md bg-white/[0.05]">
              <div className="h-full rounded-md bg-tc-accent" style={{ width: "24%" }} />
            </div>
          </div>
        </ProductPanel>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-md bg-tc-accent px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-85"
        >
          {saved ? "Saved" : "Save Changes"}
        </button>
      </aside>
    </div>
  );
}
