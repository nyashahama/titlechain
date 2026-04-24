"use client";

import { motion } from "framer-motion";

const stages = ["pending", "running", "completed"] as const;

interface PipelineSwimlaneProps {
  status: string;
}

export function PipelineSwimlane({ status }: PipelineSwimlaneProps) {
  const currentIndex = stages.indexOf(status as typeof stages[number]);

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => {
        const isActive = i <= currentIndex && currentIndex >= 0;
        const isCurrent = i === currentIndex;

        return (
          <div key={stage} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <motion.div
                className={`w-3 h-3 rounded-full ${isActive ? "bg-success" : "bg-border"}`}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
              />
              <span className="text-[10px] text-muted capitalize">{stage}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={`w-8 h-[2px] ${isActive && i < currentIndex ? "bg-success" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
