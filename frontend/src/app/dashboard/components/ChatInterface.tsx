"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, User } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "ai",
    content:
      "Hello! I'm your AI learning assistant. Ask me anything — from physics to programming, I'm here to help you understand concepts deeply.",
  },
  {
    role: "user",
    content: "What's the time complexity of binary search?",
  },
  {
    role: "ai",
    content:
      "Binary search has O(log n) time complexity. Each step halves the search space, so for n elements, you need at most log₂(n) comparisons. For example, searching through 1 million items takes at most ~20 steps!",
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        role: "ai",
        content:
          "That's a great question! Let me break it down for you step by step so it's easy to understand. The key concept here involves understanding the fundamental principles and applying them systematically.",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="glass-card overflow-hidden flex flex-col h-[460px]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">
            AI Doubt Solver
          </p>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Active
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-start gap-2.5 max-w-[80%]">
              {msg.role === "ai" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-white" />
                </div>
              )}
              <div
                className={`rounded-xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-accent-start/10 border border-accent-start/20 rounded-br-sm"
                    : "bg-bg-elevated border border-border-subtle rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed text-text-secondary">
                  {msg.content}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={12} className="text-text-secondary" />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-white" />
              </div>
              <div className="bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-text-secondary/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border-subtle">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 bg-bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-start/50 focus:ring-1 focus:ring-accent-start/20 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center flex-shrink-0 hover:brightness-110 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
