"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronDown, ChevronUp, Code2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AgentLog {
  time: string;
  type: 'info' | 'thought' | 'success' | 'error' | 'tool_call' | 'tool_result';
  message: string;
}

interface TerminalLogProps {
  logs: AgentLog[];
  isAnalyzing: boolean;
}

// Custom keyword high-contrast highlighter
const highlightKeywords = (text: string) => {
  if (!text) return text;
  
  const keywords = [
    { pattern: /Constraint Matrix/gi, color: 'text-amber-400 font-black tracking-wide' },
    { pattern: /Policy Rule 1\.1/gi, color: 'text-cyan-400 font-black tracking-wide' },
    { pattern: /Concentration Risk Ceiling/gi, color: 'text-amber-400 font-black tracking-wide' },
    { pattern: /Delta Optimization Passed/gi, color: 'text-emerald-400 font-black tracking-wide' },
    { pattern: /Silicon Valley Bank/gi, color: 'text-cyan-300 font-bold' },
    { pattern: /Vultr Secure Yield Engine/gi, color: 'text-emerald-300 font-bold' },
    { pattern: /Chase Bank/gi, color: 'text-cyan-300 font-bold' },
    { pattern: /Single-Product Asset Concentration Risk Ceiling/gi, color: 'text-amber-450 font-bold' }
  ];
  
  let parts: (string | React.JSX.Element)[] = [text];
  
  keywords.forEach(({ pattern, color }) => {
    const newParts: (string | React.JSX.Element)[] = [];
    parts.forEach(part => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }
      
      const splitText = part.split(pattern);
      const matches = part.match(pattern);
      
      if (matches && splitText.length > 1) {
        splitText.forEach((p, idx) => {
          newParts.push(p);
          if (idx < matches.length) {
            newParts.push(
              <span key={`${matches[idx]}-${idx}`} className={color}>
                {matches[idx]}
              </span>
            );
          }
        });
      } else {
        newParts.push(part);
      }
    });
    parts = newParts;
  });
  
  return <>{parts}</>;
};

// Generates simulated Python assertions for expanders
const getVerificationCode = (message: string) => {
  if (message.includes('Silicon Valley Bank') || message.includes('SVB')) {
    return `>>> verify_concentration(institution="SVB", cap_ratio=0.40)
[COMPLIANCE] Limit: $2,400,000.00 | Proposed: $2,400,000.00
>>> verify_runway(burn_rate=300000.0, hold_period=30)
[SAFETY_CHECK] Target: $1,500,000.00 | Checking Reserve: $3,900,000.00
>>> Return: TRUE`;
  }
  if (message.includes('Chase') || message.includes('Vultr')) {
    return `>>> verify_allocation(source="Chase/Vultr", target="Vultr Yield Engine")
[LIQUIDITY_MATCH] Active sweeps routed to Vultr Secure Yield APY
>>> verify_rate(yield_target=0.04)
[PERFORMANCE] Portfolio average: 3.00% APY
>>> Return: TRUE`;
  }
  return `>>> verify_runway(burn_rate=1500000.0, hold_period=30d)
[SAFETY_CHECK] Active checking balances compliant with policy rule 1.1
>>> Return: TRUE`;
};

// Helper to determine micro-status badge
const getBadge = (type: string, message: string) => {
  if (type === 'success') return 'STRATEGY_GENERATED';
  if (type === 'error') return 'EXCEPTION_CAUGHT';
  if (type === 'info') return 'SYSTEM_CHECK';
  if (type === 'tool_call') return 'API_INVOCATION';
  if (type === 'tool_result') return 'OUTPUT_TELEMETRY';
  if (message.includes('policy') || message.includes('Policy')) return 'CRITICAL_CHECK';
  if (message.includes('sweeps') || message.includes('sweeping') || message.includes('sweep')) return 'OPTIMIZATION_CALC';
  return 'CONSTRAINT_PROPAGATION';
};

interface LogRowProps {
  log: AgentLog;
  idx: number;
}

