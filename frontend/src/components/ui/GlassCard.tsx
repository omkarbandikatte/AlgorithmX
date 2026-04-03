"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  hover?: boolean;
  glowOnHover?: boolean;
  className?: string;
}

export default function GlassCard({
  children,
  hover = true,
  glowOnHover = false,
  className = "",
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`glass-card p-6 transition-all duration-300 ${
        glowOnHover
          ? "hover:border-accent-start/30 hover:shadow-[0_0_30px_rgba(255,122,24,0.08)]"
          : "hover:border-border-subtle"
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
