"use client";

import { useState } from "react";
import { useAuth } from "../_providers/auth-provider";
import { Avatar } from "../internal/cases/_components/avatar";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10 animate-slide-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[28px] font-bold tracking-[-0.03em] text-foreground">Settings</h1>
        <p className="text-[13px] text-muted mt-1">Manage your account and firm preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Main */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={user?.display_name || "User"} size={52} />
              <div>
                <p className="text-[16px] font-semibold text-foreground">{user?.display_name}</p>
                <p className="text-[13px] text-muted">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-muted mb-1.5 font-medium">Full Name</label>
                <input readOnly value={user?.display_name || ""} className="w-full bg-card border border-border-light rounded-xl px-4 py-[9px] text-[13px] text-foreground opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-1.5 font-medium">Email</label>
                <input readOnly value={user?.email || ""} className="w-full bg-card border border-border-light rounded-xl px-4 py-[9px] text-[13px] text-foreground opacity-50 cursor-not-allowed" />
              </div>
            </div>
          </div>

          {/* Firm */}
          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Firm</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-muted mb-1.5 font-medium">Firm Name</label>
                <input readOnly value={user?.firm_name || ""} className="w-full bg-card border border-border-light rounded-xl px-4 py-[9px] text-[13px] text-foreground opacity-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[11px] text-muted mb-1.5 font-medium">Firm ID</label>
                <input readOnly value="FIRM-2025-001" className="w-full bg-card border border-border-light rounded-xl px-4 py-[9px] text-[13px] text-foreground opacity-50 cursor-not-allowed font-mono" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="border border-border rounded-2xl bg-card/20 p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-5">Notifications</h2>
            <div className="space-y-3">
              {[
                { label: "Email me when a check completes", defaultChecked: true },
                { label: "Email me for Stop decisions", defaultChecked: true },
                { label: "Weekly summary of all matters", defaultChecked: false },
                { label: "Product updates and announcements", defaultChecked: true },
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-3 text-[13px] text-foreground/80 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    defaultChecked={item.defaultChecked}
                    className="w-4 h-4 rounded border-border-light bg-card text-foreground accent-foreground"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border border-[rgba(239,68,68,0.15)] rounded-2xl bg-[rgba(239,68,68,0.03)] p-6">
            <h2 className="text-[11px] uppercase tracking-[0.12em] text-red-400 font-semibold mb-5">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-foreground">Delete account</p>
                <p className="text-[12px] text-muted mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button className="px-4 py-[7px] rounded-full text-[12px] font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Plan</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Current plan</span>
                <span className="text-foreground font-medium">Starter</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Checks / month</span>
                <span className="text-foreground font-medium">50</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted">Price</span>
                <span className="text-foreground font-medium">R2,499/mo</span>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-2xl bg-card/20 p-5">
            <h3 className="text-[11px] uppercase tracking-[0.12em] text-muted font-semibold mb-4">Usage</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-muted">Checks used</span>
                  <span className="text-foreground font-medium">12 / 50</span>
                </div>
                <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#4ade80]" style={{ width: "24%" }} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-foreground text-background text-[13px] font-medium px-4 py-[9px] rounded-full transition-opacity duration-200 hover:opacity-80"
          >
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
