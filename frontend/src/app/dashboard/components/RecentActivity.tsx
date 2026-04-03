"use client";

import { motion } from "framer-motion";
import { MessageSquare, BookOpen, Clock, Brain } from "lucide-react";

const activities = [
  {
    icon: MessageSquare,
    title: "Asked about Binary Search Trees",
    subtitle: "AI Doubt Solver",
    time: "2 min ago",
    accent: "from-accent-start to-accent-end",
  },
  {
    icon: BookOpen,
    title: "Completed: Sorting Algorithms",
    subtitle: "Data Structures & Algorithms",
    time: "1 hour ago",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: Brain,
    title: "Practice Quiz: ML Basics",
    subtitle: "Score: 85% · 17/20 correct",
    time: "3 hours ago",
    accent: "from-purple-500 to-pink-500",
  },
  {
    icon: Clock,
    title: "Studied for 2h 15m",
    subtitle: "System Design Patterns",
    time: "Yesterday",
    accent: "from-blue-500 to-cyan-500",
  },
];

export default function RecentActivity() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Recent Activity
        </h2>
        <button className="text-xs text-accent-start hover:text-accent-end transition-colors cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="glass-card-sm p-4 flex items-center gap-4 group hover:border-white/10 transition-all duration-300 cursor-default"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.accent} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {activity.subtitle}
                </p>
              </div>
              <span className="text-xs text-text-secondary flex-shrink-0">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
