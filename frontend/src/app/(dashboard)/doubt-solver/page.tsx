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
  Bot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoubtSolver() {
  const { call } = useApi();
  const [query, setQuery] = useState("");
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
          content: "ERROR: " + err.message, 
          timestamp: new Date(),
          isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6">
      
      {/* Header Info */}
      <div className="flex justify-between items-end shrink-0">
          <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">AI Doubt <span className="gradient-text">Solver</span></h1>
              <p className="text-text-secondary text-sm">Upload images of problems, send voice notes, or just ask. Powered by <span className="text-accent-start font-bold">GEMINI 1.5</span>.</p>
          </div>
          <button 
            onClick={() => setMessages([])} 
            className="p-2 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
            title="Clear Chat"
          >
            <Trash2 size={20} />
          </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto card-glass p-0 relative border-border-subtle bg-white/[0.01]">
        <div className="absolute inset-0 p-8 flex flex-col gap-6 overflow-y-auto">
             {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4 opacity-50">
                     <Bot size={56} className="text-accent-start" />
                     <p className="text-lg font-bold">Ask anything.</p>
                     <p className="text-sm">I can transcribe your <span className="text-blue-400">voice</span>, see your <span className="text-green-400">images</span>, and solve complex <span className="text-accent-start">equations</span>.</p>
                 </div>
             )}
             
             {messages.map((msg, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                 >
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-accent-start text-white shadow-lg" : "bg-white/10"}`}>
                        {msg.role === "user" ? <UserCircle size={20} /> : <Sparkles size={20} className="text-accent-start" />}
                    </div>
                    <div className={`max-w-[80%] space-y-2`}>
                        <div className={`px-5 py-4 rounded-2xl leading-relaxed text-sm ${msg.role === "user" ? "bg-accent-start/10 border border-accent-start/20 text-text-primary" : "bg-white/5 border border-border-subtle text-text-secondary"}`}>
                            {msg.file && (
                                <div className="mb-3 px-3 py-2 bg-black/20 rounded-lg flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-accent-start">
                                    {msg.file.type === "image" ? <ImageIcon size={14}/> : <Mic size={14}/>}
                                    <span>Attached {msg.file.name}</span>
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
                 <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Sparkles size={20} className="text-accent-start animate-pulse" /></div>
                     <div className="px-5 py-4 bg-white/5 border border-border-subtle rounded-2xl flex items-center gap-3">
                         <Loader2 size={16} className="animate-spin text-accent-start" />
                         <span className="text-xs font-medium text-text-secondary">Synthesizing multimodal solution...</span>
                     </div>
                 </div>
             )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="card-glass p-0 border-border-subtle overflow-hidden relative">
          
          <input 
            type="file" 
            ref={fileRef} 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <AnimatePresence>
            {file && (
                <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="absolute bottom-full left-4 mb-2 p-2 px-3 bg-accent-start text-white text-[10px] font-bold rounded-lg flex items-center gap-2 shadow-xl border border-white/20">
                    {file.type.startsWith('image/') ? <ImageIcon size={12}/> : <Mic size={12}/>}
                    <span>{file.name} (Ready)</span>
                    <button onClick={() => setFile(null)} className="ml-2 hover:opacity-50"><Trash2 size={12} /></button>
                </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex items-center p-3 gap-2">
            <button 
                type="button" 
                onClick={() => fileRef.current?.click()}
                className="p-2.5 text-text-muted hover:text-accent-start transition-colors hover:bg-accent-start/5 rounded-xl cursor-pointer"
                title="Attach Media"
            >
                <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about that complex math problem or copy-paste text..."
              className="flex-1 bg-transparent border-none py-3 px-2 text-sm focus:outline-none placeholder:text-text-muted"
            />
            <button 
                disabled={isLoading || (!query && !file)}
                className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                    query || file ? "bg-accent-start text-white hover:bg-accent-end" : "bg-white/5 text-text-muted cursor-not-allowed"
                }`}
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </form>
      </div>

    </div>
  );
}
