"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, CheckCircle2, Loader2, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface Insight {
  text: string;
  score: number;
  topics: string[];
}

interface MicroStep {
  day: number;
  title: string;
  tasks: string[];
  resource: string;
}

interface MicroRoadmap {
  title: string;
  steps: MicroStep[];
}

interface Props {
  insight: Insight | null;
  weakTopics: string[];
}

export default function AIInsightsPanel({ insight, weakTopics }: Props) {
  const { call } = useApi();
  const [roadmap, setRoadmap] = useState<MicroRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  async function generateMicroRoadmap() {
    setLoading(true);
    setError(null);
    try {
      const topics = insight?.topics?.length ? insight.topics : weakTopics;
      const data = await call("/api/generate-micro-roadmap", {
        method: "POST",
        body: JSON.stringify({ topics }),
      });
      setRoadmap(data);
    } catch (e: any) {
      setError(e.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  }

  // Nothing to show
  if (!insight && weakTopics.length === 0) {
    return (
      <div className="card-glass p-8 border-border-subtle flex flex-col items-center justify-center gap-4 text-center opacity-60">
        <CheckCircle2 size={32} className="text-green-400" />
        <div>
          <p className="font-bold text-sm">No insights yet</p>
          <p className="text-xs text-text-secondary mt-1">Complete a mock interview to unlock AI-powered suggestions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass border-border-subtle overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <Zap size={18} className="text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Adaptive Intelligence</h3>
          <p className="text-xs text-text-secondary">Personalised suggestions from your last session</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Weak topics chips */}
        {weakTopics.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Detected Weak Areas</p>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-bold"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI insight banner */}
        <AnimatePresence>
          {insight && !dismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-4 space-y-3"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-sm text-text-primary leading-relaxed" dangerouslySetInnerHTML={{ __html: insight.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
                <span>Last interview score: <span className="text-amber-400">{insight.score}/100</span></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA buttons */}
        {!roadmap && (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={generateMicroRoadmap}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 text-sm flex-1 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Improve Weak Areas
                </>
              )}
            </button>
            {insight && !dismissed && (
              <button
                onClick={() => setDismissed(true)}
                className="btn-ghost px-4 text-sm cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Micro Roadmap */}
        <AnimatePresence>
          {roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-accent-start">{roadmap.title}</p>
                <button
                  onClick={() => setRoadmap(null)}
                  className="text-[10px] text-text-muted hover:text-text-secondary transition-colors cursor-pointer font-bold uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              {roadmap.steps.map((step, i) => (
                <motion.div
                  key={step.day}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-xl border border-border-subtle overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-hover-bg transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-accent-start/15 text-accent-start text-xs font-black flex items-center justify-center shrink-0">
                        {step.day}
                      </span>
                      <span className="text-sm font-bold">{step.title}</span>
                    </div>
                    {expanded === i ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                  </button>

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                          <ul className="space-y-1.5">
                            {step.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-xs text-text-secondary">
                                <ArrowRight size={13} className="text-accent-start mt-0.5 shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
                          {step.resource && (
                            <p className="text-[11px] text-text-muted flex items-center gap-1.5 border-t border-border-subtle pt-2 mt-2">
                              <ExternalLink size={11} className="shrink-0" />
                              <span className="italic">{step.resource}</span>
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
