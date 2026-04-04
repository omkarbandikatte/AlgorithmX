"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2, Sparkles, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import "@/i18n";

// Speech Recognition Type (Web Speech API)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function VoiceConcierge() {
  const { call } = useApi();
  const router = useRouter();
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState("");

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setFeedback(t("voice.listening"));
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceCommand(text);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback(t("voice.error"));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleVoiceCommand = async (text: string) => {
    setIsProcessing(true);
    setFeedback(t("voice.thinking"));
    
    try {
      const action = await call("/api/ai/voice-command", {
        method: "POST",
        body: JSON.stringify({ prompt: text, language })
      });

      setFeedback(action.speech);
      
      // AI Voice Feedback (TTS)
      const utterance = new SpeechSynthesisUtterance(action.speech);
      utterance.lang = language;
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (langVoice) {
         utterance.voice = langVoice;
      }
      window.speechSynthesis.speak(utterance);

      // Execute Action
      if (action.action === "NAVIGATE" || action.action === "EXECUTE") {
        let finalPath = action.path;
        const params = new URLSearchParams();

        if (action.payload?.topic) params.set("topic", action.payload.topic);
        if (action.payload?.tab) params.set("tab", action.payload.tab);
        if (action.action === "EXECUTE") params.set("auto", "true");

        const queryString = params.toString();
        if (queryString) finalPath += `?${queryString}`;

        router.push(finalPath);
      }

      setTimeout(() => setFeedback(""), 4000);
    } catch (err) {
      setFeedback(t("voice.error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-3">
      
      {/* Feedback Bubble */}
      <AnimatePresence>
          {(feedback || transcript) && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="card-glass p-4 max-w-xs mb-2 border-accent-start/30 shadow-[0_0_40px_rgba(255,107,0,0.2)]"
              >
                  <p className="text-[10px] uppercase font-black tracking-widest text-accent-start mb-1 flex items-center gap-2">
                    {isProcessing ? t("voice.processing") : isListening ? t("voice.recognized") : t("voice.feedback")}
                  </p>
                  <p className="text-sm font-bold text-text-primary leading-snug">
                    {feedback || transcript}
                  </p>
              </motion.div>
          )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={startListening}
        disabled={isProcessing}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 relative group overflow-hidden ${
          isListening ? "bg-red-500 shadow-red-500/20" : "bg-gradient-to-br from-accent-start to-accent-end shadow-accent-start/20"
        }`}
      >
          {isProcessing ? (
              <Loader2 className="animate-spin text-white" />
          ) : isListening ? (
              <MicOff className="text-white" />
          ) : (
              <Mic className="text-white" />
          )}
          
          <div className="absolute inset-0 bg-hover-bg opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Animated rings for listening state */}
          {isListening && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-red-400 -z-10"
              />
          )}
      </motion.button>
    </div>
  );
}
