"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import React from "react";

export function TiltCard({ children, className = "", glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-200, 200], [5, -5]);
  const rotateY = useTransform(x, [-200, 200], [-5, 5]);

  function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    x.set(0); y.set(0);
  }
  
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className} ${glow ? 'group' : ''}`}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10 rounded-3xl pointer-events-none" />
      )}
      <div style={{ transform: "translateZ(20px)" }} className="h-full w-full relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
