"use client";

import { motion } from "framer-motion";
import { Card } from "./ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  className?: string;
}

export function MetricCard({ label, value, delta, deltaPositive, className = "" }: MetricCardProps) {
  return (
    <Card className={`p-5 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.1em] text-muted font-medium mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <motion.p
          className="text-[28px] font-bold text-foreground tracking-[-0.03em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {value}
        </motion.p>
        {delta && (
          <span className={`text-[12px] font-medium mb-1.5 ${deltaPositive ? "text-success" : "text-accent"}`}>
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
