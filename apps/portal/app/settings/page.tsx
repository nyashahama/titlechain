"use client";

import { useAuth } from "../_providers/auth-provider";
import { Avatar } from "../internal/cases/_components/avatar";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-2xl animate-slide-in">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-foreground">Settings</h1>
        <p className="text-[13px] text-muted mt-1">Manage your account and firm details</p>
      </div>

      <div className="space-y-4">
        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Profile</h2>
          <div className="flex items-center gap-4 mb-6">
            <Avatar name={user?.display_name || "User"} size={48} />
            <div>
              <p className="text-[15px] font-medium text-foreground">{user?.display_name}</p>
              <p className="text-[13px] text-muted">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-muted mb-1.5">Full Name</label>
              <input
                readOnly
                value={user?.display_name || ""}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground opacity-60"
              />
            </div>
            <div>
              <label className="block text-[11px] text-muted mb-1.5">Email</label>
              <input
                readOnly
                value={user?.email || ""}
                className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Firm</h2>
          <div>
            <label className="block text-[11px] text-muted mb-1.5">Firm Name</label>
            <input
              readOnly
              value={user?.firm_name || ""}
              className="w-full bg-card border border-border-light rounded-lg px-3 py-[7px] text-[13px] text-foreground opacity-60"
            />
          </div>
        </div>

        <div className="border border-border rounded-2xl bg-card/20 p-6">
          <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[13px] text-foreground/80 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border-light bg-card text-foreground" />
              Email notifications for new decisions
            </label>
            <label className="flex items-center gap-3 text-[13px] text-foreground/80 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-border-light bg-card text-foreground" />
              Email notifications for flagged matters
            </label>
            <label className="flex items-center gap-3 text-[13px] text-foreground/80 cursor-pointer">
              <input type="checkbox" className="rounded border-border-light bg-card text-foreground" />
              Weekly summary email
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
