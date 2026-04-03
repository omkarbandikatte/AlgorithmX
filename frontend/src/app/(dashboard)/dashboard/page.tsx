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
  Zap,
  Calendar,
  Clock,
  Network,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import NeuralSkillRadar, { RadarData } from "@/components/dashboard/NeuralSkillRadar";
import AIInsightsPanel from "@/components/dashboard/AIInsightsPanel";

/* ── Fallback mock data (shown when backend has no data yet) ── */
const MOCK_INTERVIEWS = [
  { name: "Interview 1", score: 52, feedback: "Needs improvement in communication" },
  { name: "Interview 2", score: 61, feedback: "Better structure, work on confidence" },
  { name: "Interview 3", score: 68, feedback: "Good technical depth" },
  { name: "Interview 4", score: 74, feedback: "Strong problem solving" },
  { name: "Interview 5", score: 82, feedback: "Excellent improvement" },
  { name: "Interview 6", score: 88, feedback: "Near-professional performance" },
];

const MOCK_ACTIVITY = [
  { name: "Mon", doubts: 4, interviews: 1, resumes: 0 },
  { name: "Tue", doubts: 7, interviews: 0, resumes: 1 },
  { name: "Wed", doubts: 3, interviews: 2, resumes: 0 },
  { name: "Thu", doubts: 9, interviews: 1, resumes: 1 },
  { name: "Fri", doubts: 5, interviews: 0, resumes: 2 },
  { name: "Sat", doubts: 2, interviews: 1, resumes: 0 },
  { name: "Sun", doubts: 6, interviews: 2, resumes: 1 },
];

const MOCK_RADAR: RadarData = { resumeScore: 0, interviewScore: 0, roadmapScore: 0, doubtSolverScore: 0 };

/* ── Sub-components ── */
const FeatureCard = ({ icon: Icon, title, description, href, color }: any) => (
  <Link href={href} className="group">
    <div className="card-glass p-7 h-full border-border-subtle hover:border-accent-start/30 transition-all duration-300 relative overflow-hidden flex flex-col gap-5">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
      <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent-start opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Open Tool</span>
        <ArrowRight size={13} />
      </div>
    </div>
  </Link>
);

const StatCard = ({ label, value, icon: Icon, trend }: any) => (
  <div className="card-glass p-6 border-border-subtle hover:border-accent-start/20 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 rounded-xl bg-accent-start/5 text-text-secondary group-hover:text-accent-start transition-colors">
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

function InterviewTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3 shadow-xl text-sm space-y-1">
      <p className="font-bold text-text-primary">{d.name}</p>
      <p className="text-accent-start font-semibold">Score: {d.score}/100</p>
      {d.feedback && <p className="text-text-secondary text-xs">{d.feedback}</p>}
    </div>
  );
}