function LogRow({ log, idx }: LogRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isMajorStep = log.type === 'thought' || log.type === 'success' || log.type === 'tool_call';

  return (
    <div className="border-b border-zinc-950/80 pb-2.5 flex flex-col gap-1 transition-all duration-200 hover:bg-zinc-900/10 rounded-xl px-1">
      <div className="flex items-center justify-between gap-1.5 text-[8.5px] font-mono text-zinc-650 select-none">
        <div className="flex items-center gap-1.5">
          <span>[{log.time}]</span>
          <span className={`px-1.5 py-0.5 rounded font-black text-[7.5px] border ${
            log.type === 'success' 
              ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' 
              : log.type === 'error'
              ? 'bg-red-950/20 border-red-500/20 text-red-400'
              : log.type === 'tool_call'
              ? 'bg-amber-950/20 border-amber-500/20 text-amber-400'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
          }`}>
            {getBadge(log.type, log.message)}
          </span>
        </div>
        
        {isMajorStep && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-zinc-600 hover:text-zinc-400 transition-colors py-0.5 px-1 bg-zinc-950/60 border border-zinc-900/60 rounded"
          >
            <Code2 className="w-2.5 h-2.5" />
            <span className="text-[7px]">VERIFY</span>
            {expanded ? <ChevronUp className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
          </button>
        )}
      </div>

      <div className={`text-[10px] leading-relaxed whitespace-pre-wrap select-all ${
        log.type === 'success'
          ? 'text-emerald-400 font-extrabold drop-shadow-[0_0_6px_rgba(16,185,129,0.12)]'
          : log.type === 'error'
          ? 'text-red-400 font-black'
          : log.type === 'thought'
          ? 'text-zinc-450 italic'
          : log.type === 'tool_call'
          ? 'text-amber-400 font-bold'
          : log.type === 'tool_result'
          ? 'text-zinc-500 font-semibold'
          : 'text-cyan-400/90 font-medium'
      }`}>
        {log.type === 'info' && <span className="text-zinc-600 mr-1.5">&bull;</span>}
        {log.type === 'thought' && <span className="text-zinc-600 mr-1.5">&gt;</span>}
        {(() => {
          if (log.type === 'tool_result') {
            try {
              const parsed = JSON.parse(log.message);
              return <pre className="bg-zinc-950/80 p-2 rounded border border-zinc-900 mt-1 overflow-x-auto text-[9px] text-zinc-400">{JSON.stringify(parsed, null, 2)}</pre>;
            } catch(e) {
              return highlightKeywords(log.message);
            }
          }
          return highlightKeywords(log.message);
        })()}
      </div>

      {/* Accordion verification sub-block */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-1.5"
          >
            <div className="bg-zinc-950 border border-zinc-900/80 p-2.5 rounded-lg font-mono text-[8px] text-zinc-500 whitespace-pre-wrap leading-normal relative select-text">
              <div className="absolute top-1 right-2 text-[6.5px] text-zinc-650 uppercase font-black tracking-widest select-none">
                Assertion Sandbox
              </div>
              {getVerificationCode(log.message)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TerminalLog({ logs, isAnalyzing }: TerminalLogProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-2.5 w-full">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between text-[10px] text-zinc-550 font-bold uppercase tracking-wider px-1 select-none">
        <span className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-zinc-600" />
          HYPER-LOG: APEX_LIQUIDITY_CORE_v1.0.8 // AGENTIC TRACE
        </span>
        <span className="text-[9px] font-semibold text-zinc-600">tty1.apex</span>
      </div>

      {/* Terminal Viewport Container */}
      <div className="bg-zinc-950 border border-zinc-900/90 rounded-2xl p-4 h-[300px] overflow-y-auto font-mono text-[10px] leading-relaxed relative flex flex-col gap-2.5 scrollbar-thin select-text" ref={containerRef}>
        {isAnalyzing && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse pointer-events-none" />
        )}
        
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-650 gap-2 font-sans select-none text-center">
            <Terminal className="w-8 h-8 text-zinc-900" />
            <p className="font-bold text-xs text-zinc-550">Telemetry Stream Idle</p>
            <p className="text-[10px] max-w-[200px] leading-normal text-zinc-600">Engage routing sweeps to initialize active agentic constraints planning trace.</p>
          </div>
        ) : (
          logs.map((log, idx) => (
            <LogRow key={idx} log={log} idx={idx} />
          ))
        )}
      </div>
    </div>
  );
}
