"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  Search, 
  Settings, 
  UserCircle,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 bg-bg-primary/50 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-8 z-20">
      {/* Search */}
      <div className="flex-1 max-w-lg">
        <div className="relative group">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-start transition-colors" />
          <input 
            type="text" 
            placeholder="Search learning resources, modules, or tools..." 
            className="w-full bg-hover-bg border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-start/50 transition-all focus:bg-hover-bg"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleTheme}
          className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="relative text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent-start rounded-full border-2 border-bg-primary" />
        </button>
        <button className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <Settings size={20} />
        </button>
        
        {/* User profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold">{user?.displayName || "Student User"}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Standard Account</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 border-2 border-border-subtle flex items-center justify-center overflow-hidden">
             {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
             ) : (
                <UserCircle size={24} className="text-white" />
             )}
          </div>
        </div>
      </div>
    </header>
  );
}
