"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Command as CommandIcon } from "lucide-react";
import { cn } from "@/app/_lib/cn";

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  type: "case" | "property" | "run" | "action";
  href?: string;
  icon?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [items] = useState<PaletteItem[]>([
    { id: "new-case", title: "New Case", type: "action", href: "/internal/cases/new" },
    { id: "go-cases", title: "Go to Cases", type: "action", href: "/internal/cases" },
    { id: "go-properties", title: "Go to Properties", type: "action", href: "/internal/properties" },
    { id: "go-runs", title: "Go to Runs", type: "action", href: "/internal/ops/runs" },
    { id: "sync-props", title: "Sync Properties", type: "action" },
  ]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [open]);

  const handleSelect = useCallback(
    (item: PaletteItem) => {
      setOpen(false);
      if (item.href) {
        router.push(item.href);
      }
      if (item.id === "sync-props") {
        // Will integrate with actual API call later
        console.log("Trigger sync");
      }
    },
    [router]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          )}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[640px] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Command
              className={cn(
                "bg-popover border border-border rounded-2xl overflow-hidden shadow-2xl"
              )}
            >
              <div className="flex items-center border-b border-border px-4">
                <Search className="h-4 w-4 text-muted mr-3 shrink-0" />
                <Command.Input
                  placeholder="Search cases, properties, runs, or actions..."
                  className={cn(
                    "w-full bg-transparent py-4 text-sm text-foreground placeholder:text-muted outline-none"
                  )}
                />
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted ml-3">
                  <CommandIcon className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>
              <Command.List className="max-h-[400px] overflow-y-auto py-2">
                <Command.Empty className="px-4 py-8 text-center text-[13px] text-muted">
                  No results found.
                </Command.Empty>
                <Command.Group heading="Actions" className="px-2">
                  {items.filter((i) => i.type === "action").map((item) => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => handleSelect(item)}
                      className={cn(
                        "px-3 py-2.5 rounded-lg text-[13px] text-foreground cursor-pointer flex items-center gap-3",
                        "hover:bg-white/[0.05] data-[selected=true]:bg-white/[0.08]"
                      )}
                    >
                      <span className="text-muted">
                        {item.icon || <ArrowRight className="h-3.5 w-3.5" />}
                      </span>
                      {item.title}
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
              <div className="border-t border-border px-4 py-2.5 flex items-center gap-4 text-[11px] text-muted">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
