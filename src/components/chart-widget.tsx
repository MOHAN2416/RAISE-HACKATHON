"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  yield_rate: number;
  min_balance: number;
  category: "checking" | "savings";
}

interface Proposal {
  id: string;
  source_id: string;
  source_name: string;
  target_id: string;
  target_name: string;
  amount: number;
  annual_yield_increase: number;
  status: "pending" | "approved" | "rejected";
}

interface ChartWidgetProps {
  accounts: Account[];
  proposals: Proposal[];
  viewMode?: AllocationView;
}

type AllocationView = "current" | "proposed";

export default function ChartWidget({ accounts, proposals, viewMode }: ChartWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<AllocationView>("current");
  const [activeTab, setActiveTab] = useState<"metrics" | "routing">("metrics");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (viewMode) {
      setView(viewMode);
    }
  }, [viewMode]);

  if (!mounted) {
    return (
      <div className="glass-panel p-6 rounded-2xl h-[400px] w-full flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading visual matrix...</p>
      </div>
    );
  }

  // Calculate proposed balances
  const proposedBalances = accounts.reduce((acc, curr) => {
    acc[curr.id] = curr.balance;
    return acc;
  }, {} as Record<string, number>);

  // Only apply pending proposals for the visual comparison
  proposals.forEach(p => {
    if (p.status === 'pending') {
      if (proposedBalances[p.source_id] !== undefined) {
        proposedBalances[p.source_id] -= p.amount;
      }
      if (proposedBalances[p.target_id] !== undefined) {
        proposedBalances[p.target_id] += p.amount;
      }
    }
  });

  // Prepare chart data
  const data = accounts.map(acct => ({
    name: acct.name,
    "Current Balance": acct.balance,
    "Proposed Balance": proposedBalances[acct.id],
    yield: acct.yield_rate * 100
  }));

  const formatYAxisTick = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900/95 border border-zinc-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white text-sm font-bold border-b border-zinc-800 pb-1.5 mb-2">{label}</p>
          <p className="text-opsCyan text-xs flex justify-between gap-6 mb-1">
            <span>Current:</span>
            <span className="font-mono font-bold">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </p>
          <p className="text-yieldGreen text-xs flex justify-between gap-6">
            <span>Proposed:</span>
            <span className="font-mono font-bold">${payload[1].value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </p>
          <p className="text-purple-400 text-[10px] mt-2 flex justify-between font-mono">
            <span>Yield Rate (APY):</span>
            <span>{payload[0].payload.yield.toFixed(2)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl w-full h-[400px] flex flex-col justify-between select-none">
      
      {/* Tab Select Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900/60 pb-4 mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-white text-xs font-black uppercase tracking-wider">Asset Allocation Matrix</h4>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono px-2 py-0.5 rounded-full animate-pulse select-none">
              + $128,880/yr Yield Delta Found
            </span>
          </div>
          <p className="text-zinc-550 text-[10px] font-semibold mt-0.5">Comparing active cash vs optimized sweep distribution</p>
        </div>
        
        {/* Toggle tabs */}
        <div className="flex gap-2 text-[9px] font-mono font-black uppercase">
          <button 
            onClick={() => setActiveTab("metrics")}
            className={`px-3 py-1.5 rounded-xl border transition-all ${activeTab === 'metrics' ? 'bg-cyan-950/20 border-cyan-500/35 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.08)]' : 'border-zinc-900 text-zinc-500 hover:text-zinc-300 bg-zinc-950/40'}`}
          >
            [ View Metric Balances ]
          </button>
          <button 
            onClick={() => setActiveTab("routing")}
            className={`px-3 py-1.5 rounded-xl border transition-all ${activeTab === 'routing' ? 'bg-amber-950/20 border-amber-500/35 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.08)] animate-pulse-slow' : 'border-zinc-900 text-zinc-500 hover:text-zinc-300 bg-zinc-950/40'}`}
          >
            [ View Engine Routing Sandbox ]
          </button>
        </div>

        {/* Legend */}
        {activeTab === 'metrics' && (
          <div className="flex gap-4 text-[9px] font-mono font-black uppercase">
            <div className="flex items-center gap-1.5 text-opsCyan">
              <span className="w-2 h-2 rounded bg-opsCyan/80" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5 text-yieldGreen">
              <span className="w-2 h-2 rounded bg-yieldGreen/80" />
              <span>Optimized</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport Content */}
      <div className="flex-1 w-full min-h-[285px] relative">
        <AnimatePresence mode="wait">
          {activeTab === "metrics" ? (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#52525b" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={formatYAxisTick}
                  />
                  <Tooltip content={customTooltip} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                  <Bar 
                    dataKey="Current Balance" 
                    fill="#06b6d4" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    opacity={0.8}
                  />
                  <Bar 
                    dataKey="Proposed Balance" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <motion.div
              key="routing"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full relative border border-zinc-900/60 bg-zinc-950/40 rounded-2xl overflow-hidden"
            >
              {/* Dynamic CSS animations styles injected locally */}
              <style>{`
                @keyframes flowLine {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
                .flow-active-line {
                  stroke-dasharray: 6 3;
                  animation: flowLine 1s linear infinite;
                }
              `}</style>

              {/* Animated SVG connecting lines */}
              <svg viewBox="0 0 500 280" className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                {/* SVB checking connector */}
                <path d="M 250 140 L 90 60" stroke="#27272a" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* Chase checking connector */}
                <path d="M 250 140 L 90 220" stroke="#27272a" strokeWidth="1.5" strokeDasharray="4 4" />
                {/* High-yield destination active sweep flows */}
                <path d="M 250 140 L 410 140" stroke="#10b981" strokeWidth="2.5" className="flow-active-line" />
                {/* Bypassed Fidelity connector */}
                <path d="M 250 140 L 410 60" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 5" opacity="0.35" />
              </svg>

              {/* 1. Master Nexus Node */}
              <div 
                className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[130px] h-[55px] bg-zinc-950 border border-cyan-500/40 hover:border-cyan-400 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer group z-10 transition-colors duration-250 select-none"
              >
                <span className="absolute -inset-0.5 rounded-xl border border-cyan-400/25 animate-pulse-slow pointer-events-none" />
                <span className="text-[8px] font-sans font-black tracking-widest text-cyan-400 uppercase">SYSTEM NEXUS</span>
                <span className="text-[7px] font-mono text-zinc-550 font-bold mt-0.5">LIQUIDITY HUB</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[9px] leading-relaxed text-zinc-400 w-44 shadow-2xl z-30 font-mono text-left">
                  <div className="text-[9px] font-black text-cyan-400 uppercase border-b border-zinc-850 pb-1 mb-1 tracking-wider">
                    SYSTEM NEXUS
                  </div>
                  <div>SLA Match: <span className="text-zinc-200 font-bold">99.99%</span></div>
                  <div>Liquidity Lock: <span className="text-zinc-200 font-bold">T+0</span></div>
                  <div>Risk Profile: <span className="text-emerald-400 font-bold">Optimal</span></div>
                </div>
              </div>

              {/* 2. SVB Node */}
              <div 
                className="absolute left-[18%] top-[21.4%] -translate-x-1/2 -translate-y-1/2 w-[110px] h-[48px] bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer group z-10 transition-colors duration-200 select-none"
              >
                <span className="text-[8px] font-sans font-black tracking-wider text-white uppercase">Silicon Valley Bank</span>
                <span className="text-[7px] font-mono text-zinc-500 font-bold mt-0.5">CHECKING: 0.05%</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[9px] leading-relaxed text-zinc-400 w-44 shadow-2xl z-30 font-mono text-left">
                  <div className="text-[9px] font-black text-white uppercase border-b border-zinc-850 pb-1 mb-1 tracking-wider">
                    SVB PORTFOLIO
                  </div>
                  <div>SLA Match: <span className="text-zinc-200 font-bold">99.95%</span></div>
                  <div>Liquidity Lock: <span className="text-zinc-200 font-bold">T+0</span></div>
                  <div>Risk Profile: <span className="text-emerald-400 font-bold">Low</span></div>
                </div>
              </div>

              {/* 3. Chase Node */}
              <div 
                className="absolute left-[18%] top-[78.5%] -translate-x-1/2 -translate-y-1/2 w-[110px] h-[48px] bg-zinc-950 border border-zinc-850 hover:border-zinc-700 rounded-xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer group z-10 transition-colors duration-200 select-none"
              >
                <span className="text-[8px] font-sans font-black tracking-wider text-white uppercase">Chase Bank</span>
                <span className="text-[7px] font-mono text-zinc-500 font-bold mt-0.5">CHECKING: 0.01%</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[9px] leading-relaxed text-zinc-400 w-44 shadow-2xl z-30 font-mono text-left">
                  <div className="text-[9px] font-black text-white uppercase border-b border-zinc-850 pb-1 mb-1 tracking-wider">
                    CHASE PORTFOLIO
                  </div>
                  <div>SLA Match: <span className="text-zinc-200 font-bold">99.99%</span></div>
                  <div>Liquidity Lock: <span className="text-zinc-200 font-bold">T+0</span></div>
                  <div>Risk Profile: <span className="text-emerald-400 font-bold">Low</span></div>
                </div>
              </div>

              {/* 4. Vultr Secure Yield Node */}
              <div 
                className="absolute left-[82%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[120px] h-[48px] bg-emerald-950/10 border border-emerald-500/40 hover:border-emerald-400 rounded-xl flex flex-col items-center justify-center text-center shadow-[0_0_12px_rgba(16,185,129,0.12)] cursor-pointer group z-10 transition-colors duration-200 select-none animate-pulse-slow"
              >
                <span className="text-[8px] font-sans font-black tracking-wider text-emerald-400 uppercase">Vultr Yield Engine</span>
                <span className="text-[7px] font-mono text-emerald-500/80 font-bold mt-0.5">SAVINGS: 5.42% APY</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[9px] leading-relaxed text-zinc-400 w-44 shadow-2xl z-30 font-mono text-left">
                  <div className="text-[9px] font-black text-emerald-400 uppercase border-b border-zinc-850 pb-1 mb-1 tracking-wider">
                    VULTR YIELD HUB
                  </div>
                  <div>SLA Match: <span className="text-zinc-200 font-bold">99.98%</span></div>
                  <div>Liquidity Lock: <span className="text-zinc-200 font-bold">T+0 (Sweep)</span></div>
                  <div>Risk Profile: <span className="text-emerald-400 font-bold">Low Risk</span></div>
                </div>
              </div>

              {/* 5. Fidelity MMF Node - Bypassed */}
              <div 
                className="absolute left-[82%] top-[21.4%] -translate-x-1/2 -translate-y-1/2 w-[120px] h-[48px] bg-zinc-950/30 border border-red-500/20 border-dashed rounded-xl flex flex-col items-center justify-center text-center opacity-50 cursor-pointer group z-10 transition-colors duration-200 hover:border-red-500/35 select-none"
              >
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-sans font-black tracking-wider text-zinc-400 uppercase">Fidelity MMF</span>
                <span className="text-[6.5px] font-mono text-red-400/80 font-bold mt-0.5 uppercase tracking-wide">BYPASSED - LIMIT EXCEEDED</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[9px] leading-relaxed text-zinc-400 w-44 shadow-2xl z-30 font-mono text-left">
                  <div className="text-[9px] font-black text-red-400 uppercase border-b border-zinc-850 pb-1 mb-1 tracking-wider">
                    FIDELITY BYPASSED
                  </div>
                  <div>SLA Match: <span className="text-zinc-200 font-bold">99.90%</span></div>
                  <div>Concentration: <span className="text-red-400 font-bold">45.0% (Limit 40%)</span></div>
                  <div>Status: <span className="text-red-400 font-bold">Bypassed</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
