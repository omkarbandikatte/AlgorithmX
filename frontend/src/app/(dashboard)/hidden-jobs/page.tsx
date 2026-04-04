"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import {
  Briefcase,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Tag,
  TrendingUp,
  Wifi,
  Clock,
  Brain,
  Copy,
  Check,
  X,
  RefreshCw,
  Zap,
  Target,
  BookOpen,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Job {
  title: string;
  company_name: string;
  tags: string[];
  location: string;
  url: string;
  remote: boolean;
  description: string;
  created_at: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

interface AIAnalysis {
  matchScore: number;
  reasoning: string;
  whyFits: string;
  skillsToLearn: string[];
  aiCoverMessage: string;
}

type SortMode = "best-match" | "latest";
type FilterMode = "all" | "remote" | "high-match";

export default function HiddenJobsPage() {
  const { call } = useApi();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("best-match");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [minMatchPercent, setMinMatchPercent] = useState(0);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, AIAnalysis>>({});
  const [analyzingJob, setAnalyzingJob] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await call("/api/jobs/hidden-market");
      setJobs(res.jobs || []);
      setUserSkills(res.userSkills || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleAIAnalysis = async (job: Job) => {
    const jobKey = `${job.title}-${job.company_name}`;
    if (aiAnalysis[jobKey]) return; // Already analyzed

    setAnalyzingJob(jobKey);
    try {
      const res = await call("/api/jobs/ai-match", {
        method: "POST",
        body: JSON.stringify({
          jobTitle: job.title,
          jobTags: job.tags,
          jobDescription: job.description,
          userSkills,
        }),
      });
      setAiAnalysis((prev) => ({ ...prev, [jobKey]: res }));
    } catch (err: any) {
      console.error("AI analysis failed:", err.message);
    } finally {
      setAnalyzingJob(null);
    }
  };

  const handleCopyMessage = async (message: string, jobKey: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedMessage(jobKey);
    setTimeout(() => setCopiedMessage(null), 2500);
  };

  // Filtering & Sorting
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company_name?.toLowerCase().includes(q) ||
          j.tags?.some((t) => t.toLowerCase().includes(q)) ||
          j.location?.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterMode === "remote") {
      result = result.filter((j) => j.remote);
    } else if (filterMode === "high-match") {
      result = result.filter((j) => j.matchScore >= 50);
    }

    // Min match
    if (minMatchPercent > 0) {
      result = result.filter((j) => j.matchScore >= minMatchPercent);
    }

    // Sort
    if (sortMode === "best-match") {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    }

    return result;
  }, [jobs, searchQuery, sortMode, filterMode, minMatchPercent]);

  const stats = useMemo(() => {
    const highMatch = jobs.filter((j) => j.matchScore >= 50).length;
    const remoteCount = jobs.filter((j) => j.remote).length;
    const avgMatch =
      jobs.length > 0
        ? Math.round(jobs.reduce((s, j) => s + j.matchScore, 0) / jobs.length)
        : 0;
    return { total: jobs.length, highMatch, remoteCount, avgMatch };
  }, [jobs]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400";
    if (score >= 40) return "text-amber-400";
    return "text-text-secondary";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-400/10 border-emerald-400/20";
    if (score >= 40) return "bg-amber-400/10 border-amber-400/20";
    return "bg-bg-elevated border-border-subtle";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 70) return "from-emerald-500 to-emerald-400";
    if (score >= 40) return "from-amber-500 to-amber-400";
    return "from-zinc-500 to-zinc-400";
  };

  // Strip HTML from description
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").substring(0, 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-start/20 to-violet-500/20 flex items-center justify-center animate-pulse-glow">
            <Briefcase size={36} className="text-accent-start" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-bg-surface border-2 border-accent-start flex items-center justify-center">
            <Loader2 size={14} className="animate-spin text-accent-start" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">Scanning Hidden Job Market</p>
          <p className="text-sm text-text-secondary mt-1">
            Fetching opportunities and matching with your skills...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-start/20 to-violet-500/20 flex items-center justify-center">
              <Briefcase size={20} className="text-accent-start" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hidden Job Market
            </h1>
          </div>
          <p className="text-text-secondary">
            AI-powered job recommendations matched to your resume skills
          </p>
        </div>

        <div className="flex items-center gap-3">
          {userSkills.length === 0 && (
            <Link
              href="/resume"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 transition-all text-sm font-semibold"
            >
              <AlertCircle size={16} />
              Upload Resume First
            </Link>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle hover:border-accent-start/30 transition-all text-sm font-semibold cursor-pointer disabled:opacity-40"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={fetchJobs}
            className="ml-auto text-xs underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-start/10 flex items-center justify-center">
            <Globe size={18} className="text-accent-start" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-text-secondary">Total Jobs</p>
          </div>
        </div>
        <div className="glass-card-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center">
            <Target size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.highMatch}</p>
            <p className="text-xs text-text-secondary">High Match (50%+)</p>
          </div>
        </div>
        <div className="glass-card-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-400/10 flex items-center justify-center">
            <Wifi size={18} className="text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.remoteCount}</p>
            <p className="text-xs text-text-secondary">Remote Jobs</p>
          </div>
        </div>
        <div className="glass-card-sm p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-400/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.avgMatch}%</p>
            <p className="text-xs text-text-secondary">Avg Match</p>
          </div>
        </div>
      </div>

      {/* Your Skills Strip */}
      {userSkills.length > 0 && (
        <div className="glass-card-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={16} className="text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              Your Skills
            </span>
            <span className="text-xs text-text-secondary/60">
              ({userSkills.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-xs font-medium text-violet-300 capitalize"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle focus-within:border-accent-start/40 transition-colors">
          <Search size={18} className="text-text-secondary flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs by title, company, skill, or location..."
            className="bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 outline-none flex-1"
            id="job-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {(
            [
              { id: "all" as FilterMode, label: "All", icon: Briefcase },
              { id: "remote" as FilterMode, label: "Remote", icon: Wifi },
              {
                id: "high-match" as FilterMode,
                label: "50%+ Match",
                icon: Target,
              },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterMode(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                filterMode === f.id
                  ? "bg-accent-start text-white shadow-lg shadow-accent-start/20"
                  : "bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-start/30"
              }`}
            >
              <f.icon size={15} />
              {f.label}
            </button>
          ))}

          {/* Sort */}
          <button
            onClick={() =>
              setSortMode((p) =>
                p === "best-match" ? "latest" : "best-match"
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-start/30 transition-all text-sm font-semibold cursor-pointer"
          >
            <ArrowUpDown size={15} />
            {sortMode === "best-match" ? "Best Match" : "Latest"}
          </button>
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Briefcase
              size={56}
              className="text-text-secondary/30 mb-4"
            />
            <p className="text-lg font-bold">No jobs found</p>
            <p className="text-sm text-text-secondary mt-1">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Upload your resume to get personalized matches"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-secondary font-medium px-1">
              Showing {filteredJobs.length} of {jobs.length} jobs
            </p>

            {filteredJobs.slice(0, 50).map((job, index) => {
              const jobKey = `${job.title}-${job.company_name}`;
              const isExpanded = expandedJob === jobKey;
              const analysis = aiAnalysis[jobKey];
              const isAnalyzing = analyzingJob === jobKey;

              return (
                <motion.div
                  key={jobKey + index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card overflow-hidden hover:border-accent-start/20 transition-all group"
                >
                  {/* Main Row */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      setExpandedJob(isExpanded ? null : jobKey)
                    }
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Job Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${getScoreBg(
                              job.matchScore
                            )}`}
                          >
                            <span
                              className={`text-sm font-black ${getScoreColor(
                                job.matchScore
                              )}`}
                            >
                              {job.matchScore}%
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold tracking-tight truncate group-hover:text-accent-start transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-text-secondary">
                              {job.company_name}
                            </p>
                          </div>
                        </div>

                        {/* Tags row */}
                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <MapPin size={12} />
                            <span>{job.location || "Not specified"}</span>
                          </div>
                          {job.remote && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold border border-emerald-400/20">
                              Remote
                            </span>
                          )}
                          {job.created_at && (
                            <div className="flex items-center gap-1 text-xs text-text-secondary/60">
                              <Clock size={11} />
                              <span>
                                {new Date(
                                  job.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Matched Skills */}
                        {job.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.matchedSkills
                              .slice(0, 6)
                              .map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/15 text-[11px] font-medium text-emerald-400 capitalize"
                                >
                                  ✓ {skill}
                                </span>
                              ))}
                            {job.matchedSkills.length > 6 && (
                              <span className="px-2 py-0.5 text-[11px] text-text-secondary">
                                +{job.matchedSkills.length - 6} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Score Visual + Expand */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Score bar */}
                        <div className="hidden md:block w-32">
                          <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${job.matchScore}%`,
                              }}
                              transition={{ delay: 0.2 }}
                              className={`h-full rounded-full bg-gradient-to-r ${getScoreBarColor(
                                job.matchScore
                              )}`}
                            />
                          </div>
                          <p className="text-[10px] text-text-secondary mt-1 text-right">
                            Match Score
                          </p>
                        </div>

                        {isExpanded ? (
                          <ChevronUp
                            size={20}
                            className="text-text-secondary"
                          />
                        ) : (
                          <ChevronDown
                            size={20}
                            className="text-text-secondary"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-5 border-t border-border-subtle pt-5">
                          {/* Description */}
                          {job.description && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-text-secondary leading-relaxed">
                                {stripHtml(job.description)}...
                              </p>
                            </div>
                          )}

                          {/* Skills Breakdown */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Matched */}
                            {job.matchedSkills.length > 0 && (
                              <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-xl p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                                  <Check size={14} /> Matching Skills
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.matchedSkills.map((s) => (
                                    <span
                                      key={s}
                                      className="px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-medium capitalize"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Missing */}
                            {job.missingSkills.length > 0 && (
                              <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                                  <BookOpen size={14} /> Skills to Learn
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.missingSkills.map((s) => (
                                    <span
                                      key={s}
                                      className="px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-medium capitalize"
                                    >
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* All Job Tags */}
                          {job.tags && job.tags.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 flex items-center gap-2">
                                <Tag size={12} /> Job Tags
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {job.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                                      job.matchedSkills.some(
                                        (ms) =>
                                          ms.toLowerCase() ===
                                          tag.toLowerCase()
                                      )
                                        ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                                        : "bg-bg-elevated text-text-secondary border border-border-subtle"
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Analysis Section */}
                          {analysis ? (
                            <div className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-400/15 rounded-xl p-5 space-y-4">
                              <div className="flex items-center gap-2">
                                <Sparkles
                                  size={16}
                                  className="text-violet-400"
                                />
                                <h4 className="text-sm font-bold text-violet-400">
                                  AI Analysis
                                </h4>
                                <span
                                  className={`ml-auto text-lg font-black ${getScoreColor(
                                    analysis.matchScore
                                  )}`}
                                >
                                  {analysis.matchScore}%
                                </span>
                              </div>

                              {analysis.whyFits && (
                                <div>
                                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
                                    Why This Job Fits You
                                  </p>
                                  <p className="text-sm text-text-secondary leading-relaxed">
                                    {analysis.whyFits}
                                  </p>
                                </div>
                              )}

                              {analysis.reasoning && (
                                <div>
                                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-1">
                                    Match Reasoning
                                  </p>
                                  <p className="text-sm text-text-secondary leading-relaxed">
                                    {analysis.reasoning}
                                  </p>
                                </div>
                              )}

                              {analysis.skillsToLearn?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2">
                                    Skills You Need to Learn
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {analysis.skillsToLearn.map(
                                      (s: string) => (
                                        <span
                                          key={s}
                                          className="px-3 py-1 rounded-full bg-violet-400/10 text-violet-400 text-xs font-medium"
                                        >
                                          {s}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {analysis.aiCoverMessage && (
                                <div className="bg-bg-surface/50 rounded-lg p-4 border border-border-subtle">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-accent-start uppercase tracking-widest">
                                      AI-Generated Application Message
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyMessage(
                                          analysis.aiCoverMessage,
                                          jobKey
                                        );
                                      }}
                                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                                    >
                                      {copiedMessage === jobKey ? (
                                        <>
                                          <Check
                                            size={12}
                                            className="text-green-400"
                                          />{" "}
                                          Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={12} /> Copy
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-sm text-text-secondary leading-relaxed italic">
                                    &quot;{analysis.aiCoverMessage}&quot;
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAIAnalysis(job);
                              }}
                              disabled={isAnalyzing}
                              className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-400/20 text-violet-400 hover:from-violet-500/20 hover:to-purple-500/20 transition-all text-sm font-semibold cursor-pointer disabled:opacity-40"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2
                                    size={18}
                                    className="animate-spin"
                                  />
                                  <span>AI is analyzing this job...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={18} />
                                  <span>
                                    Deep AI Analysis — Why this fits you +
                                    Cover message
                                  </span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-3 pt-2">
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-start text-white font-semibold text-sm hover:bg-accent-start/90 transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={16} />
                              Apply Now
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {filteredJobs.length > 50 && (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary">
                  Showing top 50 results. Refine your search to see more
                  relevant jobs.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
