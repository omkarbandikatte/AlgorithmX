"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import { CheckCircle, Play, Clock, Youtube } from "lucide-react";
import Image from "next/image";

export interface Concept {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
}

interface Props {
  concept: Concept;
  onPreview: (concept: Concept) => void;
}

export function ConceptPreviewCard({ concept, onPreview }: Props) {
  const [isLearned, setIsLearned] = useState(false);
  const { t } = useTranslation();

  const handleToggleLearned = (e: React.MouseEvent) => {
    e.stopPropagation(); // Hit learned vs open preview
    setIsLearned(!isLearned);
    console.log(`[Analytics] Marked '${concept.title}' as ${!isLearned ? 'Learned' : 'Unlearned'}`);
  };

  const handleClick = () => {
    console.log(`[Analytics] Preview clicked for '${concept.title}'`);
    onPreview(concept);
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${concept.videoId}/mqdefault.jpg`;

  return (
    <div 
      onClick={handleClick}
      className={`group relative card-glass border border-border-subtle rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-orange-500/10 flex flex-col h-full bg-bg-surface ${isLearned ? 'opacity-80' : ''}`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-bg-elevated">
        <Image 
          src={thumbnailUrl} 
          alt={concept.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e: any) => {
            // Fallback to HQ if MQ fails, then to a branded placeholder
            if (e.target.src.includes('mqdefault')) {
              e.target.src = `https://img.youtube.com/vi/${concept.videoId}/hqdefault.jpg`;
            } else {
              e.target.src = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop';
            }
          }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Play className="text-white/80 group-hover:text-[#F97316] w-12 h-12 transition-colors duration-300 drop-shadow-lg" fill="currentColor" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-bold text-white shadow-xl">
          <Clock size={12} className="text-orange-400" />
          {concept.duration}
        </div>
        <div className="absolute top-3 right-3 text-xs font-bold px-2 py-1 bg-black/70 backdrop-blur-md rounded-md border border-border-subtle text-text-primary capitalize shadow-xl">
          {concept.category}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-[#F97316] transition-colors">{concept.title}</h3>
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed flex-1">
          {concept.description}
        </p>

        {/* Footer actions */}
        <div className="pt-4 mt-auto flex items-center justify-between border-t border-border-subtle/50">
          <button 
            onClick={handleToggleLearned}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
              isLearned 
                ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                : 'bg-hover-bg text-text-muted hover:text-white border border-transparent'
            }`}
          >
            <CheckCircle size={14} className={isLearned ? "text-green-400" : "opacity-50"} />
            {isLearned ? t("learn.mastered") : t("learn.markAsLearned")}
          </button>
          
          <button className="flex items-center gap-1.5 text-xs font-black text-[#F97316] bg-[#F97316]/10 px-3 py-1.5 rounded-full hover:bg-[#F97316] hover:text-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]">
             <Youtube size={14} /> {t("learn.preview")}
          </button>
        </div>
      </div>
    </div>
  );
}