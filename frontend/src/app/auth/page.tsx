"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, signInWithGoogle, signInWithGithub, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-8 h-8 border-4 border-accent-start border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg-primary text-text-primary overflow-hidden">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-primary to-bg-surface" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-start/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-end/8 rounded-full blur-[100px]" />

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
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Rakshak <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-start to-accent-end">AI</span>
          </h1>
          <p className="text-text-secondary leading-relaxed">
            Personalized learning path powered by generative AI. Master any subject with your own private tutor.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {["Multilingual", "Offline Ready", "Adaptive AI"].map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-xs font-medium rounded-full border border-border-subtle text-text-secondary bg-hover-bg">
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
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold">Rakshak AI</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {isLogin ? "Sign in to continue learning" : "Join our community of students"}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-hover-bg hover:border-accent-start/30 text-sm font-medium transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <button 
              onClick={signInWithGithub}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border-subtle bg-hover-bg hover:border-accent-start/30 text-sm font-medium transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-subtle" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-primary px-2 text-text-secondary">or</span></div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && <Input label="Full Name" placeholder="Student name" icon={<User size={16} />} />}
            <Input label="Email" placeholder="you@edu.com" icon={<Mail size={16} />} />
            <Input label="Password" type="password" placeholder="••••••••" icon={<Lock size={16} />} />
            <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={18} />} type="button" onClick={() => router.push('/dashboard')}>
              {isLogin ? "Sign In" : "Get Started"}
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            {isLogin ? "New to Rakshak?" : "Already joined?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-accent-start hover:underline font-semibold cursor-pointer">
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
