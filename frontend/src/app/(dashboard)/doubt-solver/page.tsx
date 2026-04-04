"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Video,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import "@/i18n";

export default function DoubtSolver() {
  const { call } = useApi();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const { t } = useTranslation();
  
  // State 
  const [activeTab, setActiveTab] = useState<"chat" | "talk">("chat");
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Chat Session Management
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Sessions from Backend
  useEffect(() => {
    async function fetchSessions() {
        try {
            const data = await call("/api/user/doubts");
            if (data && Array.isArray(data)) {
                setSessions(data);
                if (data.length > 0 && !currentSessionId) {
                    setCurrentSessionId(data[0].id);
                    setMessages(data[0].messages || []);
                }
            }
        } catch (e) {
            console.error("Failed to load sessions from cloud", e);
        }
    }
    fetchSessions();
  }, []);

  // Sync to Cloud after messages update
  const saveSessionToCloud = async (id: string, title: string, msgs: any[]) => {
      try {
          await call("/api/save-doubt-session", {
              method: "POST",
              body: JSON.stringify({ sessionId: id, title, messages: msgs })
          });
      } catch (e) {
          console.error("Sync failed", e);
      }
  };

  // Voice/Deep Link Automation
  useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get("tab");
    if (tab === "talk" || tab === "chat") setActiveTab(tab as any);
  }, [searchParams]);

  // Speech to Text (Input)
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(prev => prev + " " + transcript);
    };
    recognition.onend = () => setIsListening(false);
    
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  // Text to Speech (Output)
  const speakAnswer = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const startNewChat = () => {
    const newSession = {
      id: Date.now().toString(),
      title: "New Session",
      messages: [],
      timestamp: new Date()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const switchSession = (id: string) => {
      const session = sessions.find(s => s.id === id);
      if (session) {
          setCurrentSessionId(id);
          setMessages(session.messages);
      }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query && !file) return;

    if (!currentSessionId) {
        const id = Date.now().toString();
        setCurrentSessionId(id);
    }

    const userMessage = { 
        role: "user", 
        content: query, 
        file: file ? { name: file.name, type: file.type.split('/')[0] } : null,
        timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    setQuery("");
    setFile(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("query", query);
    formData.append("language", language);
    if (file) formData.append("file", file);

    try {
      const res = await call("/api/ai/doubt-solver", { method: "POST", body: formData });
      const botMessage = { role: "bot", content: res.answer, timestamp: new Date() };
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);

      // Update Session Title & Messages
      setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId || (!currentSessionId && s === prev[0])) {
              return { ...s, messages: finalMessages, title: query.substring(0, 30) + (query.length > 30 ? "..." : "") };
          }
          return s;
      }));
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "bot", content: "ERROR: " + err.message, timestamp: new Date(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-0 -m-8 overflow-hidden">
      
      {/* Header Tabs */}
      <div className="flex items-center justify-between p-6 px-10 border-b border-border-subtle bg-bg-surface shrink-0">
          <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold flex items-center gap-3">
                  <span className="p-2 bg-accent-start/10 text-accent-start rounded-lg"><Sparkles size={20}/></span>
                  Doubt <span className="text-text-muted">Assistance</span>
              </h1>
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-hover-bg rounded-xl border border-border-subtle shrink-0">
              <button 
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "chat" ? "bg-accent-start text-white shadow-lg shadow-accent-start/20" : "text-text-muted hover:text-text-primary"
                }`}
              >
                  <MessageCircle size={14} /> <span>Interactive Chat</span>
              </button>
              <button 
                onClick={() => setActiveTab("talk")}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "talk" ? "bg-accent-start text-white shadow-lg shadow-accent-start/20" : "text-text-muted hover:text-text-primary"
                }`}
              >
                  <Video size={14} /> <span>Real-time Talk</span>
              </button>
          </div>
      </div>

      {activeTab === "chat" ? (
        <div className="flex flex-1 min-h-0">
            {/* Sidebar (ChatGPT Style) */}
            <div className="w-64 border-r border-border-subtle flex flex-col p-4 space-y-4 bg-bg-surface/50 backdrop-blur-md">
                <button 
                    onClick={startNewChat}
                    className="w-full flex items-center justify-between p-3 border border-border-subtle hover:border-accent-start/50 bg-hover-bg rounded-xl text-sm font-bold transition-all group"
                >
                    <span>New Chat</span>
                    <Sparkles size={14} className="text-text-muted group-hover:text-accent-start"/>
                </button>

                <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 px-2">History</p>
                    {sessions.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => switchSession(s.id)}
                            className={`w-full text-left p-3 rounded-lg text-xs truncate transition-all ${currentSessionId === s.id ? 'bg-accent-start/10 text-accent-start font-bold border border-accent-start/20' : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'}`}
                        >
                            {s.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 flex flex-col min-h-0 bg-bg-primary/30 relative">
                <div className="flex-1 overflow-y-auto p-4 md:p-12 space-y-8 pb-32">
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-20">
                            <Bot size={64} className="mb-4 text-accent-start"/>
                            <h2 className="text-2xl font-black">Neural Solver</h2>
                            <p className="text-sm max-w-xs mt-2 italic px-8">Snap an image, upload a file, or just ask. I'm trained to solve complex problems in real-time.</p>
                        </div>
                    )}

                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 md:gap-8 max-w-4xl mx-auto w-full group ${msg.role === 'user' ? 'justify-end' : ''}`}
                            >
                                {msg.role === 'bot' && (
                                    <div className="w-10 h-10 rounded-xl bg-accent-start text-white flex items-center justify-center shadow-lg shadow-accent-start/20 shrink-0">
                                        <Sparkles size={20}/>
                                    </div>
                                )}
                                <div className={`flex-1 min-w-0 space-y-2 ${msg.role === 'user' ? 'max-w-[80%]' : ''}`}>
                                    <div className={`p-6 rounded-2xl text-[15px] leading-relaxed relative ${msg.role === 'user' ? 'bg-bg-surface border border-border-subtle ml-auto' : 'bg-transparent'}`}>
                                        {msg.file && (
                                            <div className="mb-4 p-3 bg-accent-start/5 border border-accent-start/10 rounded-xl flex items-center gap-3">
                                                <div className="w-10 h-10 bg-accent-start/10 rounded-lg flex items-center justify-center text-accent-start">
                                                    {msg.file.type === 'image' ? <ImageIcon size={20}/> : <Mic size={20}/>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-black uppercase text-accent-start">Attached Data</p>
                                                    <p className="text-xs font-bold truncate">{msg.file.name}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        
                                        {msg.role === 'bot' && (
                                            <button 
                                                onClick={() => speakAnswer(msg.content)}
                                                className="absolute -right-12 top-4 p-2 text-text-muted hover:text-accent-start opacity-0 group-hover:opacity-100 transition-all"
                                                title="Read aloud"
                                            >
                                                <Mic size={18}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-10 h-10 rounded-xl bg-hover-bg flex items-center justify-center text-text-muted shrink-0">
                                        <UserCircle size={24}/>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="max-w-4xl mx-auto w-full flex gap-8">
                            <div className="w-10 h-10 rounded-xl bg-accent-start/20 flex items-center justify-center text-accent-start">
                                <Loader2 size={18} className="animate-spin"/>
                            </div>
                            <div className="pt-2">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-accent-start rounded-full animate-bounce"/>
                                    <div className="w-1 h-1 bg-accent-start rounded-full animate-bounce [animation-delay:0.2s]"/>
                                    <div className="w-1 h-1 bg-accent-start rounded-full animate-bounce [animation-delay:0.4s]"/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Bar (Centered) */}
                <div className="absolute bottom-8 inset-x-0 w-full px-4 flex justify-center">
                    <div className="w-full max-w-3xl card-glass p-0 border-border-subtle bg-bg-surface/80 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
                        <input type="file" ref={fileRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        
                        <AnimatePresence>
                            {file && (
                                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }} className="p-4 border-b border-border-subtle flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-accent-start rounded-lg flex items-center justify-center text-white"><ImageIcon size={14}/></div>
                                        <span className="text-xs font-bold text-text-primary">{file.name}</span>
                                    </div>
                                    <button onClick={() => setFile(null)} className="p-1 hover:bg-hover-bg rounded text-text-muted"><X size={16}/></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSend} className="flex items-end p-2 gap-2">
                            <button type="button" onClick={() => fileRef.current?.click()} className="p-3 text-text-muted hover:text-text-primary transition-all rounded-xl"><Paperclip size={24}/></button>
                            <textarea 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                placeholder="Message Neural Solver..." 
                                rows={1}
                                className="flex-1 bg-transparent border-none py-3 px-2 text-[15px] focus:outline-none resize-none max-h-32 overflow-y-auto"
                            />
                            <button 
                                type="button" 
                                onClick={toggleListening}
                                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/10 text-red-500' : 'text-text-muted hover:text-accent-start'}`}
                            >
                                <Mic size={24} className={isListening ? "animate-pulse" : ""} />
                            </button>
                            <button className={`p-3 rounded-xl transition-all ${query || file ? "bg-accent-start text-white shadow-xl" : "text-text-muted opacity-30 cursor-not-allowed"}`} disabled={!query && !file}>
                                <Send size={24} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 card-glass p-0 border-border-subtle overflow-hidden bg-black shadow-2xl">
            <iframe src="https://bey.chat/daf9df35-bc48-4a7a-9470-1c6fb476c308" width="100%" height="100%" frameBorder="0" allowFullScreen allow="camera; microphone; fullscreen" style={{ border: "none" }} />
        </motion.div>
      )}
    </div>
  );
}
