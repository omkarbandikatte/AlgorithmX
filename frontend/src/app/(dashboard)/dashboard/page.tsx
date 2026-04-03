"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Users, 
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, href, color }: any) => (
  <Link href={href} className="group">
    <div className="card-glass p-8 h-full border-border-subtle hover:border-accent-start/30 transition-all duration-300 relative overflow-hidden flex flex-col gap-6">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
            <Icon size={28} className="text-white" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
        </div>
        <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-start opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Explore Tool</span>
            <ArrowRight size={14} />
        </div>
    </div>
  </Link>
);

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
    <div className="card-glass p-6 bg-white/[0.01] border-border-subtle hover:bg-white/[0.03] transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 rounded-xl bg-white/5 text-text-secondary">
                <Icon size={20} />
            </div>
            {trend && <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        <div className="space-y-1">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black">{value}</p>
        </div>
    </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight">Welcome, <span className="gradient-text">{user?.displayName?.split(" ")[0] || "Scholar"}</span>!</h1>
            <p className="text-text-secondary leading-relaxed">Your neural-grade learning ecosystem is synchronized and ready for analysis.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-5 py-2.5 rounded-xl border border-border-subtle bg-white/5 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Auth Status: Active
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={TrendingUp} label="Resume Performance" value="84/100" trend="+12%" />
          <StatCard icon={Brain} label="Cognitive IQ Level" value="Level 4" trend="Optimized" />
          <StatCard icon={ShieldCheck} label="Proctoring Score" value="98.2%" />
          <StatCard icon={Zap} label="Learning Modules" value="23 Saved" />
      </div>

      {/* Main Features */}
      <div className="space-y-6">
          <div className="flex items-center gap-3">
              <Sparkles size={24} className="text-accent-start" />
              <h2 className="text-2xl font-bold tracking-tight">AI Command Center</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={FileText} 
                title="AI Resume Hub" 
                description="Upload your resume for real-time neural scoring and AI-powered impact optimization. Engineered for ATS success."
                href="/resume"
                color="bg-gradient-to-br from-orange-500 to-red-600"
              />
              <FeatureCard 
                icon={MessageSquare} 
                title="Multimodal Solver" 
                description="Send voice notes, images of math problems, or text queries. Our Gemini 1.5 core solves doubts instantly."
                href="/doubt-solver"
                color="bg-gradient-to-br from-indigo-500 to-purple-600"
              />
              <FeatureCard 
                icon={Users} 
                title="Interview Room" 
                description="Experience a state-of-the-art proctored mock interview. Get instant feedback on your voice and physical presence."
                href="/interview"
                color="bg-gradient-to-br from-green-500 to-teal-600"
              />
          </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid lg:grid-cols-3 gap-8 pb-10">
          <div className="lg:col-span-2 card-glass p-1 border-border-subtle overflow-hidden">
               <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-3"><Zap size={18} className="text-yellow-400" /> Neural Activity Feed</h3>
                    <button className="text-xs font-bold text-accent-start hover:underline">View History</button>
               </div>
               <div className="p-6 space-y-6">
                   {[
                       { action: "Resume Scored", detail: "Software Engineer Draft V2 received a score of 84.", time: "14m ago" },
                       { action: "Doubt Solved", detail: "Quantum Mechanics Equation - Multimodal Image Analysis.", time: "2h ago" },
                       { action: "Interview Finished", detail: "Senior React Developer simulation completed.", time: "1d ago" },
                   ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0">
                           <div className="space-y-1">
                               <p className="text-sm font-bold text-text-primary group-hover:text-accent-start transition-colors">{item.action}</p>
                               <p className="text-xs text-text-secondary">{item.detail}</p>
                           </div>
                           <span className="text-[10px] text-text-muted font-bold uppercase">{item.time}</span>
                       </div>
                   ))}
               </div>
          </div>
          
          <div className="card-glass p-8 flex flex-col justify-center items-center text-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Brain size={120} />
                </div>
                <div className="w-20 h-20 rounded-full bg-accent-start/5 border border-accent-start/10 flex items-center justify-center">
                    <ActivityIcon size={40} className="text-accent-start animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-xl font-bold">Rakshak Premium</h4>
                    <p className="text-sm text-text-secondary">Unlock enterprise-grade models and unlimited proctored interviews.</p>
                </div>
                <button className="btn-primary w-full shadow-[0_0_20px_rgba(255,107,0,0.2)]">Upgrade Now</button>
          </div>
      </div>

    </div>
  );
}

function ActivityIcon({ className, size }: any) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
