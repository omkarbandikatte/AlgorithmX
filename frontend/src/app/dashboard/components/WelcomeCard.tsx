"use client";

import { motion } from "framer-motion";
import {
  Flame,
  BookOpen,
  Clock,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    label: "Day Streak",
    value: "12",
    icon: Flame,
    change: "+2 this week",
    accent: "from-orange-500 to-amber-500",
  },
  {
    label: "Courses Active",
    value: "4",
    icon: BookOpen,
    change: "1 near completion",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    label: "Hours Learned",
    value: "38",
    icon: Clock,
    change: "+6h this week",
    accent: "from-purple-500 to-pink-500",
  },
  {
    label: "Questions Solved",
    value: "156",
    icon: TrendingUp,
    change: "+23 today",
    accent: "from-emerald-500 to-teal-500",
  },
];

export default function WelcomeCard() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, <span className="gradient-text">Akshat</span>
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Continue where you left off. Your AI tutor is ready.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card-sm p-4 group hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.accent} flex items-center justify-center`}
                >
                  <Icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
              <p className="text-xs text-accent-start mt-2">{stat.change}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
