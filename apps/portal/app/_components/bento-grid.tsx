import { ReactNode } from "react";
import { motion } from "framer-motion";
import { staggerContainer, listItem } from "@/app/_lib/animations";

interface BentoGridProps {
  children: ReactNode;
}

export function BentoGrid({ children }: BentoGridProps) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function BentoGridItem({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={listItem}>
      {children}
    </motion.div>
  );
}
