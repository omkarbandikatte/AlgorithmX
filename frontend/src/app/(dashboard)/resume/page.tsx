"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { useApi } from "@/hooks/useApi";
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  Loader2,
  FileText,
  BarChart2,
  Copy,
  Check,
  X,
  Plus,
  Brain,
  Save,
  Briefcase,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ResumeHub() {
  const { call } = useApi();
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [enhanced, setEnhanced] = useState<string>("");
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<"score" | "enhance">("score");
  const [copied, setCopied] = useState(false);

  // Skill extraction state
  const [extractedProfile, setExtractedProfile] = useState<any>(null);
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillsSaved, setSkillsSaved] = useState(false);

  // Load existing skills on mount
  useEffect(() => {
    loadExistingSkills();
  }, []);

  const loadExistingSkills = async () => {
    try {
      const res = await call("/api/ai/resume/skills");
      if (res.skills?.length > 0) {
        setEditableSkills(res.skills);
      }
      if (res.extractedProfile) {
        setExtractedProfile(res.extractedProfile);
      }
    } catch {
      // Silently fail — user may not have skills yet
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError("");
    setAnalysis(null);
    setEnhanced("");
    setActiveView("score");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await call("/api/ai/resume/import", {
        method: "POST",
        body: formData
      });
      setResumeText(res.text);
      
      // Auto-score after import
      handleScore(res.text);
      // Auto-extract skills
      handleExtractSkills(res.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleScore = async (text: string) => {
    setIsScoring(true);
    try {
      const res = await call("/api/ai/resume/score", {
        method: "POST",
        body: JSON.stringify({ resumeText: text })
      });
      const hl = res.highlights || res.Highlights || {};
      res.highlights = {
        strengths: hl.strengths || hl.Strengths || hl.strength || [],
        weaknesses: hl.weaknesses || hl.Weaknesses || hl.areasToImprove || hl.areas_to_improve || hl.improvements || hl.improvement || [],
      };
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScoring(false);
    }
  };

  const handleExtractSkills = async (text: string) => {
    setIsExtracting(true);
    try {
      const res = await call("/api/ai/resume/extract-skills", {
        method: "POST",
        body: JSON.stringify({ resumeText: text })
      });
      setExtractedProfile(res);
      setEditableSkills(res.skills || []);
    } catch (err: any) {
      console.error("Skill extraction error:", err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleEnhance = async () => {
    if (!resumeText) return;
    setIsEnhancing(true);
    setError("");
    setActiveView("enhance");
    try {
      const res = await call("/api/ai/resume/enhance", {
        method: "POST",
        body: JSON.stringify({ resumeText, focusArea: "All sections for maximum impact" })
      });
      setEnhanced(res.enhancedText);
    } catch (err: any) {
      setError(err.message);
      setActiveView("score");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCopy = async () => {
    if (!enhanced) return;
    await navigator.clipboard.writeText(enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableSkills(prev => prev.filter(s => s !== skillToRemove));
    setSkillsSaved(false);
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim().toLowerCase();
    if (!trimmed || editableSkills.includes(trimmed)) return;
    setEditableSkills(prev => [...prev, trimmed]);
    setNewSkill("");
    setSkillsSaved(false);
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    try {
      await call("/api/ai/resume/update-skills", {
        method: "POST",
        body: JSON.stringify({ skills: editableSkills })
      });
      setSkillsSaved(true);
      setTimeout(() => setSkillsSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSavingSkills(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("resume.fullTitle")}</h1>
        <p className="text-text-secondary">{t("resume.subtitle")}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Left — Upload & Input */}
        <div className="space-y-6">
          <div className="card-glass p-8 border-2 border-dashed border-border-subtle hover:border-accent-start/50 transition-colors relative group">
            <input 
              type="file" 
              accept=".pdf,.docx" 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              id="resume-upload-input"
            />
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-start/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileUp size={32} className="text-accent-start" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{isImporting ? t("resume.parsing") : t("resume.dropHere")}</p>
                <p className="text-sm text-text-secondary">{t("resume.pdfDocx")}</p>
              </div>
            </div>
            {isImporting && (
                <div className="absolute inset-0 bg-bg-surface/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-accent-start" />
                </div>
            )}
          </div>

          <AnimatePresence>
            {resumeText && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-text-secondary">
                        <FileText size={16} /> 
                        <span>{t("resume.extractedText")}</span>
                    </div>
                    <button 
                      onClick={handleEnhance} 
                      disabled={isEnhancing}
                      className="btn-primary btn-sm group cursor-pointer"
                    >
                      {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />}
                      <span>{t("resume.enhance")}</span>
                    </button>
                </div>
                <div className="bg-hover-bg border border-border-subtle rounded-xl p-6 h-[400px] overflow-y-auto text-sm text-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                  {resumeText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Results */}
        <div className="space-y-4">
          {/* Tab switcher — only shown when we have content */}
          {(analysis || enhanced) && (
            <div className="flex gap-2 p-1 bg-bg-elevated border border-border-subtle rounded-xl w-fit">
              <button
                onClick={() => setActiveView("score")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === "score"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <BarChart2 size={15} /> Analysis
              </button>
              <button
                onClick={() => setActiveView("enhance")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeView === "enhance"
                    ? "bg-bg-surface text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Sparkles size={15} /> AI Enhanced
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Score / Analysis view */}
            {activeView === "score" && (
              <>
                {isScoring ? (
                  <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glass p-12 text-center flex flex-col items-center gap-6">
                    <Loader2 size={48} className="animate-spin text-accent-start" />
                    <p className="font-bold text-lg animate-pulse">{t("resume.running")}</p>
                    <p className="text-text-secondary text-sm max-w-xs mx-auto">{t("resume.runningDetail")}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div key="analysis" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                    {/* Total Score */}
                    <div className="card-glass p-8 relative overflow-hidden">
                      <div className="flex justify-between items-end mb-8 relative z-10">
                        <div className="space-y-1">
                          <h2 className="text-sm font-bold uppercase tracking-widest text-accent-start">{t("resume.analysisComplete")}</h2>
                          <p className="text-4xl font-black">{analysis.totalScore}<span className="text-lg text-text-secondary font-medium">/100</span></p>
                        </div>
                        <CheckCircle2 size={40} className="text-green-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 relative z-10">
                        {Object.entries(analysis.breakdown || {}).map(([key, val]: any) => (
                          <div key={key} className="bg-hover-bg rounded-lg p-3 border border-border-subtle">
                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{key}</p>
                            <p className="text-sm font-bold">{val as string}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 h-1.5 w-full bg-hover-bg rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.totalScore}%` }} className="h-full bg-gradient-to-r from-accent-start to-accent-end" />
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="card-glass p-6 space-y-3">
                      <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest">{t("resume.strengths")}</h3>
                      <div className="space-y-2">
                        {(analysis.highlights?.strengths?.length > 0) ? (
                          analysis.highlights.strengths.map((s: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-text-secondary items-start">
                              <ChevronRight size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-text-secondary opacity-50 italic">No strengths returned</p>
                        )}
                      </div>
                    </div>

                    {/* Areas to Improve */}
                    <div className="card-glass p-6 space-y-3">
                      <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest">{t("resume.areasToImprove")}</h3>
                      <div className="space-y-2">
                        {(analysis.highlights?.weaknesses?.length > 0) ? (
                          analysis.highlights.weaknesses.map((w: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-text-secondary items-start">
                              <ChevronRight size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                              <span>{w}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-text-secondary opacity-50 italic">No improvements returned</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border-subtle opacity-50">
                    <FileText size={48} className="mb-4 text-text-muted" />
                    <p className="text-sm font-medium">{t("resume.emptyState")}</p>
                  </div>
                )}
              </>
            )}

            {/* Enhance view */}
            {activeView === "enhance" && (
              <motion.div key="enhanced-panel" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                {isEnhancing ? (
                  <div className="card-glass p-12 text-center flex flex-col items-center gap-6">
                    <Loader2 size={48} className="animate-spin text-accent-start" />
                    <p className="font-bold text-lg animate-pulse">Enhancing your resume...</p>
                    <p className="text-text-secondary text-sm max-w-xs mx-auto">Our AI is rewriting your resume for maximum impact</p>
                  </div>
                ) : enhanced ? (
                  <div className="card-glass overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                      <div className="flex items-center gap-2 text-sm font-bold text-accent-start">
                        <Sparkles size={15} />
                        <span>{t("resume.aiEnhanced")}</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-hover-bg"
                      >
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="p-6 max-h-[560px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-text-secondary font-mono">
                      {enhanced}
                    </div>
                    <div className="px-6 py-4 border-t border-border-subtle flex gap-3">
                      <button className="btn-primary flex-1 cursor-pointer">{t("resume.download")}</button>
                      <button onClick={() => { setEnhanced(""); setActiveView("score"); }} className="btn-ghost px-4 cursor-pointer text-sm">{t("resume.discard")}</button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-border-subtle opacity-50">
                    <Sparkles size={48} className="mb-4 text-text-muted" />
                    <p className="text-sm font-medium">Upload a resume and click Enhance AI to get started</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Extracted Skills Section — Full Width Below Main Grid  */}
      {/* ═══════════════════════════════════════════════════════ */}

      <AnimatePresence>
        {(editableSkills.length > 0 || isExtracting) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-glass overflow-hidden">
              {/* Header */}
              <div className="px-8 py-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <Brain size={20} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight">Extracted Skills</h2>
                    <p className="text-sm text-text-secondary">
                      {isExtracting ? "AI is analyzing your resume..." : `${editableSkills.length} skills detected — click to edit`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/hidden-jobs"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent-start/30 text-accent-start hover:bg-accent-start/10 transition-all text-sm font-semibold"
                  >
                    <Briefcase size={16} />
                    <span>Find Matching Jobs</span>
                  </Link>
                  <button
                    onClick={handleSaveSkills}
                    disabled={isSavingSkills || editableSkills.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-start text-white hover:bg-accent-start/90 transition-all text-sm font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    {isSavingSkills ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : skillsSaved ? (
                      <Check size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>{skillsSaved ? "Saved!" : "Update Skills"}</span>
                  </button>
                </div>
              </div>

              {/* Skills Body */}
              <div className="px-8 py-6">
                {isExtracting ? (
                  <div className="flex items-center justify-center py-12 gap-4">
                    <Loader2 size={32} className="animate-spin text-violet-400" />
                    <div>
                      <p className="font-bold text-lg animate-pulse">Extracting Skills...</p>
                      <p className="text-sm text-text-secondary">Our AI is parsing your resume for all relevant skills</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Skill Tags Grid */}
                    <div className="flex flex-wrap gap-2.5" id="skills-tag-container">
                      {editableSkills.map((skill) => (
                        <motion.div
                          key={skill}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-bg-elevated border border-border-subtle hover:border-violet-400/30 transition-all"
                        >
                          <Tag size={12} className="text-violet-400" />
                          <span className="text-sm font-medium capitalize">{skill}</span>
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-text-secondary hover:text-red-400 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Add Skill Input */}
                    <div className="flex items-center gap-3 max-w-md">
                      <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle focus-within:border-violet-400/50 transition-colors">
                        <Plus size={16} className="text-text-secondary flex-shrink-0" />
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                          placeholder="Add a skill..."
                          className="bg-transparent text-sm text-text-primary placeholder:text-text-secondary/50 outline-none flex-1"
                          id="add-skill-input"
                        />
                      </div>
                      <button
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                        className="px-4 py-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-400/20 hover:bg-violet-500/20 transition-all text-sm font-semibold disabled:opacity-30 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Extracted Profile Summary */}
                    {extractedProfile && (extractedProfile.experience?.length > 0 || extractedProfile.projects?.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                        {extractedProfile.experience?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Experience</h4>
                            {extractedProfile.experience.slice(0, 3).map((exp: any, i: number) => (
                              <div key={i} className="bg-bg-elevated/50 rounded-lg p-3 border border-border-subtle">
                                <p className="text-sm font-semibold">{exp.title}</p>
                                <p className="text-xs text-text-secondary">{exp.company} · {exp.duration}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {extractedProfile.projects?.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Projects</h4>
                            {extractedProfile.projects.slice(0, 3).map((proj: any, i: number) => (
                              <div key={i} className="bg-bg-elevated/50 rounded-lg p-3 border border-border-subtle">
                                <p className="text-sm font-semibold">{proj.name}</p>
                                <p className="text-xs text-text-secondary line-clamp-2">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
