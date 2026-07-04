"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Percent, Clock } from 'lucide-react';
import { TiltCard } from './ui/tilt-card';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  yield_rate: number;
  min_balance: number;
  category: "checking" | "savings";
}

interface MetricsGridProps {
  accounts: Account[];
}

export default function MetricsGrid({ accounts }: MetricsGridProps) {
  // Calculations
  const totalAssets = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  
  const checkingAssets = accounts
    .filter(a => a.category === 'checking')
    .reduce((acc, curr) => acc + curr.balance, 0);
    
  const savingsAssets = accounts
    .filter(a => a.category === 'savings')
    .reduce((acc, curr) => acc + curr.balance, 0);

  const annualYield = accounts.reduce((acc, curr) => acc + (curr.balance * curr.yield_rate), 0);
  const monthlyYield = annualYield / 12;
  const averageAPY = totalAssets > 0 ? (annualYield / totalAssets) * 100 : 0;
  
  // Assuming a constant monthly burn rate of $80,000
  const monthlyBurnRate = 80000;
  const runwayMonths = monthlyBurnRate > 0 ? checkingAssets / monthlyBurnRate : 0;

  const checkingPct = totalAssets > 0 ? (checkingAssets / totalAssets) * 100 : 0;
  const savingsPct = totalAssets > 0 ? (savingsAssets / totalAssets) * 100 : 0;

  const cardVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: "easeOut" as const
    }
  })
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      {/* Metric 1: Total Cash Assets */}
      <motion.div 
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-panel rounded-2xl relative overflow-visible flex flex-col justify-between h-[160px]"
      >
        <TiltCard glow={true} className="h-full w-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Cash Assets</p>
              <h3 className="text-3xl font-bold mt-1 text-white tracking-tight">
                ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl text-opsCyan border border-zinc-700/50">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Checking: {checkingPct.toFixed(0)}%</span>
              <span>Savings: {savingsPct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden flex">
              <div 
                className="bg-opsCyan h-full transition-all duration-550" 
                style={{ width: `${checkingPct}%` }}
              />
              <div 
                className="bg-treasuryPurple h-full transition-all duration-550" 
                style={{ width: `${savingsPct}%` }}
              />
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Metric 2: Monthly Yield */}
      <motion.div 
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-panel rounded-2xl relative overflow-visible flex flex-col justify-between h-[160px]"
      >
        <TiltCard glow={true} className="h-full w-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Projected Monthly Yield</p>
              <h3 className="text-3xl font-bold mt-1 text-yieldGreen tracking-tight">
                ${monthlyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl text-yieldGreen border border-zinc-700/50">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-yieldGreen animate-pulse" />
            <span>Annual Run-rate: ${annualYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}/yr</span>
          </div>
        </TiltCard>
      </motion.div>

      {/* Metric 3: Average APY */}
      <motion.div 
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-panel rounded-2xl relative overflow-visible flex flex-col justify-between h-[160px]"
      >
        <TiltCard glow={true} className="h-full w-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Average Yield APY</p>
              <h3 className="text-3xl font-bold mt-1 text-white tracking-tight">
                {averageAPY.toFixed(2)}%
              </h3>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl text-purple-400 border border-zinc-700/50">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Yield Target</span>
              <span>4.0%</span>
            </div>
            <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-treasuryPurple to-yieldGreen h-full transition-all duration-550" 
                style={{ width: `${Math.min((averageAPY / 4.5) * 100, 100)}%` }}
              />
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* Metric 4: Operational Runway */}
      <motion.div 
        custom={3}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="glass-panel rounded-2xl relative overflow-visible flex flex-col justify-between h-[160px]"
      >
        <TiltCard glow={true} className="h-full w-full p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Checking Runway</p>
              <h3 className={`text-3xl font-bold mt-1 tracking-tight ${runwayMonths >= 3 ? 'text-white' : 'text-amber-500'}`}>
                {runwayMonths.toFixed(1)} mo
              </h3>
            </div>
            <div className="p-3 bg-zinc-800/60 rounded-xl text-amber-500 border border-zinc-700/50">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${runwayMonths >= 3.0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {runwayMonths >= 3.0 ? 'COMPLIANT' : 'WARN - DANGER'}
            </span>
            <span>Burn rate: $80K/mo</span>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
}
