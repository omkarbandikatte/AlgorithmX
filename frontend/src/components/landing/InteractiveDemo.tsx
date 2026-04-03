"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, MessageSquare, Repeat2, Trophy } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Pick a Topic",
    description: "Choose any subject or paste a concept you want to understand",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Ask Freely",
    description: "Ask in your own words — no rigid formats, no wrong questions",
  },
  {
    number: "03",
    icon: Brain,
    title: "AI Adapts",
    description: "The AI reads your level and tailors the explanation just for you",
  },
  {
    number: "04",
    icon: Repeat2,
    title: "Follow Up",
    description: "Dig deeper with contextual follow-ups until it truly clicks",
  },
  {
    number: "05",
    icon: Trophy,
    title: "Master It",
    description: "Track progress and revisit concepts to lock in long-term retention",
  },
];

export default function InteractiveDemo() {
  return (
    <section id="about" className="relative py-14 sm:py-20">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-start/3 rounded-full blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 space-y-4"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-accent-start">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Experience the{" "}
            <span className="gradient-text">Pulse</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto">
            Our AI doesn&apos;t just answer — it understands context, adapts to your
            level, and explains concepts the way{" "}
            <span className="text-text-primary font-medium">you</span> learn best.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[2.6rem] left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-px bg-border-subtle" />
                )}

                {/* Step number */}
                <p className="text-xs font-bold tracking-widest text-accent-start mb-3">
                  {step.number}
                </p>

                {/* Icon box */}
                <div className="w-16 h-16 rounded-2xl border border-border-subtle bg-bg-elevated flex items-center justify-center mb-4 group-hover:border-accent-start/40 group-hover:bg-accent-start/5 transition-colors duration-200">
                  <Icon size={24} className="text-text-secondary group-hover:text-accent-start transition-colors duration-200" />
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-text-primary mb-1.5">
                  {step.title}
                </p>

                {/* Description */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
