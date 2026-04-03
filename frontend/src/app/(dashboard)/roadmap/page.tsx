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

export default function RoadmapGenerator() {
  const { call } = useApi();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Voice/Deep Link Auto-Trigger
  useEffect(() => {
    if (!searchParams) return;
    const auto = searchParams.get("auto");
    const t = searchParams.get("topic");
    if (auto === "true" && t) {
        setTopic(t);
        handleAutoGenerate(t);
    }
  }, [searchParams]);

  const handleAutoGenerate = async (t: string) => {
    setIsLoading(true);
    try {
      const res = await call("/api/ai/roadmap", { method: "POST", body: JSON.stringify({ topic: t }) });
      setRoadmap(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setRoadmap(null);
    setSelectedNode(null);

    try {
      const res = await call("/api/ai/roadmap", {
        method: "POST",
        body: JSON.stringify({ topic })
      });
      setRoadmap(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-8 relative">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
          <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">AI Roadmap <span className="gradient-text">Generator</span></h1>
              <p className="text-text-secondary text-sm">Visualize your learning journey from beginner to expert in seconds.</p>
          </div>
          
          <form onSubmit={handleGenerate} className="flex-1 max-w-lg mb-1">
              <div className="card-glass p-1.5 flex items-center gap-2 border-border-subtle hover:border-accent-start/30 transition-all">
                  <div className="pl-4 text-text-muted"><Search size={18} /></div>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a skill (e.g., DSA, Rust, Quantum Computing)..." 
                    className="flex-1 bg-transparent border-none py-2 text-sm focus:outline-none placeholder:text-text-muted"
                  />
                  <button 
                    disabled={isLoading || !topic}
                    className="btn-primary btn-sm px-6 cursor-pointer"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    <span>{isLoading ? "Generating..." : "Generate Graph"}</span>
                  </button>
              </div>
          </form>
      </div>

      {/* Main Graph View */}
      <div className="flex-1 card-glass p-0 border-border-subtle overflow-hidden relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-md gap-4">
                    <Loader2 size={48} className="animate-spin text-accent-start" />
                    <p className="font-bold text-lg animate-pulse tracking-widest uppercase">Building Neural Pathway...</p>
                    <p className="text-sm text-text-secondary">Synthesizing dependencies and curriculum nodes.</p>
                </motion.div>
            ) : roadmap ? (
                <motion.div key="graph" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full h-full">
                    <RoadmapGraph 
                        nodes={roadmap.nodes} 
                        edges={roadmap.edges} 
                        onNodeClick={(node: any) => setSelectedNode(node)} 
                    />
                </motion.div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-50">
                    <Network size={64} className="text-accent-start text-indigo-500/30" />
                    <p className="text-lg font-bold">Your journey begins with a query.</p>
                    <p className="text-sm">Input a topic above and we'll generate a custom interactve curriculum visualized as a graph.</p>
                </div>
            )}
          </AnimatePresence>

          {/* Side Panel (Node Details) */}
          <AnimatePresence>
            {selectedNode && (
                <motion.div 
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }}
                    className="absolute top-0 right-0 h-full w-80 bg-bg-surface/95 backdrop-blur-2xl border-l border-border-subtle z-20 shadow-2xl p-8 flex flex-col"
                >
                    <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 text-text-muted hover:text-white"><X size={20}/></button>
                    
                    <div className="mt-8 space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent-start/10 flex items-center justify-center text-accent-start"><Info size={24}/></div>
                        <div className="space-y-2">
                             <h4 className="text-2xl font-black">{selectedNode.data.label}</h4>
                             <p className="text-[10px] font-black uppercase text-accent-start tracking-[2px]">Resource Module</p>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed bg-hover-bg border border-border-subtle p-4 rounded-xl">
                            {selectedNode.data.description}
                        </p>

                        <div className="pt-6 border-t border-border-subtle space-y-4">
                            <button className="btn-primary w-full text-xs gap-3">
                                <Zap size={14}/> Dive Deep into Topics
                            </button>
                            <button className="btn-ghost w-full text-xs gap-3 flex items-center justify-center border-border-subtle hover:border-accent-start/30">
                                <HelpCircle size={14}/> Ask AI about this
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto px-1 group cursor-pointer">
                         <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                             <span>Learning Stats</span>
                             <span className="text-accent-start">Pro Level</span>
                         </div>
                         <div className="h-1.5 w-full bg-hover-bg rounded-full overflow-hidden">
                             <div className="h-full w-1/4 bg-accent-start" />
                         </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </div>

    </div>
  );
}
