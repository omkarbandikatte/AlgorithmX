"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as blazeface from "@tensorflow-models/blazeface";
import { AlertTriangle, UserX, Users, EyeOff, XCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ProctoringReport {
  tabSwitches: number;
  fullscreenExits: number;
  noFace: number;
  multipleFaces: number;
  lookingAway: number;
  attentionScore: number;
  isTerminated: boolean;
}

interface ProctoringManagerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTerminate: (reason: string) => void;
  onUpdateReport: (report: ProctoringReport) => void;
}

const MAX_TAB_SWITCHES = 3;
const MAX_FULLSCREEN_EXITS = 3;

export function ProctoringManager({ videoRef, onTerminate, onUpdateReport }: ProctoringManagerProps) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detector, setDetector] = useState<blazeface.BlazeFaceModel | null>(null);
  
  // Violations & Live State
  const [violations, setViolations] = useState({
    tabSwitches: 0,
    fullscreenExits: 0,
    noFace: 0,
    multipleFaces: 0,
    lookingAway: 0,
  });
  const [attentionScore, setAttentionScore] = useState(100);
  
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [statusFlags, setStatusFlags] = useState<{
    noFace: boolean;
    multipleFaces: boolean;
    lookingAway: boolean;
  }>({
    noFace: false,
    multipleFaces: false,
    lookingAway: false,
  });

  const detectionIntervalRef = useRef<any>(null);
  const scoreTickRef = useRef<any>(null);

  // Sync report
  useEffect(() => {
    onUpdateReport({
      ...violations,
      attentionScore,
      isTerminated: false
    });
  }, [violations, attentionScore]);

  // Handle Warnings
  const displayWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 4000);
  };

  // Termination Check
  const triggerTermination = useCallback((reason: string) => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    if (scoreTickRef.current) clearInterval(scoreTickRef.current);
    
    onUpdateReport({
      ...violations,
      attentionScore,
      isTerminated: true
    });
    onTerminate(reason);
  }, [violations, attentionScore, onUpdateReport, onTerminate]);

  // Model Initialization
  useEffect(() => {
    let active = true;
    const loadModel = async () => {
      try {
        await tf.ready();
        const det = await blazeface.load();
        if (active) {
          setDetector(det);
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.error("Face detection model load failed", err);
      }
    };
    loadModel();
    return () => { active = false; };
  }, []);

  // Continuous Tracking Logic
  useEffect(() => {
    if (!isModelLoaded || !detector || !videoRef.current) return;

    let framesWithNoFace = 0;
    let framesWithMultiple = 0;

    const detectFaces = async () => {
      const video = videoRef.current;
      if (!video || video.readyState !== 4) return;

      try {
        const faces = await detector.estimateFaces(video, false);

        // Evaluator
        if (faces.length === 0) {
          framesWithNoFace++;
          framesWithMultiple = 0;
          setStatusFlags(prev => ({ ...prev, noFace: true, multipleFaces: false }));
          
          if (framesWithNoFace === 20) { // Approx 2-3 seconds at 100ms intervals
            setViolations(prev => ({ ...prev, noFace: prev.noFace + 1 }));
            setAttentionScore(prev => Math.max(0, prev - 5));
            displayWarning("Face not detected! Please stay in frame.");
          }
          if (framesWithNoFace > 100) { // Approx 10s
             triggerTermination("No face detected for more than 10 seconds.");
          }
        } 
        else if (faces.length > 1) {
          framesWithMultiple++;
          framesWithNoFace = 0;
          setStatusFlags(prev => ({ ...prev, multipleFaces: true, noFace: false }));
          
          if (framesWithMultiple === 15) {
            setViolations(prev => ({ ...prev, multipleFaces: prev.multipleFaces + 1 }));
            setAttentionScore(prev => Math.max(0, prev - 10));
            displayWarning("Multiple persons detected in frame!");
          }
          if (framesWithMultiple > 50) { // Approx 5 seconds
             triggerTermination("Multiple people detected repeatedly.");
          }
        } 
        else {
          // Exactly 1 face
          framesWithNoFace = 0;
          framesWithMultiple = 0;
          setStatusFlags(prev => ({ ...prev, noFace: false, multipleFaces: false }));
          
          // Basic looking away check (distance of eyes vs nose logic, simplified)
          const landmarks = (faces[0].landmarks as any) || [];
          if (landmarks && landmarks.length >= 3) {
             // Blazeface landmarks: 0 = right eye, 1 = left eye, 2 = nose
             const rightEye = landmarks[0];
             const leftEye = landmarks[1];
             const noseTip = landmarks[2];
             
             if (leftEye && rightEye && noseTip) {
                const eyeDist = Math.abs(leftEye[0] - rightEye[0]);
                const noseToLeft = Math.abs(noseTip[0] - leftEye[0]);
                const noseToRight = Math.abs(noseTip[0] - rightEye[0]);
                
                // Ratio checking for looking away
                const ratio = noseToLeft / (eyeDist + 0.0001);
                
                // If nose is incredibly close to one eye horizontally, they turned their head hard
                if (ratio < 0.2 || ratio > 0.8) {
                    setStatusFlags(prev => ({ ...prev, lookingAway: true }));
                    setViolations(prev => ({ ...prev, lookingAway: prev.lookingAway + 1 }));
                    setAttentionScore(prev => Math.max(0, prev - 2));
                } else {
                    setStatusFlags(prev => ({ ...prev, lookingAway: false }));
                }
             }
          }
        }
      } catch (err) {
        // Ignore silent TFJS errors during tracking
      }
    };

    detectionIntervalRef.current = setInterval(detectFaces, 200);

    // Score regeneration tick
    scoreTickRef.current = setInterval(() => {
       setAttentionScore(prev => Math.min(100, prev + 1));
    }, 5000);

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      if (scoreTickRef.current) clearInterval(scoreTickRef.current);
    };
  }, [isModelLoaded, detector, videoRef, triggerTermination]);

  // Browser Environment Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const switches = prev.tabSwitches + 1;
          if (switches >= MAX_TAB_SWITCHES) {
            triggerTermination(`Exceeded tab switches limit (${MAX_TAB_SWITCHES})`);
          } else {
            displayWarning(`Tab switch detected! (${switches}/${MAX_TAB_SWITCHES} warnings)`);
          }
          return { ...prev, tabSwitches: switches };
        });
        setAttentionScore(prev => Math.max(0, prev - 15));
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setViolations(prev => {
          const exits = prev.fullscreenExits + 1;
          if (exits >= MAX_FULLSCREEN_EXITS) {
            triggerTermination(`Exceeded fullscreen exists limit (${MAX_FULLSCREEN_EXITS})`);
          } else {
            displayWarning(`Leaving fullscreen is not allowed! (${exits}/${MAX_FULLSCREEN_EXITS} warnings)`);
          }
          return { ...prev, fullscreenExits: exits };
        });
      }
    };

    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        displayWarning("Copying is disabled during the interview");
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopy);
    
    // Blur window
    window.addEventListener("blur", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopy);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, [triggerTermination]);


  return (
    <>
      <AnimatePresence>
        {warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-0 left-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-[0_0_40px_rgba(239,68,68,0.5)] font-bold flex items-center gap-3 border border-red-400"
          >
            <AlertTriangle size={24} />
            {warningMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-40 bg-black/60 backdrop-blur-md border border-border-subtle p-3 rounded-2xl flex flex-col gap-2 min-w-[160px]">
        <div className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
           Proctoring <ShieldAlert size={14} className={violations.tabSwitches > 0 ? "text-yellow-500" : "text-green-500"} />
        </div>
        
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusFlags.noFace ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className={`text-xs font-semibold ${statusFlags.noFace ? 'text-red-400' : 'text-text-primary'}`}>
                {statusFlags.noFace ? 'No Face Detected' : 'Face Detected'}
            </span>
        </div>

        {statusFlags.multipleFaces && (
           <div className="flex items-center gap-2 text-red-500">
              <Users size={12} /> <span className="text-xs font-bold">Multiple People</span>
           </div>
        )}

        {statusFlags.lookingAway && (
           <div className="flex items-center gap-2 text-yellow-500">
              <EyeOff size={12} /> <span className="text-xs font-bold">Looking Away</span>
           </div>
        )}

        <div className="mt-2 pt-2 border-t border-border-subtle flex justify-between items-center">
            <span className="text-[10px] uppercase text-text-muted font-bold tracking-widest">Attn Score</span>
            <span className={`text-sm font-black ${attentionScore < 50 ? 'text-red-500' : attentionScore < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                {attentionScore}%
            </span>
        </div>
      </div>
    </>
  );
}