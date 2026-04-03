"use client";

import { motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";

const messages = [
  {
    role: "user" as const,
    content: "What is the difference between TCP and UDP?",
  },
  {
    role: "ai" as const,
    content:
      "Great question! TCP (Transmission Control Protocol) is connection-oriented — it ensures reliable, ordered delivery of data. UDP (User Datagram Protocol) is connectionless — it's faster but doesn't guarantee delivery. Think of TCP as a phone call (confirmed connection) and UDP as sending a letter (fire and forget).",
  },
  {
    role: "user" as const,
    content: "When should I use UDP over TCP?",
  },
  {
    role: "ai" as const,
    content:
      "Use UDP when speed matters more than reliability — like video streaming, online gaming, or DNS lookups. TCP is better for web browsing, email, and file transfers where every packet must arrive correctly.",
  },
];

export default function InteractiveDemo() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-start/3 rounded-full blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Experience the{" "}
              <span className="gradient-text">Pulse</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Our AI doesn&apos;t just answer — it understands context, adapts to your
              level, and explains concepts the way{" "}
              <span className="text-text-primary font-medium">you</span> learn best.
            </p>
            <ul className="space-y-3">
              {[
                "Contextual follow-up understanding",
                "Adaptive difficulty calibration",
                "Multi-format explanations",
                "Step-by-step problem solving",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-accent-start/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-start" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — Chat Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="glass-card overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Interactive Demo
                  </p>
                  <p className="text-xs text-text-secondary">
                    AI-powered learning experience
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 max-h-80 overflow-y-auto no-scrollbar">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      {msg.role === "ai" && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles size={12} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-accent-start/10 border border-accent-start/20 rounded-br-sm"
                            : "bg-bg-elevated border border-border-subtle rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed text-text-secondary">
                          {msg.content}
                        </p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User size={12} className="text-text-secondary" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="px-5 py-4 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-secondary/50">
                    Type your question...
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all cursor-pointer">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
