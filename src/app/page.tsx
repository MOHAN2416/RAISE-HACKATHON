"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Loader2, Play } from "lucide-react";

// mock data for the UI representation
const balances = {
  Operating_Account_Main: 650000,
  Operating_Account_Secondary: 120000,
  Payroll_Account: 300000,
  Tax_Reserve: 150000,
  Vendor_Payments: 80000,
};

export default function Dashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const runAgent = async () => {
    setIsRunning(true);
    setLogs([]);
    setAudioUrl(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;

      if (!reader) throw new Error("No reader");

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (!value) continue;

        const chunkValue = decoder.decode(value, { stream: true });
        
        // Chunk could contain multiple JSON lines
        const lines = chunkValue.split("\n").filter(Boolean);
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.type === "log") {
              setLogs((prev) => [...prev, data.message]);
            } else if (data.type === "audio") {
              setAudioUrl(`data:audio/mp3;base64,${data.audioBase64}`);
            } else if (data.type === "error") {
              setLogs((prev) => [...prev, `❌ Error: ${data.message}`]);
            }
          } catch (e) {
            console.error("Failed to parse chunk line", line);
          }
        }
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-poppins font-bold text-white mb-2 tracking-tight">ApexLiquidity</h1>
          <p className="text-muted-foreground text-lg">Corporate Treasury Risk Agent</p>
        </div>
        <Button 
          onClick={runAgent} 
          disabled={isRunning}
          size="lg"
          className="bg-accent hover:bg-accent/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all font-semibold rounded-xl"
        >
          {isRunning ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Play className="w-5 h-5 mr-2" />}
          {isRunning ? "Executing Policy..." : "Run Treasury Agent"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center text-xl font-poppins text-white">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Current Balances
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(balances).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-black/20 border border-white/5 hover:bg-black/30 transition-colors">
                  <span className="text-sm font-medium text-slate-300">{key.replace(/_/g, " ")}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-sm px-2 py-1">
                    ${val.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card/40 backdrop-blur-xl border-white/10 shadow-xl rounded-2xl h-full min-h-[500px] flex flex-col">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center text-xl font-poppins text-white">
                <Activity className="w-5 h-5 mr-2 text-accent" />
                Agent Execution Log
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6 space-y-4 font-mono text-sm text-slate-300">
              {logs.length === 0 && !isRunning && (
                <div className="text-center text-slate-500 mt-20 flex flex-col items-center">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <p>Agent is idle. Click run to execute the treasury policy.</p>
                </div>
              )}
              {logs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={`animate-in fade-in slide-in-from-bottom-2 p-4 rounded-lg border leading-relaxed ${
                    log.startsWith("❌") 
                      ? "bg-destructive/10 border-destructive/20 text-destructive-foreground"
                      : log.startsWith("Agent:")
                      ? "bg-accent/10 border-accent/20 text-white font-sans text-base shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                      : "bg-black/20 border-white/5"
                  }`}
                >
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center text-primary mt-4">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {audioUrl && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
              <audio controls autoPlay src={audioUrl} className="w-full rounded-xl shadow-2xl outline-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
