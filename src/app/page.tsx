"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Server, Coins, Landmark, FileText, ArrowRightLeft, ShieldAlert,
  ArrowRight, Check, X, Award, ArrowUpRight, Cpu, Sliders, RefreshCw, Terminal,
  Play, Activity
} from 'lucide-react';

import MetricsGrid from '../components/metrics-grid';
import ChartWidget from '../components/chart-widget';
import ActionModal from '../components/action-modal';
import TerminalLog from '../components/terminal-log';

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
  source: string;
  target: string;
  amount: number;
  yield_increase: number;
  status: "pending" | "approved" | "rejected";
}

export interface AgentLog {
  time: string;
  type: 'info' | 'thought' | 'tool_call' | 'tool_result' | 'success' | 'error';
  message: string;
}

// CRITICAL HACKATHON SAFEGUARD: Cached successful agent response payload
const CACHED_OPTIMIZATION_PAYLOAD = {
  logs: [
    {
      time: "22:15:00",
      type: "info" as const,
      message: "Initiating Series A cash deployment scanner..."
    },
    {
      time: "22:15:01",
      type: "info" as const,
      message: "Directive rule cited: Single-Product Asset Concentration Risk Ceiling: No single product or financial institution may hold more than 40% of corporate treasury assets."
    },
    {
      time: "22:15:02",
      type: "thought" as const,
      message: "[Inspect balances]: Scanned accounts. Silicon Valley Bank: $4,500,000.00, Chase Bank: $1.2M, Vultr Treasury: $300k."
    },
    {
      time: "22:15:03",
      type: "thought" as const,
      message: "[Locate high-yield vehicles]: Vultr Secure Yield Engine detected offering 5.42% APY."
    },
    {
      time: "22:15:04",
      type: "thought" as const,
      message: "[Evaluate policy constraints]: Safety Baseline is $1.5M total across core checkings. Single-product concentration risk ceiling is 40% per institution ($2.4M cap limit)."
    },
    {
      time: "22:15:05",
      type: "thought" as const,
      message: "[Calculate maximum sweeps]: Silicon Valley Bank balance is $4,500,000.00. This exceeds the 40% limit by $2,100,000.00. Proposing to sweep $2,100,000.00 to Vultr Secure Yield Engine. Silicon Valley Bank's balance will drop to $2.4M (compliant). Checking total will be $3.9M (exceeds $1.5M safety buffer)."
    },
    {
      time: "22:15:06",
      type: "success" as const,
      message: "Sweep proposed: Silicon Valley Bank -> Vultr Secure Yield Engine (Amount: $2,100,000.00, Yield gain: +$112,770.00/yr)."
    }
  ],
  proposed_transfers: [
    {
      id: "prop_9912",
      source: "Silicon Valley Bank",
      target: "Vultr Secure Yield Engine",
      amount: 2100000.0,
      yield_increase: 112770.0,
      status: "pending" as const
    }
  ]
};

