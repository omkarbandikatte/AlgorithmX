"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Mic, Loader2, ArrowRight, ArrowLeft, UserCheck, Square, CheckCircle, AlertCircle, Video, List, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type InterviewResponse = {
  question: string;
  transcript: string;
  score: number;
  feedback: string;
  idealAnswer: string;
};

type InterviewSession = {
  id: string;
  date: string;
  role: string;
  techStack: string;
  score: number;
  responses: InterviewResponse[];
};

export default function MockInterview() {
  const { call } = useApi();
  
  // Storage
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  
  // Real-time states
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, InterviewResponse>>({});
  const [recording, setRecording] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [setupData, setSetupData] = useState({ role: "Frontend Developer", techStack: "Next.js, TypeScript", experience: 2 });
  const [showSummary, setShowSummary] = useState(false);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Load previous sessions
    const saved = localStorage.getItem("rakshak_ai_interviews");
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  const loadCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera/Mic access denied:", err);
      alert("Please allow camera permissions for proctoring.");
    }
  };

  const startSetup = async () => {
    setIsSynthesizing(true);
    setQuestions([]);
    setCurrentIndex(0);
    setResponses({});
    setShowSummary(false);

    try {
      const res = await call("/api/ai/interview/generate", {
        method: "POST",
        body: JSON.stringify(setupData)
      });
      if (res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        await loadCamera(); // Load camera only when actually starting the questions
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) await loadCamera();
    
    if (streamRef.current) {
      // Isolate audio track to satisfy audio/webm MediaRecorder requirements
      const audioStream = new MediaStream(streamRef.current.getAudioTracks());
      mediaRecorder.current = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await handleAudioSubmission(audioBlob);
      };

      mediaRecorder.current.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const finishSession = () => {
      // Save all answers and cleanup camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const responsesArray = Object.values(responses);
      const totalScore = responsesArray.reduce((acc, r) => acc + (r.score || 0), 0);
      const avgScore = responsesArray.length ? (totalScore / responsesArray.length) : 0;
      
      const newSession: InterviewSession = {
          id: Date.now().toString(),
          date: new Date().toLocaleString(),
          role: setupData.role,
          techStack: setupData.techStack,
          score: Math.round(avgScore),
          responses: responsesArray
      };

      const updated = [newSession, ...sessions];
      setSessions(updated);
      localStorage.setItem("rakshak_ai_interviews", JSON.stringify(updated));
      setShowSummary(true);
  };

  const handleAudioSubmission = async (blob: Blob) => {
    setIsEvaluating(true);
    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      
      const transcriptionRes = await call("/api/ai/interview/transcribe", {
        method: "POST",
        body: formData,
        headers: { } 
      });

      const userText = transcriptionRes.text || "Could not transcribe audio.";
      console.log("✅ Response Saved! Extracting Insights...");

      // 2. Evaluate
      const evaluationRes = await call("/api/ai/interview/evaluate", {
        method: "POST",
        body: JSON.stringify({
          question: questions[currentIndex],
          userAnswer: userText
        })
      });

      setResponses(prev => ({
          ...prev,
          [currentIndex]: {
              question: questions[currentIndex],
              transcript: userText,
              score: evaluationRes.score,
              feedback: evaluationRes.feedback,
              idealAnswer: evaluationRes.idealAnswer
          }
      }));

    } catch (err) {
      console.error("Pipeline error:", err);
      console.error("Pipeline Error: Failed to evaluate response.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
      if (currentIndex > 0) {
          setCurrentIndex(prev => prev - 1);
      }
  };

  const hasAnsweredCurrent = !!responses[currentIndex];

  if (showSummary) {
      const responsesArray = Object.values(responses);
      const totalScore = responsesArray.reduce((acc, r) => acc + (r.score || 0), 0);
      const avgScore = responsesArray.length ? (totalScore / questions.length) : 0;
      const percentage = Math.round(avgScore * 10);
      
      let performanceMessage = "Needs Improvement";
      let performanceColor = "text-red-400";
      if (percentage >= 80) {
          performanceMessage = "Excellent";
          performanceColor = "text-green-400";
      } else if (percentage >= 60) {
          performanceMessage = "Good";
          performanceColor = "text-yellow-400";
      }
      
      return (
        <div className="flex flex-col space-y-6 pb-24">
            <div className="space-y-1 shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Interview <span className="gradient-text">Summary</span></h1>
                <p className="text-text-secondary text-sm">Comprehensive performance analysis</p>
            </div>
            
            <div className="flex items-center gap-6 mb-2 p-6 card-glass border-border-subtle bg-white/5 rounded-2xl animate-fade-in-up">
                <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] shrink-0">
                    <span className="text-3xl font-black text-white">{percentage}%</span>
                </div>
                <div>
                     <h2 className="text-2xl font-bold">Session Complete</h2>
                     <p className="text-text-secondary mt-1 text-sm">Overall algorithmic rating across all {questions.length} questions.</p>
                     <p className={`mt-2 font-bold uppercase tracking-widest text-xs ${performanceColor}`}>
                         Performance: {performanceMessage}
                     </p>
                </div>
            </div>
            
            <div className="card-glass p-8 border-border-subtle bg-white/5 relative animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <h2 className="text-2xl font-bold mb-6">Recommendations & Feedback</h2>
                <div className="space-y-8">
                    {questions.map((q, i) => {
                        const resp = responses[i];
                        return (
                        <div key={i} className="p-6 bg-black/20 rounded-2xl border border-white/5 space-y-4">
                            <h3 className="font-bold text-lg text-accent-start">Q{i + 1}: {q}</h3>
                            {resp ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Your Answer (Score: {resp.score}/10)</p>
                                        <p className="text-sm text-text-secondary p-4 bg-white/5 rounded-xl">{resp.transcript}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Ideal Answer</p>
                                            <p className="text-sm text-green-400 p-4 bg-green-500/5 border border-green-500/10 rounded-xl">{resp.idealAnswer}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Feedback & improvement</p>
                                            <p className="text-sm text-blue-400 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">{resp.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-white/5 rounded-xl text-text-secondary text-sm italic">
                                    You skipped this question.
                                </div>
                            )}
                        </div>
                    )})}
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <button 
                        className="btn-primary flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-4 rounded-xl hover:scale-[1.02] transition-all cursor-pointer shadow-[0_0_20px_rgba(249,115,22,0.3)] border-none" 
                        onClick={startSetup}
                    >
                        Retake Interview
                    </button>
                    <button 
                        className="btn-primary flex-1 py-4 text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-white/10" 
                        onClick={() => { setQuestions([]); setShowSummary(false); setResponses({}); }}
                    >
                        Return to Hub
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (questions.length > 0) {
      const progressPercent = ((currentIndex) / questions.length) * 100;

      return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col font-sans animate-fade-in">
              {/* Full Background Video */}
              <video 
                 ref={videoRef} 
                 autoPlay 
                 muted 
                 playsInline 
                 className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
              
              {/* Overlay Gradient for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/80 pointer-events-none" />

              {/* Progress Bar */}
              <div className="absolute top-0 left-0 h-[6px] w-full bg-white/10 z-20 overflow-hidden">
                  <div className="h-full bg-accent-start transition-all duration-500 ease-out shadow-[0_0_15px_inherit]" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Question Overlay (Top) */}
              <div className="relative z-10 p-8 pt-12 flex flex-col items-center">
                  <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-sm font-bold uppercase tracking-widest text-accent-start mb-6">
                      Question {currentIndex + 1} of {questions.length} {hasAnsweredCurrent && "(Answered)"}
                  </div>
                  <motion.div key={currentIndex} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
                      <h3 className="text-3xl md:text-5xl font-bold leading-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] max-w-5xl mx-auto">
                          {questions[currentIndex]}
                      </h3>
                  </motion.div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Controls Overlay (Bottom) */}
              <div className="relative z-10 flex flex-col items-center px-4 pb-12 gap-8">
                  {/* Central Recording Control */}
                  <div className="flex justify-center items-center h-28">
                     {hasAnsweredCurrent ? (
                         <div className="bg-black/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-green-500/30 text-green-400 font-bold uppercase tracking-widest flex items-center gap-3">
                            <CheckCircle size={32} /> Saved for Summary
                         </div>
                     ) : isEvaluating ? (
                         <div className="bg-black/50 backdrop-blur-md px-8 py-4 rounded-3xl border border-accent-start/30 flex items-center gap-4">
                             <Loader2 size={32} className="animate-spin text-accent-start" />
                             <span className="text-sm text-accent-start animate-pulse uppercase tracking-widest font-bold">Saving Response...</span>
                         </div>
                     ) : recording ? (
                         <button onClick={stopRecording} className="w-24 h-24 bg-red-500/80 text-white rounded-full flex flex-col items-center justify-center hover:bg-red-500 transition-all hover:scale-105 active:scale-95 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.5)] backdrop-blur-lg">
                            <Square fill="currentColor" size={28} />
                         </button>
                     ) : (
                         <button onClick={startRecording} className="w-24 h-24 bg-accent-start/80 text-white rounded-full flex flex-col items-center justify-center hover:bg-accent-start transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(99,102,241,0.5)] backdrop-blur-lg group">
                            <Mic size={32} className="group-hover:scale-110 transition-transform" />
                         </button>
                     )}
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between w-full max-w-4xl bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl">
                      <button 
                          disabled={currentIndex === 0} 
                          onClick={prevQuestion} 
                          className="btn-primary py-3 px-6 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 border border-white/5 text-base rounded-xl flex items-center gap-2 transition-all">
                          <ArrowLeft size={20} /> Previous
                      </button>
                      
                      {currentIndex < questions.length - 1 ? (
                          <button 
                              onClick={nextQuestion} 
                              className="btn-primary py-3 px-8 bg-accent-start hover:bg-accent-start/90 text-white text-base rounded-xl flex items-center gap-2 transition-all border-none">
                              Next Question <ArrowRight size={20} />
                          </button>
                      ) : (
                          <button 
                              onClick={finishSession} 
                              className="btn-primary py-3 px-8 bg-green-500 hover:bg-green-400 text-white text-base rounded-xl flex items-center gap-2 border-none transition-all">
                              <CheckCircle size={20} /> Finish Interview
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="space-y-1 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">AI Mock <span className="gradient-text">Interview Hub</span></h1>
        <p className="text-text-secondary text-sm">Real-time proctoring & evaluations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
          {/* Setup Form */}
          <div className="card-glass p-8 border-border-subtle flex flex-col justify-center animate-fade-in-up">
             <div className="flex items-center gap-4 mb-8 text-accent-start">
                 <UserCheck size={32} />
                 <h2 className="text-xl font-bold text-text-primary">Start New Interview</h2>
             </div>
             
             <div className="space-y-4 mb-8">
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Target Role</label>
                 <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-start/50" value={setupData.role} onChange={(e) => setSetupData({...setupData, role: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Tech Stack</label>
                 <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-start/50" value={setupData.techStack} onChange={(e) => setSetupData({...setupData, techStack: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Years of Experience</label>
                 <input type="number" min="0" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-start/50" value={setupData.experience} onChange={(e) => setSetupData({...setupData, experience: parseInt(e.target.value) || 0})} />
               </div>
             </div>
  
             <button 
               className="w-full py-4 text-white text-base bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)] font-bold cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed" 
               onClick={startSetup}
               disabled={isSynthesizing}
             >
                {isSynthesizing ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} /> Generating Questions...
                    </span>
                ) : "Initiate Interview"}
             </button>
          </div>

          {/* Previous Interviews */}
          <div className="card-glass p-8 border-border-subtle flex flex-col animate-fade-in-up" style={{ animationDelay: "100ms" }}>
             <div className="flex items-center gap-4 mb-8 text-accent-start">
                 <List size={32} />
                 <h2 className="text-xl font-bold text-text-primary">Previous Interviews</h2>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-4">
                {sessions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-50 space-y-4">
                       <AlertCircle size={48} />
                       <p className="text-sm">No previous interview sessions found.</p>
                    </div>
                ) : (
                    sessions.map((s) => (
                        <div key={s.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center group cursor-pointer hover:border-accent-start/30 transition-all">
                            <div>
                                <h3 className="font-bold text-sm">{s.role}</h3>
                                <p className="text-xs text-text-secondary">{s.techStack}</p>
                                <p className="text-[10px] text-text-muted mt-2">{s.date}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-accent-start font-black text-xl flex items-center gap-1">{s.score}<Star size={14} fill="currentColor" /></div>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
      </div>
    </div>
  );
}
