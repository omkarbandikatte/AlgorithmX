"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const NodeCard = ({ data }: any) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 107, 0, 0.4)" }}
      className="card-glass p-5 min-w-[200px] max-w-[280px] border-accent-start/20 bg-bg-surface flex flex-col gap-3 relative cursor-pointer"
    >
      <Handle type="target" position={Position.Top} className="!bg-accent-start" />
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-accent-start/10 flex items-center justify-center">
            <BookOpen size={16} className="text-accent-start" />
        </div>
        <h4 className="font-bold text-sm text-text-primary truncate">{data.label}</h4>
      </div>
      
      <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2">
        {data.description}
      </p>
      
      <div className="mt-2 flex items-center justify-between">
           <span className="text-[8px] font-black uppercase text-accent-start tracking-widest">Topic Module</span>
           <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-accent-start" />
    </motion.div>
  );
};

export default memo(NodeCard);
