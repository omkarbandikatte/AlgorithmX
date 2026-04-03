"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, 
  FileText, 
  MessageSquare, 
  Users, 
  LogOut, 
  Layout, 
  Activity,
  Map
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? "bg-accent-start text-white shadow-lg" 
        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
    }`}
  >
    <Icon size={20} className={active ? "" : "group-hover:scale-110 transition-transform"} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    { icon: Layout, label: "Overview", href: "/dashboard" },
    { icon: FileText, label: "Resume Hub", href: "/resume" },
    { icon: MessageSquare, label: "Doubt Solver", href: "/doubt-solver" },
    { icon: Users, label: "Mock Interview", href: "/interview" },
    { icon: Map, label: "Roadmap Generator", href: "/roadmap" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 bg-bg-surface border-r border-border-subtle p-6 space-y-8 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center shadow-lg">
          <Activity size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Rakshak <span className="gradient-text">AI</span></span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href}
            {...item}
            active={pathname === item.href}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-border-subtle pt-6">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-medium cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
