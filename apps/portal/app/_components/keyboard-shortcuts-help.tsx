"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const shortcuts = [
  { keys: ["CMD/CTRL", "K"], action: "Open command palette" },
  { keys: ["?"], action: "Show this help" },
  { keys: ["G", "C"], action: "Go to Cases" },
  { keys: ["G", "P"], action: "Go to Properties" },
  { keys: ["G", "R"], action: "Go to Runs" },
  { keys: ["N", "C"], action: "New Case" },
  { keys: ["J", "K"], action: "Navigate list items" },
  { keys: ["Enter"], action: "Open selected item" },
  { keys: ["Esc"], action: "Close modal / dropdown" },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-[480px] mx-4 bg-[#141414] border border-border rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[18px] font-semibold text-foreground mb-1">Keyboard Shortcuts</h2>
            <p className="text-[13px] text-muted mb-6">Navigate TitleChain without touching your mouse.</p>
            <div className="space-y-2">
              {shortcuts.map((s) => (
                <div key={s.action} className="flex items-center justify-between py-2">
                  <span className="text-[13px] text-foreground">{s.action}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span key={k} className="flex items-center gap-1">
                        <kbd className="px-1.5 py-[2px] rounded bg-card border border-border text-[11px] font-mono text-muted">{k}</kbd>
                        {i < s.keys.length - 1 && <span className="text-muted text-[11px]">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full py-2 text-[13px] text-muted hover:text-foreground transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
