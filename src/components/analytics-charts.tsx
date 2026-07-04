"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { TiltCard } from './ui/tilt-card';

// Mock Data for Cashflow
const cashflowData = Array.from({ length: 6 }, (_, i) => ({
  month: `M+${i+1}`,
  inflows: 1200000 + Math.random() * 200000,
  outflows: 680000 + Math.random() * 100000,
  balance: 3780000 + (1200000 - 680000) * (i + 1)
}));

// Mock Data for Sweep Execution
const portfolioData = [
  { name: "Pre-Sweep", "Operating Cash": 3780000, "High-Yield Inst.": 0 },
  { name: "Post-Sweep", "Operating Cash": 500000, "High-Yield Inst.": 3280000 },
];

const fmtCompact = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-3 rounded-md shadow-2xl">
      <p className="text-xs text-zinc-400 mb-2 font-semibold uppercase">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs mt-1.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-zinc-300">{p.name}</span>
          </div>
          <span className="font-mono tabular-nums font-medium text-white">{fmtCompact(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsCharts() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-[280px]" />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Cashflow Forecast (Area Chart) */}
      <TiltCard glow={true}>
        <div className="glass-panel p-5 rounded-3xl border border-white/[0.01] h-[280px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">90-Day Cashflow Forecast</span>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" name="Projected Balance" stroke="#34d399" strokeWidth={2} fill="url(#balanceGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TiltCard>

      {/* Sweep Execution (Horizontal Bar Chart) */}
      <TiltCard glow={true}>
        <div className="glass-panel p-5 rounded-3xl border border-white/[0.01] h-[280px] flex flex-col">
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Sweep Execution (Before/After)</span>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portfolioData} layout="vertical" barSize={32} margin={{ top: 0, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#52525b", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#52525b", fontSize: 10, fontWeight: "bold" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10, textTransform: 'uppercase' }} iconType="circle" />
                <Bar dataKey="Operating Cash" stackId="a" fill="#06b6d4" radius={[4, 0, 0, 4]} />
                <Bar dataKey="High-Yield Inst." stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TiltCard>
    </div>
  );
}
