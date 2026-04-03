"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  type,
  className = "",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full rounded-xl border border-border-subtle bg-bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 transition-all duration-200 focus:outline-none focus:border-accent-start/50 focus:ring-1 focus:ring-accent-start/20 focus:bg-bg-elevated/50 ${
            icon ? "pl-10" : ""
          } ${isPassword ? "pr-10" : ""} ${
            error ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20" : ""
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