function ResumeGauge({ score }: { score: number }) {
  const gaugeData = [{ name: "Score", value: score }];
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={190}>
        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={210} endAngle={-30} data={gaugeData} barSize={14}>
          <RadialBar dataKey="value" cornerRadius={10} fill={color} background={{ fill: "var(--border-subtle)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-text-secondary font-semibold">/ 100</span>
      </div>
    </div>
  );
}

function RoadmapDonut({ completed, total }: { completed: number; total: number }) {
  const remaining = Math.max(0, total - completed);
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const data = [{ name: "Done", value: completed || 1 }, { name: "Remaining", value: remaining }];
  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={78} startAngle={90} endAngle={-270} paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={800}>
            <Cell fill="var(--accent-start)" />
            <Cell fill="var(--border-subtle)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-text-primary">{pct}%</span>
        <span className="text-xs text-text-secondary font-semibold">{completed}/{total} modules</span>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function DashboardOverview() {
  const { user } = useAuth();
  const { call } = useApi();
  const { theme } = useTheme();

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)";
  const axisColor = theme === "dark" ? "#6b7280" : "#9ca3af";

  // Dashboard data from backend
  const [dashData, setDashData] = React.useState<any>(null);
  const [dashLoading, setDashLoading] = React.useState(true);
  const [history, setHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    async function fetchAll() {
      setDashLoading(true);
      try {
        const [dash, hist] = await Promise.all([
          call("/api/dashboard-data"),
          call("/api/user/history"),
        ]);
        if (!active) return;
        setDashData(dash);
        const combined = [
          ...hist.roadmaps.map((r: any) => ({ ...r, type: "Roadmap", title: r.topic, date: r.createdAt?._seconds ? new Date(r.createdAt._seconds * 1000) : new Date() })),
          ...hist.interviews.map((i: any) => ({ ...i, type: "Interview", title: `Score: ${i.score}/100`, date: i.createdAt?._seconds ? new Date(i.createdAt._seconds * 1000) : new Date() })),
          ...hist.resumes.map((r: any) => ({ ...r, type: "Resume", title: `ATS Score: ${r.totalScore}`, date: r.createdAt?._seconds ? new Date(r.createdAt._seconds * 1000) : new Date() })),
        ]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 5);
        setHistory(combined);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setDashLoading(false);
      }
    }
    fetchAll();
    return () => { active = false; };
  }, [call]);

  // Derived values
  const radarData: RadarData = dashData?.radarData ?? MOCK_RADAR;
  const resumeScore: number = dashData?.latestResume?.totalScore ?? 0;
  const roadmapProgress = dashData?.roadmapProgress ?? { completed: 0, total: 0 };
  const weakTopics: string[] = dashData?.weakTopics ?? [];
  const lastInsight = dashData?.lastInsight ?? null;

  // Interview chart: Use real data when available, else mock
  const interviewChartData = React.useMemo(() => {
    const raw = dashData?.interviews;
    if (raw?.length) {
      return [...raw]
        .reverse()
        .map((iv: any, idx: number) => ({ name: `Session ${idx + 1}`, score: iv.score || 0, feedback: iv.report?.slice(0, 80) || "" }));
    }
    return MOCK_INTERVIEWS;
  }, [dashData]);

  const latestScore = interviewChartData[interviewChartData.length - 1]?.score ?? 0;
  const doubtsTotal = MOCK_ACTIVITY.reduce((s, d) => s + d.doubts, 0);

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">
            Welcome, <span className="gradient-text">{user?.displayName?.split(" ")[0] || "Scholar"}</span>!
          </h1>
          <p className="text-text-secondary leading-relaxed">Your adaptive intelligence dashboard. Here&apos;s your unified career snapshot.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setDashLoading(true); call("/api/dashboard-data").then(setDashData).finally(() => setDashLoading(false)); }}
            className="p-2.5 rounded-xl border border-border-subtle bg-hover-bg hover:border-accent-start/30 transition-all cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw size={16} className={dashLoading ? "animate-spin text-accent-start" : "text-text-secondary"} />
          </button>
          <div className="px-5 py-2.5 rounded-xl border border-border-subtle bg-hover-bg text-xs font-bold tracking-widest uppercase flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        <StatCard icon={TrendingUp} label="Resume Score" value={resumeScore > 0 ? `${resumeScore}/100` : "—"} trend={resumeScore > 0 ? undefined : undefined} />
        <StatCard icon={Brain} label="Interview Best" value={latestScore > 0 ? `${latestScore}/100` : "—"} trend={latestScore > 0 ? "Improving" : undefined} />
        <StatCard icon={ShieldCheck} label="Roadmap Progress" value={roadmapProgress.total > 0 ? `${Math.round((roadmapProgress.completed / roadmapProgress.total) * 100)}%` : "—"} />
        <StatCard icon={Zap} label="Weekly Doubts" value={doubtsTotal.toString()} />
      </motion.div>

      {/* ── NEURAL SKILL GRAPH + AI INSIGHTS ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="grid lg:grid-cols-5 gap-6"
      >
        {/* Radar — 3 cols */}
        <div className="lg:col-span-3">
          <NeuralSkillRadar data={radarData} loading={dashLoading} />
        </div>

        {/* AI Insights — 2 cols */}
        <div className="lg:col-span-2">
          <AIInsightsPanel insight={lastInsight} weakTopics={weakTopics} />
        </div>
      </motion.div>

      {/* Charts Row: Interview Trend + Activity */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
        className="grid lg:grid-cols-3 gap-6"
      >
        {/* Interview performance */}
        <div className="lg:col-span-2 card-glass p-6 border-border-subtle">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 text-sm"><TrendingUp size={16} className="text-accent-start" /> Interview Performance</h3>
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">Trending Up</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={interviewChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<InterviewTooltip />} />
              <Line type="monotone" dataKey="score" stroke="var(--accent-start)" strokeWidth={3}
                dot={{ fill: "var(--accent-start)", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, strokeWidth: 0 }}
                animationDuration={1200} animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activity area chart */}
        <div className="card-glass p-6 border-border-subtle">
          <h3 className="font-bold flex items-center gap-2 text-sm mb-6"><Zap size={16} className="text-yellow-400" /> Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={MOCK_ACTIVITY}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "var(--text-primary)", fontWeight: 700 }}
                itemStyle={{ color: "var(--text-secondary)" }}
              />
              <Area type="monotone" dataKey="doubts" stackId="1" stroke="#818cf8" fill="#818cf8" fillOpacity={0.15} strokeWidth={2} animationDuration={1000} />
              <Area type="monotone" dataKey="interviews" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} animationDuration={1200} />
              <Area type="monotone" dataKey="resumes" stackId="1" stroke="var(--accent-start)" fill="var(--accent-start)" fillOpacity={0.15} strokeWidth={2} animationDuration={1400} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Resume Gauge + Roadmap Donut + Quick Action Cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card-glass p-6 border-border-subtle">
          <h3 className="font-bold flex items-center gap-2 text-sm mb-2"><FileText size={16} className="text-accent-start" /> Resume Score</h3>
          <ResumeGauge score={resumeScore} />
          <p className="text-xs text-text-secondary text-center mt-1">ATS compatibility rating</p>
        </div>
        <div className="card-glass p-6 border-border-subtle">
          <h3 className="font-bold flex items-center gap-2 text-sm mb-2"><Network size={16} className="text-accent-start" /> Roadmap</h3>
          <RoadmapDonut completed={roadmapProgress.completed} total={roadmapProgress.total} />
          <p className="text-xs text-text-secondary text-center mt-1">Learning path completion</p>
        </div>

        {/* Quick action CTA cards */}
        <FeatureCard
          icon={MessageSquare}
          title="Doubt Solver"
          description="Instant AI answers — text, voice, or image."
          href="/doubt-solver"
          color="bg-gradient-to-br from-indigo-500 to-purple-600"
        />
        <FeatureCard
          icon={Users}
          title="Interview Room"
          description="Proctored mock interviews with real-time AI feedback."
          href="/interview"
          color="bg-gradient-to-br from-green-500 to-teal-600"
        />
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
        className="grid sm:grid-cols-3 gap-4"
      >
        <Link href="/resume" className="flex items-center justify-between card-glass p-5 border-border-subtle hover:border-accent-start/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold">Improve Weak Areas</p>
              <p className="text-[11px] text-text-secondary">Re-score your resume</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-text-muted group-hover:text-accent-start transition-colors" />
        </Link>

        <Link href="/interview" className="flex items-center justify-between card-glass p-5 border-border-subtle hover:border-accent-start/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold">Take Another Interview</p>
              <p className="text-[11px] text-text-secondary">Sharpen your skills</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-text-muted group-hover:text-accent-start transition-colors" />
        </Link>

        <Link href="/roadmap" className="flex items-center justify-between card-glass p-5 border-border-subtle hover:border-accent-start/30 transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-start/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Network size={18} className="text-accent-start" />
            </div>
            <div>
              <p className="text-sm font-bold">Continue Roadmap</p>
              <p className="text-[11px] text-text-secondary">Pick up where you left off</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-text-muted group-hover:text-accent-start transition-colors" />
        </Link>
      </motion.div>

      {/* Activity Feed */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="card-glass p-1 border-border-subtle overflow-hidden"
      >
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-3 text-sm"><Sparkles size={16} className="text-accent-start" /> Recent Activity</h3>
        </div>
        <div className="p-6 space-y-3">
          {history.length === 0 ? (
            <div className="text-center p-8 text-text-muted text-sm border-2 border-dashed border-border-subtle rounded-xl flex flex-col items-center gap-3">
              <Clock size={24} />
              No activity yet. Start using tools to see your history here.
            </div>
          ) : history.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between group p-3 hover:bg-hover-bg rounded-xl transition-colors border border-transparent hover:border-border-subtle"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent-start/10 flex items-center justify-center text-accent-start shrink-0">
                  {item.type === "Roadmap" ? <Network size={20} /> : item.type === "Interview" ? <Users size={20} /> : <FileText size={20} />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-text-primary group-hover:text-accent-start transition-colors">{item.type} Generated</p>
                  <p className="text-xs text-text-secondary">{item.title}</p>
                </div>
              </div>
              <span className="text-[10px] text-text-muted font-bold uppercase flex items-center gap-1">
                <Calendar size={12} /> {item.date.toLocaleDateString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
