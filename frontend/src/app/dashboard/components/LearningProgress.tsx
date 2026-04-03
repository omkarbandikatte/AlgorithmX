"use client";

import { motion } from "framer-motion";
import ProgressBar from "@/components/ui/ProgressBar";
import { BookOpen, Clock, Star } from "lucide-react";

const courses = [
  {
    title: "Data Structures & Algorithms",
    progress: 72,
    lessons: 24,
    completed: 17,
    duration: "12h left",
    rating: 4.8,
  },
  {
    title: "Machine Learning Fundamentals",
    progress: 45,
    lessons: 32,
    completed: 14,
    duration: "18h left",
    rating: 4.9,
  },
  {
    title: "System Design Patterns",
    progress: 88,
    lessons: 18,
    completed: 16,
    duration: "3h left",
    rating: 4.7,
  },
];

export default function LearningProgress() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Learning Progress
        </h2>
        <button className="text-xs text-accent-start hover:text-accent-end transition-colors cursor-pointer">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="glass-card-sm p-4 group hover:border-white/10 transition-all duration-300 cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                  {course.title}
                </h3>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <BookOpen size={12} />
                    {course.completed}/{course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-secondary">
                    <Clock size={12} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Star size={12} fill="currentColor" />
                    {course.rating}
                  </span>
                </div>
              </div>
            </div>
            <ProgressBar value={course.progress} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
