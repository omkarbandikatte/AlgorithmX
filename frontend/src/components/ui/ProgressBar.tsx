"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  return (
    <div className={`w-full space-y-2 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-text-secondary">{label}</span>}
          {showPercentage && (
            <span className="text-text-primary font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="h-full rounded-full bg-gradient-to-r from-accent-start to-accent-end"
        />
      </div>
    </div>
  );
}
