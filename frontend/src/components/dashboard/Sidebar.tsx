"use client";

import React, { useState, useEffect, useRef } from "react";
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
  BookOpen,
  Globe,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES, LanguageCode } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

const SIDEBAR_KEY = "rakshak-sidebar-collapsed";

const SidebarItem = ({ icon: Icon, label, href, active, collapsed }: any) => (
  <Link
    href={href}
    title={collapsed ? label : undefined}
    className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${active
      ? "bg-accent-start text-white shadow-lg shadow-accent-start/20"
      : "text-text-secondary hover:bg-hover-bg hover:text-text-primary"
      } ${collapsed ? "justify-center" : ""}`}
  >
    <Icon size={20} className={`flex-shrink-0 ${active ? "" : "group-hover:scale-110 transition-transform"}`} />
    <span className={`font-medium whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
      {label}
    </span>
    {collapsed && (
      <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-bg-elevated text-text-primary text-xs font-semibold shadow-xl border border-border-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
        {label}
      </span>
    )}
  </Link>
);

function LanguageDropdown({ collapsed, language, setLanguage, t }: {
  collapsed: boolean;
  language: string;
  setLanguage: (code: any) => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      {!collapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className={`w-full px-3 py-2.5 flex items-center gap-2.5 rounded-xl border transition-all ${open
              ? "bg-bg-elevated border-[#F97316]/50 text-text-primary"
              : "border-border-subtle text-text-secondary hover:text-text-primary hover:bg-hover-bg"
            }`}
        >
          <Globe size={16} className="flex-shrink-0" />
          <span className="flex-1 text-left text-sm font-medium">{currentLang?.name}</span>
          <span className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
        </button>
      ) : (
        <button
          onClick={() => setOpen((v) => !v)}
          title={t("common.language")}
          className={`w-full px-3 py-3 flex items-center justify-center rounded-xl transition-colors ${open ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-hover-bg"
            }`}
        >
          <Globe size={20} />
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 bottom-full mb-2 bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl overflow-hidden ${collapsed ? "left-full ml-3 w-44" : "left-0 right-0"
            }`}
        >
          <div className="px-3 py-2 border-b border-border-subtle">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Language</p>
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${language === lang.code
                  ? "bg-[#F97316]/10 text-[#F97316] font-semibold"
                  : "text-text-secondary hover:bg-hover-bg hover:text-text-primary"
                }`}
            >
              <span className="w-7 text-xs font-bold opacity-50 shrink-0">{lang.short}</span>
              <span>{lang.name}</span>
              {language === lang.code && <span className="ml-auto text-[#F97316] text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
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
    { icon: Layout, label: t("nav.dashboard"), href: "/dashboard" },
    { icon: FileText, label: t("nav.resume"), href: "/resume" },
    { icon: MessageSquare, label: t("nav.doubtSolver"), href: "/doubt-solver" },
    // { icon: Users, label: t("nav.interview"), href: "/interview" },
    { icon: Map, label: t("nav.roadmap"), href: "/roadmap" },
    { icon: Mic, label: t("nav.interviewAI"), href: "/interview-ai" },
    { icon: Briefcase, label: t("nav.hiddenJobs"), href: "/hidden-jobs" },
    { icon: BookOpen, label: t("nav.learn"), href: "/learn" },
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
            {t("nav.brand").split(" ").map((word, i) =>
              i === 1 ? <span key={i} className="gradient-text"> {word}</span> : word
            )}
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
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
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
      <div className="pt-4 border-t border-border-subtle flex flex-col gap-2">
        <LanguageDropdown
          collapsed={collapsed}
          language={language}
          setLanguage={setLanguage}
          t={t}
        />

        <button
          onClick={logout}
          title={collapsed ? t("common.signOut") : undefined}
          className={`relative flex items-center gap-3 w-full px-3 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-medium cursor-pointer group ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-200 ${collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"}`}>
            {t("common.signOut")}
          </span>
          {collapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg bg-bg-elevated text-red-400 text-xs font-semibold shadow-xl border border-border-subtle opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              {t("common.signOut")}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
