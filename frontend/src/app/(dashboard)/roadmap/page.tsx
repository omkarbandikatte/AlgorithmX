"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { 
  Network, 
  Search, 
  Zap, 
  Loader2, 
  Info, 
  HelpCircle,
  X,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import RoadmapGraph from "@/components/roadmap/RoadmapGraph";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function RoadmapGenerator() {
  const { call } = useApi();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  
  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Auto-Save Effect
  const handleAutoSave = async (data: any) => {
    try {
      await call("/api/ai/roadmap/save", {
        method: "POST",
        body: JSON.stringify({ topic: data.topic || topic, nodes: data.nodes, edges: data.edges })
      });
      console.log("Roadmap Auto-saved successfully");
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  };

  useEffect(() => {
    if (!searchParams) return;
    const auto = searchParams.get("auto");
    const tParam = searchParams.get("topic");
    if (auto === "true" && tParam) {
        setTopic(tParam);
        handleGenerate(null, tParam);
    }
  }, [searchParams]);

  const handleGenerate = async (e: any, overrideTopic?: string) => {
    if (e) e.preventDefault();
    const targetTopic = overrideTopic || topic;
    if (!targetTopic) return;

    setIsLoading(true);
    setRoadmap(null);
    setSelectedNode(null);
    setCompletedNodes(new Set());

    try {
      const res = await call("/api/ai/roadmap", { method: "POST", body: JSON.stringify({ topic: targetTopic, language }) });
      setRoadmap(res);
      handleAutoSave(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNodeCompletion = (nodeId: string) => {
      const next = new Set(completedNodes);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      setCompletedNodes(next);
  };

  const progress = roadmap?.nodes?.length ? Math.round((completedNodes.size / roadmap.nodes.length) * 100) : 0;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-8 relative">
      
      {/* Progress & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div className="space-y-4 flex-1">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Interactive <span className="gradient-text">Neural Roadmap</span></h1>
                <p className="text-text-secondary text-sm">Follow your personalized AI learning path and track mastery.</p>
              </div>
              
              {roadmap && (
                  <div className="max-w-md space-y-2">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                           <span>Overall Mastery</span>
                           <span className="text-accent-start">{progress}%</span>
                       </div>
                       <div className="h-2 bg-hover-bg rounded-full overflow-hidden border border-border-subtle p-[2px]">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-accent-start rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                       </div>
                  </div>
              )}
          </div>
          
          <form onSubmit={handleGenerate} className="flex-1 max-w-lg mb-1">
              <div className="card-glass p-1.5 flex items-center gap-2 border-border-subtle hover:border-accent-start/30 transition-all">
                  <div className="pl-4 text-text-muted"><Search size={18} /></div>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic: e.g. Quantum Computing" className="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none placeholder:text-text-muted" />
                  <button disabled={isLoading || !topic} className="btn-primary btn-sm px-6">
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} <span>{isLoading ? "Generating..." : "Generate"}</span>
                  </button>
              </div>
          </form>
      </div>

      <div className="flex-1 card-glass p-0 border-border-subtle overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-md gap-4">
                    <Loader2 size={48} className="animate-spin text-accent-start" />
                    <p className="font-bold text-lg animate-pulse tracking-widest uppercase">Building Neural Pathway...</p>
                </motion.div>
            ) : roadmap ? (
                <motion.div key="graph" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full h-full">
                    <RoadmapGraph 
                        nodes={roadmap.nodes.map((n: any) => ({ ...n, isCompleted: completedNodes.has(n.id) }))} 
                        edges={roadmap.edges} 
                        onNodeClick={(node: any) => { 
                            setSelectedNode(node); 
                            setQuizIndex(0); 
                            setQuizScore(0); 
                            setQuizFinished(false); 
                        }} 
                    />
                </motion.div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-50"><Network size={64} className="text-indigo-500/30" /><p className="text-lg font-bold">Your journey begins here.</p></div>
            )}
          </AnimatePresence>

          {/* Detailed Side Panel */}
          <AnimatePresence>
            {selectedNode && (
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="absolute top-0 right-0 h-full w-[400px] bg-bg-surface/95 backdrop-blur-2xl border-l border-border-subtle z-20 shadow-2xl p-8 flex flex-col overflow-y-auto">
                    <button onClick={() => setSelectedNode(null)} className="absolute top-6 right-6 p-2 text-text-muted hover:text-white"><X size={20}/></button>
                    
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent-start/10 flex items-center justify-center text-accent-start"><Info size={24}/></div>
                        <div className="space-y-1">
                             <h4 className="text-2xl font-black">{selectedNode.data.label}</h4>
                             <p className="text-[10px] font-black uppercase text-accent-start tracking-widest">Active Module</p>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed p-4 bg-hover-bg rounded-xl border border-border-subtle">{selectedNode.data.description}</p>

                        <div className="space-y-4 pt-4 border-t border-border-subtle">
                             <h5 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Learning Tools</h5>
                             <button 
                                onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedNode.data.youtubeQuery || selectedNode.data.label)}`, '_blank')}
                                className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl flex items-center justify-center gap-3 text-xs font-bold transition-all hover:bg-red-500 hover:text-white"
                             >
                                 <Zap size={14}/> Watch Video Tutorial
                             </button>

                             {/* Interactive Quiz */}
                             <div className="card-glass border-accent-start/10 bg-accent-start/5 p-6 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <h6 className="text-xs font-bold text-accent-start flex items-center gap-2"><HelpCircle size={14}/> Knowledge Validation</h6>
                                 {!quizFinished ? (
                                     <div className="space-y-4">
                                         <p className="text-sm font-semibold">{selectedNode.data.quiz?.[quizIndex]?.question || "No quiz for this node."}</p>
                                         <div className="space-y-2">
                                             {selectedNode.data.quiz?.[quizIndex]?.options.map((opt: string) => (
                                                 <button 
                                                    key={opt}
                                                    onClick={() => {
                                                        if (opt === selectedNode.data.quiz[quizIndex].correctAnswer) setQuizScore(s => s + 1);
                                                        if (quizIndex < 2) setQuizIndex(i => i + 1); else setQuizFinished(true);
                                                    }}
                                                    className="w-full text-left p-3 bg-bg-surface border border-border-subtle rounded-xl text-xs hover:border-accent-start transition-all"
                                                 >
                                                     {opt}
                                                 </button>
                                             ))}
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="text-center space-y-3 py-2">
                                         <p className="text-xl font-black">Score: {quizScore}/3</p>
                                         <p className="text-xs text-text-secondary">{quizScore >= 2 ? "Mastery achieved!" : "Keep learning."}</p>
                                         <button onClick={() => {setQuizIndex(0); setQuizScore(0); setQuizFinished(false);}} className="text-[10px] uppercase font-black text-accent-start underline">Redo Quiz</button>
                                     </div>
                                 )}
                             </div>
                        </div>

                        <button 
                            onClick={() => toggleNodeCompletion(selectedNode.id)}
                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${completedNodes.has(selectedNode.id) ? 'bg-green-500 text-white shadow-lg' : 'bg-hover-bg text-text-muted hover:text-text-primary'}`}
                        >
                            {completedNodes.has(selectedNode.id) ? "✓ Mastered" : "Mark as Mastered"}
                        </button>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

    </div>
  );
}


