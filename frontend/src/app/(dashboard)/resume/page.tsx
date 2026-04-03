"use client";

import React, { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  Loader2,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeHub() {
  const { call } = useApi();
  const [isImporting, setIsImporting] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [enhanced, setEnhanced] = useState<string>("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError("");
    setAnalysis(null);
    setEnhanced("");

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
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScoring(false);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      const res = await call("/api/ai/resume/enhance", {
        method: "POST",
        body: JSON.stringify({ resumeText, focusArea: "All sections for maximum impact" })
      });
      setEnhanced(res.enhancedText);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Resume <span className="gradient-text">Hub</span></h1>
        <p className="text-text-secondary">Analyze, score, and rewrite your resume for the next generation of hiring.</p>
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
            />
            <div className="flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-start/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileUp size={32} className="text-accent-start" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{isImporting ? "Parsing Document..." : "Drop your Resume here"}</p>
                <p className="text-sm text-text-secondary">Compatible with PDF and DOCX formats.</p>
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
                        <span>Extracted Text</span>
                    </div>
                    <button 
                      onClick={handleEnhance} 
                      disabled={isEnhancing}
                      className="btn-primary btn-sm group cursor-pointer"
                    >
                      {isEnhancing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />}
                      <span>Enhance Application</span>
                    </button>
                </div>
                <div className="bg-white/5 border border-border-subtle rounded-xl p-6 h-[400px] overflow-y-auto text-sm text-text-secondary leading-relaxed font-mono whitespace-pre-wrap">
                  {resumeText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Results */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {isScoring ? (
              <motion.div key="scoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glass p-12 text-center flex flex-col items-center gap-6">
                 <Loader2 size={48} className="animate-spin text-accent-start" />
                 <p className="font-bold text-lg animate-pulse">Running Neural Analysis...</p>
                 <p className="text-text-secondary text-sm max-w-xs mx-auto">Evaluating grammar, impact, cross-referencing industry keywords, and scoring structural clarity.</p>
              </motion.div>
            ) : analysis ? (
              <motion.div key="analysis" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
                
                {/* Total Score */}
                <div className="card-glass p-8 bg-gradient-to-br from-white/5 to-white/2 relative overflow-hidden">
                    <div className="flex justify-between items-end mb-8 relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-accent-start">Analysis Complete</h2>
                            <p className="text-4xl font-black">{analysis.totalScore}<span className="text-lg text-text-secondary font-medium">/100</span></p>
                        </div>
                        <CheckCircle2 size={40} className="text-green-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        {Object.entries(analysis.breakdown || {}).map(([key, val]: any) => (
                            <div key={key} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{key}</p>
                                <p className="text-sm font-bold">{val as string}</p>
                            </div>
                        ))}
                    </div>
                    
                    {/* Visual progress bar */}
                    <div className="mt-8 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.totalScore}%` }} className="h-full bg-gradient-to-r from-accent-start to-accent-end" />
                    </div>
                </div>

                {/* Highlights */}
                <div className="grid gap-4">
                    <div className="card-glass p-6 space-y-3">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest">Strengths</h3>
                        <div className="space-y-2">
                             {Array.isArray(analysis.highlights?.strengths) && analysis.highlights.strengths.map((s: any, i: number) => (
                                 <div key={i} className="flex gap-3 text-sm text-text-secondary">
                                     <ChevronRight size={18} className="text-accent-start flex-shrink-0" />
                                     <span>{s}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                    <div className="card-glass p-6 space-y-3">
                        <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest">Areas to Improve</h3>
                        <div className="space-y-2">
                             {Array.isArray(analysis.highlights?.weaknesses) && analysis.highlights.weaknesses.map((w: any, i: number) => (
                                 <div key={i} className="flex gap-3 text-sm text-text-secondary">
                                     <ChevronRight size={18} className="text-accent-start flex-shrink-0" />
                                     <span>{w}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
              </motion.div>
            ) : enhanced ? (
                <motion.div key="enhanced" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-accent-start">
                        <Sparkles size={16} /> 
                        <span>AI Enhanced Version</span>
                    </div>
                    <div className="card-glass p-8 bg-blue-400/5 border-blue-400/10 min-h-[500px]">
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary italic">
                            {enhanced}
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button className="btn-primary w-full cursor-pointer">Download Optimized PDF</button>
                            <button onClick={() => setEnhanced("")} className="btn-ghost px-6 cursor-pointer text-sm">Discard</button>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white/2 rounded-3xl border border-dashed border-border-subtle opacity-50">
                    <FileText size={48} className="mb-4 text-text-muted" />
                    <p className="text-sm font-medium">Upload a resume to see the neural analysis score and AI enhancement options here.</p>
                </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
