"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  LogOut, 
  Layout, 
  Activity,
  Map,
  Mic,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SIDEBAR_KEY = "rakshak-sidebar-collapsed";

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }: any) => (
  <Link 
    href={href} 
    title={collapsed ? label : undefined}
    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? "bg-accent-start text-white shadow-lg shadow-accent-start/20" 
        : "text-text-secondary hover:bg-hover-bg hover:text-text-primary"
    } ${collapsed ? "justify-center" : ""}`}
  >
    <Icon size={20} className={`flex-shrink-0 ${active ? "" : "group-hover:scale-110 transition-transform"}`} />
    <span className={`font-medium whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
      {label}
    </span>
    {/* Tooltip on hover when collapsed */}
    {collapsed && (
      <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-bg-elevated text-text-primary text-xs font-semibold shadow-xl border border-border-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
        {label}
      </span>
    )}
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
  };

  const menuItems = [
    { icon: Layout, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Resume Hub", href: "/resume" },
    { icon: MessageSquare, label: "Doubt Solver", href: "/doubt-solver" },
    { icon: Users, label: "Mock Interview", href: "/interview" },
    { icon: Map, label: "Roadmap Generator", href: "/roadmap" },
    { icon: Mic, label: "AI Mock Interview", href: "/interview-ai" },
    { icon: BookOpen, label: "Learn Concepts", href: "/learn" },
  ];

  return (
    <aside className={`hidden md:flex flex-col bg-bg-surface border-r border-border-subtle p-4 z-30 transition-all duration-300 ease-in-out ${collapsed ? "w-[72px]" : "w-64"}`}>
      {/* Brand + Toggle */}
      <div className={`flex items-center mb-6 ${collapsed ? "justify-center" : "justify-between"} px-1`}>
        <div className={`flex items-center gap-3 min-w-0 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center shadow-lg flex-shrink-0">
            <Activity size={18} className="text-white" />
          </div>
          <span className={`text-lg font-bold tracking-tight whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
            Rakshak <span className="gradient-text">AI</span>
          </span>
        </div>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleCollapsed}
          className="mb-4 p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-hover-bg transition-colors cursor-pointer self-center"
          title="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Menu */}
      <nav className="flex-1 space-y-1.5">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-border-subtle">
        <button 
          onClick={logout}
          title={collapsed ? "Sign Out" : undefined}
          className={`relative flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-medium cursor-pointer group ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
            Sign Out
          </span>
          {collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-bg-elevated text-red-400 text-xs font-semibold shadow-xl border border-border-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