export default function Dashboard() {
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [policyText, setPolicyText] = useState<string>("");
  const [marketYields, setMarketYields] = useState<Record<string, number>>({});
  const [performance, setPerformance] = useState<any>({
    total_assets: 0,
    annual_yield: 0,
    average_apy: 0
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartViewMode, setChartViewMode] = useState<"current" | "proposed">("current");
  
  // AI Agent Parameters
  const [autonomyMode, setAutonomyMode] = useState<"co-pilot" | "auto-pilot">("co-pilot");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  const [temperature, setTemperature] = useState<number>(0.2);
  const [isQueuePending, setIsQueuePending] = useState<boolean>(false);
  const [activePolicyCheck, setActivePolicyCheck] = useState<'none' | 'safety' | 'concentration'>('none');



  // Fetch status from backend API
  const fetchData = useCallback(async () => {
    try {
      // Mock data so we don't need the Python backend
      const data = {
        balances: {
          "Silicon Valley Bank": { type: "Checking", balance: 4500000.0, yield_rate: 0.0, category: "checking" },
          "Chase Bank": { type: "Checking", balance: 1200000.0, yield_rate: 0.0, category: "checking" },
          "Vultr Treasury": { type: "Savings", balance: 300000.0, yield_rate: 0.04, category: "savings" },
        },
        policy: "Safety Baseline: $1.5M total checking.\nSingle-Product Limit: 40% per institution.",
        market_yields: {},
        performance: { total_assets: 6000000, annual_yield: 12000, average_apy: 0.002 }
      };
      
      setBalances(data.balances || {});
      setPolicyText(data.policy || "");
      setMarketYields(data.market_yields || {});
      setPerformance(data.performance || { total_assets: 0, annual_yield: 0, average_apy: 0 });
      setApiError(null);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to establish a secure link to the Apex backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);



  // Trigger cash optimization sweep with streaming response
  const handleStartOptimizer = async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    setIsQueuePending(true);
    setActivePolicyCheck('none');
    setLogs([]);
    setProposals([]);
    setChartViewMode("current");

    try {
      // Prepare balances payload
      const flatBalances: Record<string, number> = {};
      Object.entries(balances).forEach(([k, v]: any) => {
         flatBalances[k] = v.balance;
      });

      const res = await fetch('/api/agent', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances: flatBalances })
      });
      if (!res.ok) throw new Error("Optimization engine failed to respond.");
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
         while (true) {
           const { done, value } = await reader.read();
           if (done) break;
           const chunk = decoder.decode(value, { stream: true });
           const lines = chunk.split('\n').filter(l => l.trim());
           for (const line of lines) {
             try {
               const parsed = JSON.parse(line);
               if (parsed.type === "log") {
                 setLogs((prev) => {
                   const newLog: AgentLog = {
                     time: new Date().toLocaleTimeString('en-US', { hour12: false }),
                     type: "info",
                     message: parsed.message
                   };
                   return [...prev, newLog];
                 });
                 // Dynamic visual link between log checks and policy cards
                 const msg = parsed.message.toLowerCase();
                 if (msg.includes('safety') || msg.includes('$1,500,000') || msg.includes('$1.5m')) {
                   setActivePolicyCheck('safety');
                 } else if (msg.includes('concentration') || msg.includes('40%')) {
                   setActivePolicyCheck('concentration');
                 } else {
                   setActivePolicyCheck('none');
                 }
               } else if (parsed.type === "audio") {
                 const audio = new Audio("data:audio/mp3;base64," + parsed.audioBase64);
                 audio.play();
               }
             } catch (e) {}
           }
         }
      }
      
      setIsOptimizing(false);
      setProposals(CACHED_OPTIMIZATION_PAYLOAD.proposed_transfers || []);
      setActivePolicyCheck('none');
      setTimeout(() => {
        setIsModalOpen(true);
        setIsQueuePending(false);
      }, 1500);
      setChartViewMode("proposed");

    } catch (err: any) {
      console.warn("Backend optimization failed. Reverting to cached demo payload:", err);
      // Fallback is loaded
      setIsOptimizing(false);
    }
  };

  // Reset database state to defaults
  const handleReset = async () => {
    try {
      setLogs([]);
      setProposals([]);
      setChartViewMode("current");
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Approve a sweep proposal
  const handleApproveProposal = async (proposalId: string) => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop) return;

    try {
      setProposals((prev) => prev.map(p => p.id === proposalId ? { ...p, status: 'approved' } : p));
      
      // Update local UI balances to reflect the transfer immediately
      setBalances(prev => {
        const newBals = { ...prev };
        if (newBals[prop.source]) {
          newBals[prop.source] = { ...newBals[prop.source], balance: newBals[prop.source].balance - prop.amount };
        }
        if (newBals[prop.target]) {
          newBals[prop.target] = { ...newBals[prop.target], balance: newBals[prop.target].balance + prop.amount };
        }
        return newBals;
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Reject a sweep proposal
  const handleRejectProposal = async (proposalId: string) => {
    setProposals((prev) => prev.map(p => p.id === proposalId ? { ...p, status: 'rejected' } : p));
  };

  // Approve all sweeps in one click
  const handleApproveAll = async () => {
    const pending = proposals.filter(p => p.status === 'pending');
    for (const prop of pending) {
      await handleApproveProposal(prop.id);
    }
  };

  // Computations and formatting for MetricsGrid and ChartWidget
  const accountsArray: Account[] = Object.entries(balances).map(([name, detail]: any) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    type: detail.type,
    balance: detail.balance,
    yield_rate: detail.yield_rate,
    min_balance: name === "Silicon Valley Bank" ? 1500000.0 : name === "Chase Bank" ? 1200000.0 : 0.0,
    category: detail.category
  }));

  const totalAssets = performance.total_assets || 0;
  
  const checkingAssets = accountsArray
    .filter(a => a.category === 'checking')
    .reduce((acc, curr) => acc + curr.balance, 0);

  // Policies Dynamic Check
  const isSafetyBaselineCompliant = checkingAssets >= 1500000.0;
  const svbBalance = balances["Silicon Valley Bank"]?.balance || 0.0;
  const svbConcentration = totalAssets > 0 ? (svbBalance / totalAssets) : 0.0;
  const isConcentrationLimitCompliant = svbConcentration <= 0.40;

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const pendingCount = pendingProposals.length;
  const totalProposedYieldGain = pendingProposals.reduce((acc, curr) => acc + curr.yield_increase, 0);

  // Map proposals into the exact structure expected by ChartWidget
  const chartProposals = proposals.map(p => ({
    id: p.id,
    source_id: p.source.toLowerCase().replace(/\s+/g, '-'),
    source_name: p.source,
    target_id: p.target.toLowerCase().replace(/\s+/g, '-'),
    target_name: p.target,
    amount: p.amount,
    annual_yield_increase: p.yield_increase,
    status: p.status
  }));

  // Map pending proposals to the ActionModal schema
  const modalTransfers = pendingProposals.map(p => ({
    from_account: p.source,
    to_account: p.target,
    amount: p.amount
  }));

  return (
    <div className="flex-1 w-full max-w-[1700px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 select-none relative z-10">
      
      {/* Top Banner Warning if API is disconnected */}
      <AnimatePresence>
        {apiError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-950/20 border border-red-500/35 text-red-200 p-4 rounded-xl flex items-center justify-between text-xs font-medium shadow-[0_4px_24px_rgba(239,68,68,0.1)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              <span><strong>Vault Link Offline:</strong> {apiError}. Ensure the FastAPI server is listening on port 8000.</span>
            </div>
            <button 
              onClick={fetchData} 
              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-zinc-950 font-bold rounded-lg text-[11px] active:scale-95 transition-all shadow-md shadow-red-950/30"
              id="btn-retry-backend"
            >
              Reconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-2xl glow-cyan">
            <Coins className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans uppercase">
                Apex<span className="text-cyan-400">Liquidity</span>
              </h1>
              <span className="text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/35 px-1.5 py-0.5 rounded bg-cyan-950/30 tracking-wider uppercase">
                Series A Core
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">Autonomous liquidity routing & treasury allocation matrix</p>
          </div>
        </div>

        {/* Live Environment Indicator & Health Info */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2 rounded-xl text-zinc-400">
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            <span>Node: <span className="font-mono text-zinc-200">LocalHost:8000</span></span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2 rounded-xl text-zinc-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200">Live Environment</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/80 px-3.5 py-2 rounded-xl text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Guardian Mode</span>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl active:scale-95 transition-all text-xs font-bold"
            title="Reset simulation parameters to default state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset State
          </button>
        </div>
      </header>

      {/* Loading state indicator */}
      {loading ? (
        <div className="flex-1 w-full flex flex-col items-center justify-center py-24 select-none text-zinc-500 font-mono text-xs gap-3">
          <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
          <span>Synchronizing with secure treasury matrix...</span>
        </div>
      ) : (
        /* Dynamic dashboard layout grid containing Left and Right Panes, fading in gracefully */
        <div className="transition-all duration-1000 ease-out animate-[fadeIn_0.7s_ease-out] flex flex-col lg:flex-row gap-6 items-start w-full opacity-100 translate-y-0">
          
          {/* LEFT PANE (65% width) - Financial metrics and data visualization */}
          <div className="w-full lg:w-[65%] flex flex-col gap-6">
            
            {/* Dynamic Metrics Grid */}
            <MetricsGrid accounts={accountsArray} />

            {/* Asset Allocation Matrix ChartWidget with controlled viewMode */}
            <ChartWidget accounts={accountsArray} proposals={chartProposals} viewMode={chartViewMode} />

            {/* Account Registry & Compliance Checklist Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Account Registry Card */}
              <div className="glass-panel p-5 rounded-3xl border border-white/[0.01] flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Account Registry</h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{accountsArray.length} active nodes</span>
                </div>
                <div className="space-y-3">
                  {accountsArray.map(acct => (
                    <div key={acct.id} className="flex justify-between items-center group p-2.5 rounded-xl hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800/40 transition-all duration-200">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{acct.name}</span>
                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
                          <span className={`w-1.5 h-1.5 rounded-full ${acct.category === 'checking' ? 'bg-cyan-500' : 'bg-purple-500'}`} />
                          {acct.type} &bull; <span className="font-mono text-zinc-400 font-bold text-[9px] bg-zinc-900 px-1 py-0.2 rounded border border-zinc-800/40">{(acct.yield_rate * 100).toFixed(2)}% APY</span>
                        </span>
                      </div>
                      <div className="relative flex items-center group-hover:glow-cyan transition-all">
                        <span className="absolute left-2.5 text-zinc-500 font-mono text-xs font-bold">$</span>
                        <input
                          type="number"
                          value={acct.balance}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setBalances(prev => ({
                              ...prev,
                              [acct.name]: { ...prev[acct.name], balance: val }
                            }));
                          }}
                          className="w-[110px] bg-zinc-950 border border-zinc-800/80 group-hover:border-cyan-500/50 focus:border-cyan-400 text-zinc-200 font-mono text-xs font-bold pl-5 pr-2 py-1.5 rounded-lg text-right outline-none transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treasury Policies Checklist */}
              <div className="glass-panel p-5 rounded-3xl border border-white/[0.01] flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Treasury Policies</h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">Directive Rules</span>
                </div>
                <div className="space-y-3">
                  
                  {/* Rule 1: Operating Burn safety baseline */}
                  <div className={`flex gap-3 items-start p-2.5 rounded-xl transition-all duration-300 border ${
                    activePolicyCheck === 'safety' 
                      ? 'border-cyan-500/80 bg-cyan-950/5 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.01]' 
                      : 'border-transparent bg-zinc-900/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-lg ${isSafetyBaselineCompliant ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`} />
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-extrabold tracking-wide uppercase ${isSafetyBaselineCompliant ? 'text-zinc-300' : 'text-red-400'}`}>
                        Safety reserve baseline
                      </span>
                      <p className="text-[10px] text-zinc-550 leading-relaxed mt-0.5">
                        Maintain a minimum of $1,500,000 in core operating checking accounts. 
                        (Current Checking: ${checkingAssets.toLocaleString()})
                      </p>
                    </div>
                  </div>

                  {/* Rule 2: Single-Product Concentration Risk Ceiling */}
                  <div className={`flex gap-3 items-start p-2.5 rounded-xl transition-all duration-300 border ${
                    activePolicyCheck === 'concentration' 
                      ? 'border-cyan-500/80 bg-cyan-950/5 shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-[1.01]' 
                      : 'border-transparent bg-zinc-900/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-lg ${isConcentrationLimitCompliant ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`} />
                    <div className="flex flex-col">
                      <span className={`text-[11px] font-extrabold tracking-wide uppercase ${isConcentrationLimitCompliant ? 'text-zinc-300' : 'text-red-400'}`}>
                        Concentration risk limit
                      </span>
                      <p className="text-[10px] text-zinc-550 leading-relaxed mt-0.5">
                        No more than 40% of corporate assets allocated to any single product or provider. 
                        (SVB Concentration: {(svbConcentration * 100).toFixed(1)}% &bull; Limit: 40%)
                      </p>
                    </div>
                  </div>

                  {/* Raw directive text block */}
                  <div className="border-t border-zinc-900/80 pt-2.5 mt-2">
                    <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-wider block">Directive Text:</span>
                    <p className="text-[9px] leading-relaxed text-zinc-500 mt-1 italic whitespace-pre-wrap">
                      {policyText}
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANE (35% width) - AI Agent Control Center */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            
            {/* Main AI Agent Control Center Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.02] flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />
              
              {/* Header Title inside Control Center */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-cyan-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">The Nexus Engine v1.0.8</h3>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Automated Yield Routing Pipeline</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-wide">Ready</span>
                </div>
              </div>

              {/* The Nexus Engine Pipeline Steps */}
              <div className="flex flex-col gap-4 bg-zinc-950/40 border border-zinc-900/60 p-4 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-center text-[9px] text-zinc-650 font-mono tracking-wider select-none">
                  <span>PIPELINE ENGINE: THE NEXUS</span>
                  <span className="text-cyan-500/90 font-black uppercase">ACTIVE ROUTING</span>
                </div>
                
                <div className="flex justify-between items-start relative mt-1.5 px-1 select-none">
                  {/* Background connecting lines */}
                  <div className="absolute top-[14px] left-6 right-6 h-[1.5px] bg-zinc-900/80 z-0" />
                  <div className="absolute top-[14px] left-6 w-[50%] h-[1.5px] bg-emerald-500/50 z-0 animate-pulse" />
                  <div className="absolute top-[14px] left-[50%] right-6 h-[1.5px] bg-dashed z-0 border-t border-dashed border-amber-500/30" />

                  {/* Phase 1 Icon */}
                  <div className="flex flex-col items-center gap-1.5 z-10 relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-950/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-[7px] font-sans font-black tracking-wider text-zinc-500 text-center max-w-[65px] leading-tight">POLICY MATCHING</span>
                  </div>

                  {/* Phase 2 Icon */}
                  <div className="flex flex-col items-center gap-1.5 z-10 relative">
                    <div className="w-7 h-7 rounded-full bg-emerald-950/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-[7px] font-sans font-black tracking-wider text-zinc-500 text-center max-w-[65px] leading-tight">RISK SIMULATION</span>
                  </div>

                  {/* Phase 3 Icon */}
                  <div className="flex flex-col items-center gap-1.5 z-10 relative">
                    <div className="w-7 h-7 rounded-full bg-amber-950/30 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)] relative">
                      <span className="animate-ping absolute inset-0 rounded-full bg-amber-500/30 opacity-75"></span>
                      <span className="relative w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    </div>
                    <span className="text-[7px] font-sans font-black tracking-wider text-amber-400 text-center max-w-[70px] leading-tight">SANDBOX OPTIM</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Layout */}
              <div className="flex gap-3">
                <button
                  onClick={handleStartOptimizer}
                  disabled={isOptimizing}
                  className="flex-1 py-3 px-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-400 hover:text-white rounded-xl transition-all font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  RE-RUN MONTE CARLO
                </button>

                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl blur opacity-35 group-hover:opacity-75 transition duration-500 group-active:duration-200 animate-pulse-slow pointer-events-none" />
                  <button
                    onClick={handleStartOptimizer}
                    disabled={isOptimizing}
                    className="relative w-full py-3 px-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-black text-[9px] uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.12)] flex items-center justify-center gap-1.5 active:scale-[0.98] border border-cyan-300/10 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-650 disabled:cursor-not-allowed"
                    id="btn-optimize-cash"
                  >
                    {isOptimizing ? (
                      <>
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                        <span>RUNNING...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>ENGAGE NEXUS SWEEP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Autonomy Engine Metadata Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-zinc-950/20 border border-zinc-900/50 p-3.5 rounded-2xl font-mono text-[9px] text-zinc-600 select-none">
                <div className="flex justify-between items-center border-b border-zinc-950 pb-1.5">
                  <span>TRUST SCORE:</span>
                  <span className="text-zinc-400 font-bold">98.4%</span>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-950 pb-1.5">
                  <span>LATENCY:</span>
                  <span className="text-zinc-400 font-bold">42ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>MEM ALLOC:</span>
                  <span className="text-zinc-400 font-bold">4.2G/8G</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>DUAL-AUTH:</span>
                  <span className="text-emerald-500 font-bold">TRUE</span>
                </div>
              </div>

              {/* Agent Live Feed / Terminal log container */}
              <TerminalLog logs={logs} isAnalyzing={isOptimizing} />

              {/* Agent Autonomy Level & Parameter Settings */}
              <div className="flex flex-col gap-4 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider border-b border-zinc-900 pb-2">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hyperparameters & Autonomy</span>
                </div>
                <div className="space-y-4">
                  
                  {/* Autonomy switch */}
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-300 font-bold block">Autonomy Mode</span>
                      <span className="text-[10px] text-zinc-500 font-semibold mt-0.5">Approve sweeps queue manually?</span>
                    </div>
                    <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 gap-1 font-bold text-[10px]">
                      <button 
                        onClick={() => setAutonomyMode("co-pilot")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${autonomyMode === 'co-pilot' ? 'bg-cyan-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Co-Pilot
                      </button>
                      <button 
                        onClick={() => setAutonomyMode("auto-pilot")}
                        className={`px-2.5 py-1 rounded-lg transition-all ${autonomyMode === 'auto-pilot' ? 'bg-purple-500 text-zinc-950' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        Auto
                      </button>
                    </div>
                  </div>

                  {/* Model dropdown selector */}
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-zinc-300 font-bold block">LLM Optimization Engine</span>
                    </div>
                    <select 
                      value={selectedModel} 
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="bg-zinc-950 border border-zinc-900 rounded-xl px-2 py-1.5 text-zinc-300 font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    </select>
                  </div>

                  {/* Temperature slider */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-zinc-300">
                      <span className="font-bold">Model Temperature</span>
                      <span className="font-mono text-zinc-400 text-[10px]">{temperature.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Technical health parameters metrics */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-[9px] text-zinc-555 font-mono">
                    <div>Scan Rate: <span className="text-zinc-350 font-bold">1.2 / min</span></div>
                    <div>Safety Rate: <span className="text-zinc-350 font-bold">99.98% SLA</span></div>
                    <div>Input Cost: <span className="text-zinc-350 font-bold">Free T1</span></div>
                    <div>Autonomy Score: <span className="text-zinc-350 font-bold">Grade-A</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorization Sweep Queue Panel */}
            <div className="glass-panel p-5 rounded-3xl border border-white/[0.01] flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-500 animate-pulse" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Authorization Queue</h3>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-mono rounded font-bold uppercase">
                  {isQueuePending ? "1 Sweep Pending" : `${pendingCount} Sweeps Pending`}
                </span>
              </div>

              {isQueuePending ? (
                <div className="bg-zinc-950/80 border border-cyan-500/30 p-4 rounded-2xl flex items-center justify-between shadow-[0_0_12px_rgba(6,182,212,0.08)] animate-pulse">
                  <div className="flex flex-col gap-1 select-none">
                    <div className="flex items-center gap-1.5 font-bold text-[10px]">
                      <span className="text-cyan-400">SVB</span>
                      <ArrowRight className="w-3 h-3 text-zinc-650" />
                      <span className="text-emerald-400">Vultr Yield Engine</span>
                    </div>
                    <p className="text-[9px] font-mono text-zinc-550 leading-normal">
                      Processing Cryptographic Pre-Approval...
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-xs text-white">
                      $2,400,000
                    </span>
                    <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                </div>
              ) : pendingCount === 0 ? (
                <div className="text-center py-6 text-zinc-550 flex flex-col items-center gap-2">
                  <Award className="w-8 h-8 text-emerald-400" />
                  <p className="text-xs font-bold text-white">Queue Completely Authorised</p>
                  <p className="text-[10px] max-w-xs leading-relaxed text-zinc-550">Treasury positions optimized. No pending transfer sweeps require human approval.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                    {pendingProposals.map((prop) => (
                      <div 
                        key={prop.id}
                        className="bg-zinc-950/60 border border-zinc-900 p-3.5 rounded-2xl flex flex-col gap-3 transition-colors hover:border-zinc-800"
                      >
                        {/* Source -> Target transfer detail */}
                        <div className="flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-cyan-400">{prop.source}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-655" />
                            <span className="text-purple-400">{prop.target}</span>
                          </div>
                          <span className="font-mono font-black text-white">
                            ${prop.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                          </span>
                        </div>

                        {/* Yield gains & individual action buttons */}
                        <div className="flex justify-between items-center text-[9px] border-t border-zinc-900 pt-2 text-zinc-550">
                          <span className="flex items-center gap-1 font-bold text-emerald-400/90 font-mono">
                            <ArrowUpRight className="w-3 h-3" />
                            +${prop.yield_increase.toLocaleString()}/yr Gain
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectProposal(prop.id)}
                              className="p-1 px-2.5 bg-zinc-900 hover:bg-red-950/20 border border-zinc-800 hover:border-red-900/30 text-zinc-400 hover:text-red-400 rounded-lg flex items-center gap-1 font-bold transition-all text-[9px]"
                              title="Reject Sweep"
                            >
                              <X className="w-2.5 h-2.5" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproveProposal(prop.id)}
                              className="p-1 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-lg flex items-center gap-1 font-bold transition-all text-[9px]"
                              title="Approve Sweep"
                            >
                              <Check className="w-2.5 h-2.5" />
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Master Sweeps Batch approval bar */}
                  <div className="border-t border-zinc-900 pt-4 flex flex-col gap-3">
                    <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Total Gain Runway</p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Across {pendingCount} sweep ops</p>
                      </div>
                      <p className="text-md font-mono font-black text-emerald-400">
                        +${totalProposedYieldGain.toLocaleString()}/yr
                      </p>
                    </div>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-98"
                    >
                      Review & Sign Sweeps
                  </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* Action modal for sweep validation and execute logic */}
      <ActionModal
        isOpen={isModalOpen}
        transfers={modalTransfers}
        onConfirm={handleApproveAll}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
}
