"use client";

import { motion } from "framer-motion";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative flex items-center pt-28 pb-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-start/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-end/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-start/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-center">
          {/* Center — Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-8 text-center max-w-3xl"
          >
            <Badge>Intelligent Education</Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
              Next-Gen{" "}
              <span className="gradient-text">AI Learning</span>
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed max-w-lg mx-auto">
              Multilingual. Offline. Intelligent. Experience an adaptive-grade AI
              education platform designed for the next generation.
            </p>

            <div className="flex justify-center">
              <Link href="/dashboard">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Begin Your Journey
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-2 justify-center">
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
        </div>
      </div>
    </section>
  );
}
