"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/app/_lib/cn";

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  icon?: React.ReactNode;
  color?: string;
}

export function FilterChip({ label, value, onRemove, icon, color }: FilterChipProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium",
        "border border-border bg-card/50"
      )}
      style={color ? { borderColor: `${color}30`, backgroundColor: `${color}10`, color } : undefined}
    >
      {icon}
      {label}
      <button
        type="button"
        onClick={() => onRemove(value)}
        className="ml-0.5 rounded-full p-0.5 hover:bg-white/[0.08] transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

interface FilterChipGroupProps {
  children: React.ReactNode;
  onClearAll?: () => void;
  hasFilters: boolean;
  className?: string;
}

export function FilterChipGroup({ children, onClearAll, hasFilters, className }: FilterChipGroupProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      {hasFilters && onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-[11px] text-muted hover:text-foreground transition-colors px-2 py-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

interface FilterSelectProps {
  filters: { key: string; label: string; icon?: React.ReactNode }[];
  activeFilters: string[];
  onSelect: (key: string) => void;
  onRemove: (key: string) => void;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({ filters, activeFilters, onSelect, onRemove, placeholder = "Filter", className }: FilterSelectProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <FilterChipGroup hasFilters={activeFilters.length > 0} onClearAll={() => activeFilters.forEach(onRemove)}>
        {activeFilters.map((key) => {
          const filter = filters.find((f) => f.key === key);
          if (!filter) return null;
          return (
            <FilterChip
              key={key}
              label={filter.label}
              value={key}
              icon={filter.icon}
              onRemove={onRemove}
            />
          );
        })}
      </FilterChipGroup>
      <div className="relative">
        <select
          value=""
          onChange={(e) => e.target.value && onSelect(e.target.value)}
          className={cn(
            "appearance-none bg-transparent border border-border rounded-lg px-3 py-1.5 pr-8 text-[12px] text-muted cursor-pointer",
            "hover:border-border-light hover:text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <option value="" disabled>{placeholder}</option>
          {filters
            .filter((f) => !activeFilters.includes(f.key))
            .map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}
