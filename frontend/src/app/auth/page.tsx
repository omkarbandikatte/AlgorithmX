"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-primary to-bg-surface" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-start/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-end/6 rounded-full blur-[100px]" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 max-w-md px-12 text-center space-y-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Rakshak{" "}
            <span className="gradient-text">AI</span>
          </h1>
          <p className="text-text-secondary leading-relaxed">
            The next generation of AI-powered education. Learn smarter, not
            harder — with adaptive intelligence that grows with you.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {["Multilingual", "Offline Ready", "Adaptive AI"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-border-subtle text-text-secondary bg-white/2"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">
              Rakshak <span className="gradient-text">AI</span>
            </span>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {isLogin
                ? "Sign in to continue your learning journey"
                : "Join thousands of learners on Rakshak AI"}
            </p>
          </div>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-white/[0.02] hover:bg-white/[0.05] text-sm font-medium text-text-primary transition-all duration-200 cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-primary px-3 text-text-secondary">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
              onSubmit={(e) => e.preventDefault()}
            >
              {!isLogin && (
                <Input
                  label="Full Name"
                  placeholder="Enter your name"
                  type="text"
                  icon={<User size={16} />}
                />
              )}
              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                icon={<Mail size={16} />}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                type="password"
                icon={<Lock size={16} />}
              />

              {isLogin && (
                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-xs text-accent-start hover:text-accent-end transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              <Link href="/dashboard" className="block pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<ArrowRight size={18} />}
                  type="button"
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Button>
              </Link>
            </motion.form>
          </AnimatePresence>

          {/* Toggle */}
          <p className="text-center text-sm text-text-secondary">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-start hover:text-accent-end font-medium transition-colors cursor-pointer"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
