"use client";

import { useAuth } from "../_providers/auth-provider";
import { Avatar } from "../internal/cases/_components/avatar";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 md:p-10 max-w-2xl animate-slide-in">
      <div className="mb-10">
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-foreground">Settings</h1>
        <p className="text-[14px] text-muted mt-1.5">Manage your account and firm preferences</p>
      </div>

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
          <div>
            <label className="block text-[11px] text-muted mb-1.5 font-medium">Firm Name</label>
            <input readOnly value={user?.firm_name || ""} className="w-full bg-card border border-border-light rounded-xl px-4 py-[9px] text-[13px] text-foreground opacity-50 cursor-not-allowed" />
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
    </div>
  );
}
