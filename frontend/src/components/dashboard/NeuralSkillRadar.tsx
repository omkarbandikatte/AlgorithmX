"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export interface RadarData {
  resumeScore: number;
  interviewScore: number;
  roadmapScore: number;
  doubtSolverScore: number;
}

interface Props {
  data: RadarData;
  loading?: boolean;
}

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-bg-elevated border border-border-subtle px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-text-primary mb-1">{d.metric}</p>
      <p className="text-accent-start font-semibold">{d.value} / 100</p>
    </div>
  );
}

export default function NeuralSkillRadar({ data, loading = false }: Props) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const METRICS = [
    { key: "resumeScore", label: t("dashboard.radarResume") },
    { key: "interviewScore", label: t("dashboard.radarInterview") },
    { key: "roadmapScore", label: t("dashboard.radarRoadmap") },
    { key: "doubtSolverScore", label: t("dashboard.radarDoubtSolver") },
  ];

  const chartData = METRICS.map((m) => ({
    metric: m.label,
    value: (data as any)[m.key] ?? 0,
    fullMark: 100,
  }));

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const tickColor = theme === "dark" ? "#6b7280" : "#9ca3af";

  return (
    <div className="card-glass p-6 border-border-subtle h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">
            {t("dashboard.neuralSkillGraph")}
          </h3>
          <p className="text-xs text-text-secondary">{t("dashboard.crossToolSnapshot")}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {METRICS.map((m) => (
            <span
              key={m.key}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-start/10 text-accent-start"
            >
              {m.label}: {(data as any)[m.key] ?? 0}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-accent-start/30 border-t-accent-start animate-spin" />
          </div>
        ) : (
          <motion.div
            key={JSON.stringify(data)}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full h-full"
            style={{ minHeight: 280 }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fill: tickColor, fontSize: 11, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                  tickCount={5}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--accent-start)"
                  fill="var(--accent-start)"
                  fillOpacity={0.18}
                  strokeWidth={2.5}
                  dot={{ fill: "var(--accent-start)", r: 4, strokeWidth: 0 }}
                  isAnimationActive={true}
                  animationBegin={100}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Glow overlay — purely visual */}
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, var(--glow-orange, rgba(244,162,97,0.06)) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Score summary bar */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {METRICS.map((m) => {
          const val = (data as any)[m.key] ?? 0;
          const color = val >= 70 ? "#22c55e" : val >= 45 ? "#eab308" : "#ef4444";
          return (
            <div key={m.key} className="text-center space-y-1">
              <div className="h-1 w-full bg-hover-bg rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: color }}
                />
              </div>
              <p className="text-[10px] font-bold text-text-muted">{m.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
