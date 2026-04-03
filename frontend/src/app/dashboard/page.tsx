"use client";

import { Search, Bell, ChevronDown } from "lucide-react";
import WelcomeCard from "./components/WelcomeCard";
import ChatInterface from "./components/ChatInterface";
import LearningProgress from "./components/LearningProgress";
import RecentActivity from "./components/RecentActivity";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-3">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                placeholder="Search courses, topics..."
                className="w-full bg-bg-surface border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-start/50 focus:ring-1 focus:ring-accent-start/20 transition-all"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4 ml-6">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <Bell size={18} className="text-text-secondary" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-start" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:block">
                Akshat
              </span>
              <ChevronDown size={14} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 space-y-8">
        <WelcomeCard />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <ChatInterface />

          {/* Right Column */}
          <div className="space-y-8">
            <LearningProgress />
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
