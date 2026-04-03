"use client";

import { motion, type Variants } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Brain, MessageSquare, WifiOff } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Multimodal AI Learning",
    description:
      "Learn through text, voice, and visual interaction. Our AI adapts to your preferred learning style for maximum retention and understanding.",
    accent: "from-purple-500 to-blue-500",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Doubt Solver",
    description:
      "Get instant, accurate answers to your questions. Our AI understands context and provides step-by-step explanations tailored to your level.",
    accent: "from-accent-start to-accent-end",
  },
  {
    icon: WifiOff,
    title: "Works Even Offline",
    description:
      "Powered by edge computing, Rakshak AI works without internet. Download AI models locally and learn anywhere, anytime — no connectivity needed.",
    accent: "from-emerald-500 to-teal-500",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CoreIntelligence() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Core <span className="gradient-text">Intelligence</span>
          </h2>
          <p className="mt-4 text-text-secondary text-lg max-w-2xl mx-auto">
            Three pillars that make Rakshak AI the most advanced learning
            platform available.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <GlassCard
                  glowOnHover
                  className="h-full group cursor-default"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
