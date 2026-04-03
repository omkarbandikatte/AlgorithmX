"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-3.5 text-base gap-2.5",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-start/50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-gradient-to-r from-accent-start to-accent-end text-white shadow-lg shadow-accent-start/20 hover:shadow-xl hover:shadow-accent-start/30 hover:brightness-110 active:scale-[0.97]",
    secondary:
      "bg-transparent border border-border-subtle text-text-primary hover:border-accent-start/40 hover:bg-accent-start/5 active:scale-[0.97]",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 active:scale-[0.97]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
