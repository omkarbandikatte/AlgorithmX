"use client";

import React, { useState, useMemo } from "react";
import { ConceptPreviewCard, Concept } from "@/components/learn/ConceptPreviewCard";
import { X, PlayCircle, LogOut, Youtube, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Sample array of 30 Tech videos
const conceptsData: Concept[] = [
  { id: "1", title: "Controlled vs Uncontrolled Components", description: "Understand how React handles form inputs using state vs DOM. Deep dive into practical applications.", videoId: "w7ejDZ8SWv8", duration: "12:45", category: "React" },
  { id: "2", title: "Event Loop in Node.js Explained", description: "A visual guide to the Node.js event loop, call stack, callback queue, and web APIs.", videoId: "8aGhZQkoFbQ", duration: "25:30", category: "Node.js" },
  { id: "3", title: "Tailwind CSS Next.js Setup", description: "Learn how to effectively utilize utility classes and configure Tailwind CSS in your Next.js app.", videoId: "pfaSUYaSgRo", duration: "15:00", category: "CSS" },
  { id: "4", title: "MongoDB Aggregation Pipeline", description: "Master $match, $group, $project and the powerful features of MongoDB Aggregation framework.", videoId: "Kk6Er0c7srU", duration: "32:10", category: "Database" },
  { id: "5", title: "Next.js App Router Masterclass", description: "Complete breakdown of the new App Router, Server Actions, and layout architecture.", videoId: "ZjAqacIC_3c", duration: "45:20", category: "Next.js" },
  { id: "6", title: "TypeScript Generics Explained", description: "Advanced TypeScript generic types, utility types, and how to write truly reusable code.", videoId: "nViEqZZXNB0", duration: "18:50", category: "TypeScript" },
  { id: "7", title: "Docker Containers for Beginners", description: "Containerize your web applications easily. Learn Dockerfiles, images, and docker-compose.", videoId: "pTFZFxd4hOI", duration: "21:15", category: "DevOps" },
  { id: "8", title: "React Context API Tutorial", description: "Avoid prop drilling by heavily utilizing the Context API for global state management.", videoId: "5LrDIWkK_Bc", duration: "14:05", category: "React" },
  { id: "9", title: "Express.js Middleware Anatomy", description: "Write custom middleware for logging, authentication, and error handling in Express.", videoId: "lY6icfhap2o", duration: "19:40", category: "Backend" },
  { id: "10", title: "PostgreSQL vs MongoDB", description: "When to choose a relational SQL database over a NoSQL document database, and why.", videoId: "NoXTuZjCEcw", duration: "28:00", category: "Database" },
  { id: "11", title: "Framer Motion Animations", description: "Implement beautiful, complex UI animations across React components with Framer Motion.", videoId: "zVzEw5A-I-U", duration: "11:15", category: "CSS" },
  { id: "12", title: "Redux Toolkit Crash Course", description: "Modern Redux simplified: slices, Thunks, and seamless immutable state updates.", videoId: "9zySeP5vH9c", duration: "35:10", category: "React" },
  { id: "13", title: "GraphQL API with Apollo", description: "Stop over-fetching data. Build a robust GraphQL layer using Apollo Server and Client.", videoId: "ed8SzALpx1Q", duration: "42:00", category: "Backend" },
  { id: "14", title: "CSS Grid vs Flexbox", description: "The ultimate showdown. When to use 2D Grid layouts versus 1D Flexbox properties.", videoId: "hs3piaN4b5I", duration: "17:25", category: "CSS" },
  { id: "15", title: "WebSockets in Real-time Apps", description: "Build real-time chat functionality using WebSockets, Socket.IO, and Node.js.", videoId: "1BfCnjr_Vjg", duration: "24:30", category: "Backend" },
  { id: "16", title: "JWT Authentication Strategy", description: "Secure your APIs using JSON Web Tokens, refresh tokens, and strict HTTP-only cookies.", videoId: "mbsmsi7l3r4", duration: "30:45", category: "Security" },
  { id: "17", title: "Cypress E2E Testing", description: "Write automated end-to-end tests for modern web applications using Cypress.", videoId: "u8vMu7viCm8", duration: "16:50", category: "Testing" },
  { id: "18", title: "React Query Data Fetching", description: "Cache, synchronize, and update server state effortlessly with TanStack query.", videoId: "NovZzmaOQfQ", duration: "22:30", category: "React" },
  { id: "19", title: "Building Microservices", description: "Architectural overview of breaking a monolith into independent, scalable microservices.", videoId: "C1TJOZlChtc", duration: "48:10", category: "DevOps" },
  { id: "20", title: "Git Rebase vs Merge", description: "Clean up your commit history. Learn the precise difference between rebasing and merging.", videoId: "CRlGDDprdOQ", duration: "14:20", category: "Tools" },
  { id: "21", title: "Vite JS Bundler Magic", description: "Why Vite is vastly faster than Webpack and how HMR (Hot Module Replacement) works.", videoId: "KCrXgy8qtjM", duration: "19:05", category: "Tools" },
  { id: "22", title: "React useEffect Mistakes", description: "Stop creating infinite loops. The definitive guide to the useEffect dependency array.", videoId: "QQYeipc_cik", duration: "27:15", category: "React" },
  { id: "23", title: "OAuth 2.0 Explained", description: "How third-party authentication systems like 'Login with Google' actually function.", videoId: "CPbvxxSlD0E", duration: "21:00", category: "Security" },
  { id: "24", title: "Serverless Architecture", description: "Deploying highly scalable web applications without managing traditional servers.", videoId: "uxPbJzE_0Yc", duration: "33:40", category: "DevOps" },
  { id: "25", title: "Zustand State Management", description: "A simple, fast, and scalable barebones state-management solution for React.", videoId: "BnbJ4g6dYwI", duration: "10:50", category: "React" },
  { id: "26", title: "Mongoose ODM Deep Dive", description: "Schemas, models, pre/post hooks, and populating relationships in MongoDB via Node.js.", videoId: "DZBGEVgL2eE", duration: "29:15", category: "Database" },
  { id: "27", title: "PWA Service Workers", description: "Implement offline capabilities in your web app using intelligent Service Workers.", videoId: "sFSsJVmHAmY", duration: "26:40", category: "Web" },
  { id: "28", title: "Web Accessibility (A11y)", description: "Making the web usable by everyone: ARIA attributes, color contrast, and semantic HTML.", videoId: "20SHvU2PKsM", duration: "20:00", category: "Web" },
  { id: "29", title: "Redis Caching Basics", description: "Massively speed up your backend response times using in-memory Redis caching.", videoId: "jgpVdJB2sKQ", duration: "15:30", category: "Backend" },
  { id: "30", title: "WebRTC vs Server-Sent Events", description: "Understanding the right protocol for your real-time duplex communication needs.", videoId: "Y2A8f6-nO9U", duration: "18:25", category: "Backend" },
];

export default function LearnConcepts() {
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConcepts = useMemo(() => {
    if (!searchQuery.trim()) return conceptsData;
    const query = searchQuery.toLowerCase();
    return conceptsData.filter(
      (concept) =>
        concept.title.toLowerCase().includes(query) ||
        concept.description.toLowerCase().includes(query) ||
        concept.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Automatically opens the YouTube video after reading the modal
  const handleMasterConcept = () => {
    if (selectedConcept) {
      window.open(`https://www.youtube.com/watch?v=${selectedConcept.videoId}`, "_blank");
      console.log(`[Analytics] Started playing: ${selectedConcept.title}`);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 py-6 pr-4">
      
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-6 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-[#F97316]/10 text-[#F97316] rounded-xl">
                    <PlayCircle size={28} />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black">Learn Concepts</h1>
                  <p className="text-text-secondary text-sm mt-1">A curated library of essential software engineering concepts.</p>
                </div>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-text-secondary" />
              </div>
              <input
                type="text"
                placeholder="Search by title, topic, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-border-subtle rounded-xl bg-bg-surface/40 hover:bg-bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 placeholder:text-text-secondary/50 transition-colors shadow-sm"
              />
            </div>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
         {filteredConcepts.length > 0 ? (
           filteredConcepts.map(concept => (
              <ConceptPreviewCard 
                key={concept.id} 
                concept={concept}
                onPreview={setSelectedConcept}
              />
           ))
         ) : (
           <div className="col-span-full py-12 text-center text-text-secondary border border-dashed border-border-subtle rounded-2xl bg-bg-surface/50">
             <p>No concepts found matching "{searchQuery}". Try a different keyword.</p>
           </div>
         )}
      </div>

      {/* Detail Modal Preview */}
      <AnimatePresence>
        {selectedConcept && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setSelectedConcept(null)}
           >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-bg-surface w-full max-w-2xl rounded-3xl border border-border-subtle overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
              >
                  {/* Big Image Reveal */}
                  <div className="relative aspect-video w-full bg-bg-elevated">
                       <Image 
                         src={`https://img.youtube.com/vi/${selectedConcept.videoId}/maxresdefault.jpg`} 
                         alt={selectedConcept.title} 
                         fill
                         sizes="(max-width: 768px) 100vw, 42rem"
                         priority
                         className="w-full h-full object-cover"
                         onError={(e: any) => e.target.src = `https://img.youtube.com/vi/${selectedConcept.videoId}/hqdefault.jpg`}
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-transparent to-transparent" />
                       <button 
                         onClick={() => setSelectedConcept(null)} 
                         className="absolute top-4 right-4 bg-black/50 hover:bg-black p-2 rounded-full text-white backdrop-blur-md transition-colors"
                       >
                         <X size={20} />
                       </button>
                       <div className="absolute bottom-4 left-6 flex items-center gap-3">
                           <div className="bg-[#F97316] text-white px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase shadow-lg">
                               {selectedConcept.category}
                           </div>
                           <div className="bg-black/80 backdrop-blur-sm text-gray-200 px-3 py-1 rounded-md text-xs font-bold font-mono">
                               {selectedConcept.duration}
                           </div>
                       </div>
                  </div>

                  <div className="p-8 pb-10 space-y-6">
                      <div>
                         <h2 className="text-2xl font-black text-white">{selectedConcept.title}</h2>
                         <p className="text-text-secondary mt-3 leading-relaxed">
                            {selectedConcept.description}
                         </p>
                      </div>

                      <button 
                        onClick={handleMasterConcept}
                        className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                         <Youtube size={24} /> 
                         <span className="tracking-wide">🎯 Master this concept seamlessly on YouTube</span>
                      </button>
                  </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}