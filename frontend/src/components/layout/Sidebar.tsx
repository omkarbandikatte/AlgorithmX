"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/dashboard/learning", icon: BookOpen },
  { label: "AI Doubt Solver", href: "/dashboard/solver", icon: MessageSquare },
  { label: "Resume Analyzer", href: "/dashboard/resume", icon: FileText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-border-subtle bg-bg-surface transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-2.5 border-b border-border-subtle min-h-[64px]">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-base font-bold text-text-primary tracking-tight whitespace-nowrap">
            Rakshak <span className="gradient-text">AI</span>
          </span>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-accent-start/10 text-accent-start border border-accent-start/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-white/5 border border-transparent"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 ${
                  isActive
                    ? "text-accent-start"
                    : "text-text-secondary group-hover:text-text-primary"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border-subtle space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all duration-200 w-full cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 w-full cursor-pointer ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
