"use client";

import React, { useState, useRef } from "react";
import { useApi } from "@/hooks/useApi";
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image as ImageIcon, 
  Sparkles, 
  UserCircle,
  Loader2,
  Trash2,
  Bot,
  MessageCircle,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";

export default function DoubtSolver() {
  const { call } = useApi();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"chat" | "talk">("chat");
  const [query, setQuery] = useState("");
  
  // Voice/Deep Link Automation
  React.useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get("tab");
    if (tab === "talk" || tab === "chat") {
        setActiveTab(tab as any);
    }
  }, [searchParams]);
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query && !file) return;

    const userMessage = { 
        role: "user", 
        content: query, 
        file: file ? { name: file.name, type: file.type.split('/')[0] } : null,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    const currentFile = file;
    
    setQuery("");
    setFile(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("query", currentQuery);
    if (currentFile) {
        formData.append("file", currentFile);
    }

    try {
      const res = await call("/api/ai/doubt-solver", {
        method: "POST",
        body: formData
      });
      
      setMessages(prev => [...prev, { 
          role: "bot", 
          content: res.answer, 
          timestamp: new Date() 
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
          role: "bot", 
          content: "ERROR: Failed to synthesize solution. " + err.message, 
          timestamp: new Date(),
          isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      
      {/* Tab Switcher & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
          <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Doubt <span className="gradient-text">Assistance</span></h1>
              <p className="text-text-secondary text-sm">Switch between neural chat solving and real-time voice talk.</p>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-hover-bg rounded-2xl border border-border-subtle backdrop-blur-xl">
              <button 
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "chat" ? "bg-accent-start text-white shadow-lg shadow-accent-start/20" : "text-text-muted hover:text-text-primary"
                }`}
              >
                  <MessageCircle size={16} />
                  <span>Interactive Chat</span>
              </button>
              <button 
                onClick={() => setActiveTab("talk")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "talk" ? "bg-accent-start text-white shadow-lg shadow-accent-start/20" : "text-text-muted hover:text-text-primary"
                }`}
              >
                  <Video size={16} />
                  <span>Real-time Talk</span>
              </button>
          </div>
      </div>

      {activeTab === "chat" ? (
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Chat Area */}
            <div className="flex-1 card-glass p-0 border-border-subtle relative overflow-hidden">
                <div className="absolute inset-0 p-8 flex flex-col gap-6 overflow-y-auto">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-50">
                            <Bot size={56} className="text-accent-start" />
                            <p className="text-lg font-bold">Expert Neural Solver.</p>
                            <p className="text-sm italic">"Ask me about complex algorithms, math equations via image, or voice notes."</p>
                        </div>
                    )}
                    
                    {messages.map((msg, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-accent-start text-white shadow-lg" : "bg-hover-bg"}`}>
                                {msg.role === "user" ? <UserCircle size={20} /> : <Sparkles size={20} className="text-accent-start" />}
                            </div>
                            <div className={`max-w-[75%] space-y-2`}>
                                <div className={`px-5 py-4 rounded-2xl leading-relaxed text-sm ${msg.role === "user" ? "bg-accent-start/5 border border-accent-start/20" : "bg-hover-bg border border-border-subtle"}`}>
                                    {msg.file && (
                                        <div className="mb-3 px-3 py-2 bg-black/20 rounded-lg flex items-center gap-2 text-[10px] uppercase font-black text-accent-start italic">
                                            {msg.file.type === "image" ? <ImageIcon size={14}/> : <Mic size={14}/>}
                                            ATTACHED: {msg.file.name}
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                                <p className={`text-[10px] text-text-muted font-bold ${msg.role === "user" ? "text-right" : ""}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                                </p>
                            </div>
                        </motion.div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-hover-bg flex items-center justify-center text-accent-start"><Sparkles size={20}/></div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">AI Synthesis in progress...</span>
                        </div>
                    )}
                </div>
                <button onClick={() => setMessages([])} className="absolute top-6 right-6 p-2 text-text-muted hover:text-red-400 transition-colors"><Trash2 size={20}/></button>
            </div>

            {/* Input Component */}
            <div className="card-glass p-0 border-border-subtle overflow-hidden relative shadow-2xl">
                <input type="file" ref={fileRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <AnimatePresence>
                    {file && (
                        <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="absolute bottom-full left-4 mb-3 p-2.5 bg-accent-start text-white text-[10px] font-black rounded-lg flex items-center gap-3 shadow-xl tracking-widest uppercase">
                            {file.type.startsWith('image/') ? <ImageIcon size={14}/> : <Mic size={14}/>}
                            <span>{file.name} (Buffered)</span>
                            <button onClick={() => setFile(null)} className="hover:opacity-50"><X size={14} /></button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <form onSubmit={handleSend} className="flex items-center p-3 gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="p-3 text-text-muted hover:text-accent-start transition-all hover:bg-hover-bg rounded-xl"><Paperclip size={22} /></button>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Submit your doubt or attach an image..." className="flex-1 bg-transparent border-none py-3 px-2 text-sm focus:outline-none" />
                    <button className={`p-4 rounded-xl shadow-xl transition-all ${query || file ? "bg-accent-start text-white hover:bg-accent-end" : "bg-hover-bg text-text-muted"}`}>
                        <Send size={22} />
                    </button>
                </form>
            </div>
        </div>
      ) : (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 card-glass p-0 border-border-subtle overflow-hidden bg-black shadow-2xl"
        >
            <iframe 
                src="https://bey.chat/daf9df35-bc48-4a7a-9470-1c6fb476c308" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen
                allow="camera; microphone; fullscreen"
                style={{ border: "none" }}
            />
        </motion.div>
      )}

    </div>
  );
}

function X({ size, className }: any) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
