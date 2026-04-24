"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LogViewerProps {
  logs: string[];
}

export function LogViewer({ logs }: LogViewerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-[11px] text-muted hover:text-foreground transition-colors flex items-center gap-1"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expanded ? "rotate-90" : ""}`}>
          <path d="M9 18l6-6-6-6" />
        </svg>
        {expanded ? "Hide" : "Show"} logs ({logs.length} lines)
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-card rounded-xl border border-border font-mono text-[11px] text-muted-more max-h-[200px] overflow-y-auto space-y-0.5">
              {logs.map((log, i) => (
                <div key={i} className="truncate">{log}</div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
