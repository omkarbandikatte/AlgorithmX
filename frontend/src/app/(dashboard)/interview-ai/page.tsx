"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { ProctoringManager, ProctoringReport } from "@/components/dashboard/ProctoringManager";
import { 
  Mic, 
  StopCircle, 
  Loader2, 
  CheckCircle,
  Award,
  Settings,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  Lightbulb,
  Check,
  ShieldX
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIMockInterview() {
  const { call } = useApi();
  
  // Step State
  const [step, setStep] = useState<"setup" | "interview" | "results">("setup");
  
  // Config
  const [role, setRole] = useState("Frontend Engineer");
  const [techStack, setTechStack] = useState("React, Next.js, TypeScript");
  const [experience, setExperience] = useState<number>(2);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingSetup, setIsLoadingSetup] = useState(false);

  // Interview Active State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "transcribing" | "evaluating" | "done">("idle");
  const [transcripts, setTranscripts] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<any[]>([]);

  // Proctoring
  const [proctorReport, setProctorReport] = useState<ProctoringReport | null>(null);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null); // For Web Speech API

  // Fullscreen & Webcam setup when interview starts
  useEffect(() => {
    if (step === "interview") {
      // Enter Fullscreen Mode
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => console.log("Fullscreen restriction:", err));
      }

      // Initialize Webcam & Microphone
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Device access denied:", err);
          alert("Please allow Camera & Microphone access to proceed.");
        });

      return () => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(e => console.log(e));
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
      };
    }
  }, [step]);

  // Question TTS - Automatically read the question when it's displayed
  const playTTS = (text: string) => {
    window.speechSynthesis.cancel(); // Stop actively instantly
    
    // Tiny timeout ensures previous playback is completely wiped from browser queue before reading new one
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  useEffect(() => {
    if (step === "interview" && questions[currentQIndex]) {
      playTTS(questions[currentQIndex]);
    }
  }, [step, currentQIndex, questions]);

  const startSetup = async () => {
    setIsLoadingSetup(true);
    try {
      const res = await call("/api/ai/mock-interview/generate", {
        method: "POST",
        body: JSON.stringify({ role, techStack, experience })
      });
      setQuestions(res.questions || []);
      setStep("interview");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSetup(false);
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Your browser does not support real-time speech recognition. Please use Google Chrome or Edge.");
        return;
      }

      setIsRecording(true);
      window.speechSynthesis.cancel(); // Stop reading if they start answering

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      // Preserve existing text so clicking stop/start appends instead of overwriting
      const previousText = transcripts[currentQIndex] ? transcripts[currentQIndex] + " " : "";

      recognition.onresult = (event: any) => {
        let interimText = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
             finalChunk += event.results[i][0].transcript;
          } else {
             interimText += event.results[i][0].transcript;
          }
        }
        
        setTranscripts(prev => ({...prev, [currentQIndex]: previousText + finalChunk + interimText}));
      };

      recognition.onerror = (event: any) => console.error("Speech recognition error", event.error);

      recognition.start();
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
    }
    setIsRecording(false);
    processAudio(transcripts[currentQIndex] || "");
  };

  const processAudio = async (recordedTranscript: string) => {
    const idx = currentQIndex;
    const currentQuestion = questions[idx];

    // Instantly mark as done processing since text is already parsed locally
    if (currentQIndex === idx) setRecordingStatus("done");

    // Don't evaluate inherently empty strings to save API calls
    if (!recordedTranscript || recordedTranscript.trim() === "") {
        markSkippedIfNeeded(idx);
        return;
    }

    try {
      // Skip Whisper transcriber API entirely! 
      // Proceed straight to LLM Evaluator in the background invisibly.
      call("/api/ai/mock-interview/evaluate", {
        method: "POST",
        body: JSON.stringify({ question: currentQuestion, userAnswer: recordedTranscript })
      }).then(evalRes => {
        setEvaluations(prev => {
          const newArr = [...prev];
          newArr[idx] = {
             question: currentQuestion,
             transcript: recordedTranscript,
             score: evalRes.score,
             feedback: evalRes.feedback,
             idealAnswer: evalRes.idealAnswer
          };
          return newArr;
        });
      }).catch(err => console.error("Evaluation failed:", err));

    } catch (err) {
      console.error("Audio processing failed:", err);
      // Fallback
    }
  };

  const markSkippedIfNeeded = (idx: number) => {
    if (!transcripts[idx] || transcripts[idx] === "") {
      const skipText = `q${idx + 1}. skipped qs by user`;
      setTranscripts(prev => ({...prev, [idx]: skipText}));
      setEvaluations(prev => {
        const newArr = [...prev];
        newArr[idx] = {
           question: questions[idx],
           transcript: skipText,
           score: 0,
           feedback: "You skipped this question without answering. It resulted in a score of 0.",
           idealAnswer: "In a real interview, never skip a question entirely. If you don't know an answer, communicate your thought process or ask clarifying questions."
        };
        return newArr;
      });
    }
  };

  const goPrev = () => {
    if (currentQIndex > 0) {
      window.speechSynthesis.cancel(); // Stop talking instantly on click
      markSkippedIfNeeded(currentQIndex);
      setCurrentQIndex(prev => prev - 1);
      // Wait a tick to ensure state syncs cleanly
      setTimeout(() => setRecordingStatus(evaluations[currentQIndex - 1] ? "done" : transcripts[currentQIndex - 1] ? "done" : "idle"), 0);
    }
  };

  const goNext = () => {
    window.speechSynthesis.cancel(); // Stop talking instantly on click
    markSkippedIfNeeded(currentQIndex);
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTimeout(() => setRecordingStatus(evaluations[currentQIndex + 1] ? "done" : transcripts[currentQIndex + 1] ? "done" : "idle"), 0);
    } else {
      endInterview();
    }
  };

  const endInterview = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }
    setStep("results");
  };

  const handleProctorTermination = (reason: string) => {
     setTerminationReason(reason);
     window.speechSynthesis.cancel();
     endInterview();
  };

  const resetSession = () => {
    setStep("setup");
    setCurrentQIndex(0);
    setTranscripts({});
    setEvaluations([]);
    setQuestions([]);
    setRecordingStatus("idle");
    setProctorReport(null);
    setTerminationReason(null);
  };

  /* ───── RENDER SETUP ───── */
  if (step === "setup") {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent-start/10 mx-auto flex items-center justify-center mb-6">
                <Settings size={32} className="text-accent-start" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Configure Interview</h1>
            <p className="text-text-secondary text-sm">Our AI will generate highly personalized technical questions based on your explicit parameters.</p>
        </div>

        <div className="card-glass p-8 space-y-6 border-border-subtle">
           <div className="space-y-4">
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Target Role</label>
                 <input 
                    value={role} onChange={e => setRole(e.target.value)}
                    className="w-full bg-hover-bg border border-border-subtle rounded-xl p-3 text-sm focus:outline-none focus:border-accent-start/50 transition-colors" 
                    placeholder="e.g. Backend Developer"
                 />
              </div>
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Tech Stack</label>
                 <input 
                    value={techStack} onChange={e => setTechStack(e.target.value)}
                    className="w-full bg-hover-bg border border-border-subtle rounded-xl p-3 text-sm focus:outline-none focus:border-accent-start/50 transition-colors" 
                    placeholder="e.g. Node.js, Express, MongoDB"
                 />
              </div>
              <div>
                 <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block flex justify-between">
                    Years of Experience <span className="text-accent-start">{experience} YOE</span>
                 </label>
                 <input 
                    type="range" min="0" max="10" step="1"
                    value={experience} onChange={e => setExperience(parseInt(e.target.value))}
                    className="w-full accent-accent-start cursor-pointer" 
                 />
                 <div className="flex justify-between text-[10px] text-text-muted font-bold mt-1">
                    <span>Fresher</span>
                    <span>Mid-Level</span>
                    <span>Architect</span>
                 </div>
              </div>
           </div>

           <button 
              onClick={startSetup} 
              disabled={isLoadingSetup || !role || !techStack}
              className="btn-primary w-full flex justify-center items-center gap-2 cursor-pointer py-4 mt-8"
           >
              {isLoadingSetup ? <><Loader2 size={18} className="animate-spin" /> Generating AI Curriculum...</> : "Generate & Start Interview"}
           </button>
        </div>
      </div>
    );
  }

  /* ───── RENDER RESULTS ───── */
  if (step === "results") {
    // Filter out empty/skipped evaluations
    const validEvals = evaluations.filter(e => e && e.score !== undefined);
    const avgScore = questions.length > 0 
      ? validEvals.reduce((acc, curr) => acc + (curr.score || 0), 0) / questions.length 
      : 0;
    const percentage = Math.round((avgScore / 10) * 100);
    
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-700 pb-12">
          <div className="card-glass p-12 text-center space-y-6">
              {terminationReason ? (
                <div className="w-24 h-24 rounded-full bg-red-500/10 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <ShieldX size={48} className="text-red-500" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-green-500/10 mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]">
                    <Award size={48} className="text-green-500" />
                </div>
              )}
              
              <div>
                  <h1 className="text-4xl font-black">
                     {terminationReason ? (
                        <>Interview <span className="text-red-400">Terminated</span></>
                     ) : (
                        <>Interview <span className="text-green-400">Complete</span></>
                     )}
                  </h1>
                  
                  {terminationReason ? (
                     <p className="text-red-400 font-bold mt-4 text-lg">Reason: {terminationReason}</p>
                  ) : (
                     <p className="text-text-secondary mt-2">Overall Performance Score: <strong className="text-xl text-text-primary ml-2">{avgScore.toFixed(1)}/10 ({percentage}%)</strong></p>
                  )}
              </div>
          </div>

          {proctorReport && (
            <div className="card-glass border-border-subtle p-8 space-y-6 bg-red-500/5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-red-400 border-b border-red-500/20 pb-2">Proctoring Report</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Tab Switches</span>
                      <p className="text-2xl font-black text-white">{proctorReport.tabSwitches}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Fullscreen Exits</span>
                      <p className="text-2xl font-black text-white">{proctorReport.fullscreenExits}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Absence Count</span>
                      <p className="text-2xl font-black text-white">{proctorReport.noFace}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Multiple People</span>
                      <p className="text-2xl font-black text-white">{proctorReport.multipleFaces}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Looking Away</span>
                      <p className="text-2xl font-black text-white">{proctorReport.lookingAway}</p>
                   </div>
                   <div className="space-y-1">
                      <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Attention Score</span>
                      <p className={`text-2xl font-black ${proctorReport.attentionScore < 50 ? 'text-red-500' : 'text-green-500'}`}>{proctorReport.attentionScore}%</p>
                   </div>
                </div>
            </div>
          )}
          
          <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest border-b border-border-subtle pb-2">Detailed Breakdown</h3>
              {evaluations.map((evalData, idx) => {
                  if (!evalData) return null; // skipped questions
                  return (
                      <div key={idx} className="card-glass p-8 space-y-6 border-border-subtle">
                          {/* Q header */}
                          <div className="flex justify-between items-start gap-4">
                              <div>
                                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1 block">Question {idx + 1}</span>
                                  <p className="text-lg font-bold">{evalData.question}</p>
                              </div>
                              <div className={`px-4 py-2 rounded-xl text-sm font-black shrink-0 ${evalData.score >= 7 ? 'bg-green-500/20 text-green-400' : evalData.score >= 4 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {evalData.score} / 10
                              </div>
                          </div>

                          {/* Transcribed Answer */}
                          <div className="bg-hover-bg rounded-xl p-4 border border-border-subtle">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 block">Your Spoken Answer</span>
                              <p className="text-sm text-text-secondary italic">"{evalData.transcript}"</p>
                          </div>

                          {/* Feedback & Ideal */}
                          <div className="grid md:grid-cols-2 gap-4 pt-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-green-400">
                                    <ThumbsUp size={16} /> The Correct Answer
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed bg-green-400/5 border border-green-400/10 p-4 rounded-xl">{evalData.idealAnswer}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                                    <Lightbulb size={16} /> Evaluator Feedback
                                </div>
                                <p className="text-sm text-text-secondary leading-relaxed bg-red-400/5 border border-red-400/10 p-4 rounded-xl">{evalData.feedback}</p>
                              </div>
                          </div>
                      </div>
                  );
              })}
          </div>

          <div className="flex justify-center mt-12">
            <button onClick={resetSession} className="btn-primary px-10">Start Another Session</button>
          </div>
      </div>
    );
  }

  /* ───── RENDER INTERVIEW ROOM (Fullscreen/Webcam active) ───── */
  const currentText = transcripts[currentQIndex] || "";

  return (
    <div className="h-[90vh] py-4 flex flex-col space-y-4 max-w-7xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Header / Progress */}
      <div className="flex justify-between items-center bg-bg-surface p-4 rounded-2xl border border-border-subtle shrink-0">
        <div className="flex items-center gap-4">
           <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 'bg-green-500'}`} />
           <span className="font-bold text-sm tracking-wide uppercase">Active Simulation</span>
        </div>
        <div className="font-mono text-sm font-bold text-text-muted flex gap-2">
           {questions.map((_, i) => (
             <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i === currentQIndex ? 'bg-accent-start' : i < currentQIndex ? 'bg-green-500/50' : 'bg-hover-bg'}`} />
           ))}
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid lg:grid-cols-4 gap-6 flex-1 min-h-0">
          
          {/* Main Question & Video Feed */}
          <div className="lg:col-span-3 flex flex-col gap-4 relative">
               
               {/* Question Prompt */}
               <div className="card-glass p-8 border-border-subtle shrink-0">
                  <span className="text-xs font-black uppercase tracking-[3px] text-accent-start mb-4 block">Question {currentQIndex + 1} of {questions.length}</span>
                  <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
                      {questions[currentQIndex]}
                  </h2>
               </div>

               {/* Video Feed Area */}
               <div className="flex-1 w-full bg-black/60 rounded-3xl overflow-hidden border border-border-subtle relative flex items-center justify-center">
                  
                  <ProctoringManager 
                     videoRef={videoRef} 
                     onTerminate={handleProctorTermination}
                     onUpdateReport={setProctorReport}
                  />

                  <video 
                    ref={videoRef}
                    autoPlay 
                    muted 
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-700 ${isRecording ? 'opacity-100' : 'opacity-70 grayscale-[30%]'}`}
                  />
                  {recordingStatus === "transcribing" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-accent-start backdrop-blur-sm gap-4">
                        <Loader2 size={48} className="animate-spin text-accent-start" />
                        <span className="font-black tracking-widest uppercase">Deciphering...</span>
                    </div>
                  )}
               </div>
          </div>

          {/* Right Sidebar Controls & Transcript */}
          <div className="lg:col-span-1 flex flex-col gap-4">
              
              {/* Live Transcript (No feedback shown here!) */}
              <div className="card-glass border-border-subtle flex-1 flex flex-col p-6 min-h-[300px]">
                 <span className="text-[10px] font-black uppercase tracking-[2px] text-text-muted mb-4 block">Candidate Transcript</span>
                 
                 {isRecording ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 gap-4">
                         <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <Mic size={32} />
                         </div>
                         <p className="text-sm font-bold uppercase tracking-widest">Listening...</p>
                     </div>
                 ) : currentText ? (
                     <div className="flex-1 overflow-y-auto text-sm leading-relaxed text-text-secondary italic bg-hover-bg rounded-xl p-4 border border-border-subtle">
                         "{currentText}"
                     </div>
                 ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 gap-2">
                        <Mic size={24} />
                        <p className="text-xs max-w-[150px]">Click Start to answer. Feedback is collected and shown at the end.</p>
                     </div>
                 )}

                 {/* Status Indicator */}
                 {recordingStatus === "done" && (
                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm font-bold bg-green-400/10 px-4 py-3 rounded-xl justify-center">
                        <CheckCircle size={16} /> Answer Logged
                    </div>
                 )}
              </div>

              {/* Action Buttons Panel */}
              <div className="card-glass p-6 border-border-subtle flex flex-col gap-4 shrink-0">
                  <button 
                     onClick={isRecording ? stopRecording : startRecording}
                     className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl cursor-pointer ${
                       isRecording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-accent-start text-white hover:bg-accent-end'
                     }`}
                  >
                     {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                     {isRecording ? "Stop Listening" : "Start Listening"}
                  </button>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={goPrev} disabled={currentQIndex === 0 || isRecording}
                        className="bg-hover-bg hover:bg-white/10 p-3 rounded-xl flex items-center justify-center gap-1 text-sm font-bold disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        <ChevronLeft size={16}/> Prev
                      </button>
                      <button 
                        onClick={goNext} disabled={isRecording}
                        className="bg-hover-bg hover:bg-white/10 p-3 rounded-xl flex items-center justify-center gap-1 text-sm font-bold disabled:opacity-30 cursor-pointer transition-colors"
                      >
                        {currentQIndex === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16}/>
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}