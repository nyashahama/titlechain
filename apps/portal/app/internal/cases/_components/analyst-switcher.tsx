"use client";

import { Analyst } from "../types";

export function AnalystSwitcher({
  analysts,
  selected,
  onChange,
}: {
  analysts: Analyst[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="analyst" className="text-sm font-medium text-gray-700">
        Acting as:
      </label>
      <select
        id="analyst"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="block rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {analysts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.display_name}
          </option>
        ))}
      </select>
    </div>
  );
}
