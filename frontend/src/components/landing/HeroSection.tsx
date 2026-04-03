"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-start/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-end/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-start/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8"
          >
            <Badge>Intelligent Education</Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Next-Gen{" "}
              <span className="gradient-text">AI Learning</span>
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
              Multilingual. Offline. Intelligent. Experience an adaptive-grade AI
              education platform designed for the next generation.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Start Learning
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" icon={<Sparkles size={18} />}>
                  Try AI Doubt Solver
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-bg-primary bg-bg-elevated flex items-center justify-center text-xs font-medium text-text-secondary"
                  >
                    {["A", "K", "R", "S"][i]}
                  </div>
                ))}
              </div>
              <div className="text-sm text-text-secondary">
                <span className="text-text-primary font-semibold">2,400+</span> learners
                already onboard
              </div>
            </div>
          </motion.div>

          {/* Right — Mock Chat UI */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="animate-float">
              <div className="glass-card p-5 max-w-md ml-auto">
                {/* Chat header */}
                <div className="flex items-center gap-3 pb-4 border-b border-border-subtle mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      AI Doubt Solver
                    </p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Online
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-accent-start/10 border border-accent-start/20 rounded-xl rounded-br-sm px-4 py-2.5 max-w-[80%]">
                      <p className="text-sm text-text-primary">
                        Explain quantum entanglement simply
                      </p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="bg-bg-elevated border border-border-subtle rounded-xl rounded-bl-sm px-4 py-2.5 max-w-[85%]">
                      <p className="text-sm text-text-secondary leading-relaxed">
                        Imagine two coins that always land on opposite sides — no
                        matter how far apart. That&apos;s entanglement! Two particles
                        become linked, sharing their state instantly.
                      </p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex justify-start">
                    <div className="bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-secondary/50">
                    Ask anything...
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0 cursor-pointer">
                    <ArrowRight size={16} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 opacity-20">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent-start"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
