"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface TimelineEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const eventIcons: Record<string, string> = {
  case_created: "+",
  property_match_confirmed: "✓",
  evidence_added: "📄",
  party_added: "👤",
  decision_recorded: "⚖",
  case_reopened: "↺",
  case_closed: "✕",
  assignee_changed: "→",
};

export function Timeline({ events }: TimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />

      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="relative"
          >
            {/* Dot */}
            <div className="absolute -left-6 top-1 w-[20px] h-[20px] rounded-full bg-card border border-border flex items-center justify-center text-[10px] text-muted z-10">
              {eventIcons[event.type] ?? "•"}
            </div>

            <div
              className="cursor-pointer"
              onClick={() => setExpanded(expanded === event.id ? null : event.id)}
            >
              <p className="text-[13px] text-foreground">{event.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {event.actor && <span className="text-[11px] text-muted">{event.actor}</span>}
                <span className="text-[11px] text-muted-more">
                  {new Date(event.timestamp).toLocaleString()}
                </span>
              </div>

              {expanded === event.id && event.metadata && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 p-3 bg-card rounded-lg border border-border"
                >
                  <pre className="text-[11px] text-muted-more font-mono overflow-x-auto">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
