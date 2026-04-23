"use client";

import { Analyst } from "../types";

export function AnalystSwitcher({
  analysts,
  selected,
  onChange,
}: {
  analysts: Analyst[];
  selected: string;
  onChange?: (id: string) => void;
}) {
  const handleChange = onChange ?? (() => {});
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="analyst" className="text-[13px] text-muted">
        Acting as
      </label>
      <select
        id="analyst"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-card border border-border-light rounded-lg px-3 py-[6px] text-[13px] text-foreground focus:outline-none focus:border-border-light/50 transition-colors"
      >
        <option value="" className="bg-card">All analysts</option>
        {analysts.map((a) => (
          <option key={a.id} value={a.id} className="bg-card">
            {a.display_name}
          </option>
        ))}
      </select>
    </div>
  );
}
