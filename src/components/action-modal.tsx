"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Shield, Landmark, Activity, KeyRound } from 'lucide-react';

interface Transfer {
  from_account: string;
  to_account: string;
  amount: number;
}

interface ActionModalProps {
  isOpen: boolean;
  transfers: Transfer[];
  onConfirm: () => void;
  onClose: () => void;
}

export default function ActionModal({ isOpen, transfers, onConfirm, onClose }: ActionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureText, setSignatureText] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync native HTML5 dialog element open/close state
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Reset simulated states on modal open
      setIsExecuting(false);
      setIsSigning(false);
      setSignatureText("");
      setProgress(0);
      setShowSuccess(false);
      
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Click outside to dismiss modal
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [onClose]);

  // Trigger typewriter digital signature before execution
  const startSignatureWorkflow = () => {
    setIsSigning(true);
    setSignatureText("");
  };

  // Signature typing effect
  useEffect(() => {
    if (!isSigning) {
      setSignatureText("");
      return;
    }

    const targetSignature = "AUTH_SIG_OK // RSA_4096_BLOCK_MATCH";
    let charIndex = 0;

    const typingTimer = setInterval(() => {
      if (charIndex < targetSignature.length) {
        setSignatureText((prev) => prev + targetSignature[charIndex]);
        charIndex++;
      } else {
        clearInterval(typingTimer);
        // After typing finishes, pause for a moment and transition into settlement execution
        setTimeout(() => {
          setIsSigning(false);
          handleExecute();
        }, 800);
      }
    }, 45); // 45ms per character typing speed

    return () => clearInterval(typingTimer);
  }, [isSigning]);

  // Trigger simulated progression over 2.5 seconds
  const handleExecute = () => {
    setIsExecuting(true);
    setProgress(0);
    setShowSuccess(false);

    const duration = 2500; // 2.5 seconds total
    const intervalTime = 20; // Update progress every 20ms
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextVal = prev + step;
        if (nextVal >= 100) {
          clearInterval(timer);
          setShowSuccess(true);
          // Trigger confirmation callback to update parent state balances
          onConfirm();
          return 100;
        }
        return nextVal;
      });
    }, intervalTime);
  };

  // Helper to compute progress per step
  const getStepProgress = (stepIndex: number) => {
    const start = stepIndex * 33.33;
    const end = (stepIndex + 1) * 33.33;

    if (progress <= start) return 0;
    if (progress >= end) return 100;
    return ((progress - start) / 33.33) * 100;
  };

  const totalAmount = transfers.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <dialog
      ref={dialogRef}
      className="bg-transparent outline-none border-none p-0 max-w-[550px] w-full backdrop:bg-black/80 backdrop:backdrop-blur-md"
    >
      <div className="glass-panel p-6 rounded-3xl border border-zinc-800 text-white shadow-2xl relative overflow-hidden flex flex-col gap-6 selection:bg-cyan-500/20 selection:text-cyan-200">
        
        {/* Modal Close Action */}
        <button
          onClick={onClose}
          disabled={(isExecuting || isSigning) && !showSuccess}
          className="absolute top-4 right-4 p-1.5 text-zinc-550 hover:text-white rounded-xl hover:bg-zinc-900/60 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content View Routing */}
        <AnimatePresence mode="wait">
          {!isExecuting ? (
            /* PHASE 1: Breakdown Overview and Sign Sweep Action */
            <motion.div
              key="breakdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5"
            >
              {/* Header Title */}
              <div className="flex items-center gap-3 select-none">
                <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/35 rounded-2xl text-cyan-400">
                  <Shield className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">NEXUS TREASURY CLEARDOWN SYSTEM // DUAL-KEY AUTHORIZATION REQUIRED</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Please sign and execute corporate wire routing transfers.</p>
                </div>
              </div>

              {/* Security Protocol Directive alert box */}
              <div className="bg-cyan-950/20 border border-cyan-500/25 p-3 rounded-2xl flex gap-3 items-start select-none">
                <KeyRound className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8.5px] font-mono font-black text-cyan-400 uppercase tracking-wider">Security Protocol Directive:</span>
                  <p className="text-[8.5px] font-sans text-zinc-400 leading-normal">
                    Execution requires mutual authentication keys. System has auto-signed for Key 01 (Treasury Agent Hub). Operator signature required for Key 02.
                  </p>
                </div>
              </div>

              {/* Transfers Breakdown List */}
              <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
                {transfers.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-[10px] font-mono select-none">No sweeps in queue.</div>
                ) : (
                  transfers.map((item, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-2xl flex flex-col gap-2.5 transition-colors hover:border-zinc-850">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-cyan-400 flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-cyan-500/70" />
                            {item.from_account}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-700" />
                          <span className="text-purple-400">{item.to_account}</span>
                        </div>
                        <span className="font-mono font-black text-white">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Aggregation Summary bar */}
              <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex justify-between items-center select-none">
                <div>
                  <span className="text-zinc-550 text-[9px] uppercase tracking-wider font-bold block">Aggregated Transfer Volume</span>
                  <span className="text-[10px] text-zinc-400 font-semibold mt-0.5">{transfers.length} transactions queued</span>
                </div>
                <span className="text-md font-mono font-black text-emerald-400 animate-pulse">
                  ${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Signing status or action buttons */}
              {isSigning ? (
                <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex flex-col gap-2 font-mono text-[9px] select-none border-dashed animate-pulse">
                  <div className="flex justify-between items-center text-cyan-400 font-bold">
                    <span>SIGNING DUAL-KEY AUTHENTICATION...</span>
                    <span>OPERATOR KEY 02</span>
                  </div>
                  <div className="h-10 bg-zinc-950/80 border border-zinc-900 rounded-xl flex items-center px-3 text-emerald-400 font-bold tracking-widest text-[10px]">
                    {signatureText}
                    <span className="w-1.5 h-3.5 bg-emerald-400 ml-1 animate-ping" />
                  </div>
                </div>
              ) : (
                /* Actions Footer */
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-zinc-350 text-xs font-black uppercase py-3 px-4 rounded-xl border border-zinc-850 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startSignatureWorkflow}
                    disabled={transfers.length === 0}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 text-xs font-black uppercase py-3 px-4 rounded-xl transition-all shadow-md active:scale-98 disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-zinc-650 disabled:cursor-not-allowed"
                  >
                    Sign & Execute Wire Transfers
                  </button>
                </div>
              )}
            </motion.div>
          ) : !showSuccess ? (
            /* PHASE 2: Simulated Execution Loading Progress Bars */
            <motion.div
              key="executing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6 py-4 font-mono text-[10px]"
            >
              <div className="flex flex-col gap-1 items-center justify-center text-center select-none pb-2">
                <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="text-xs font-bold text-white uppercase tracking-wider mt-2.5">Executing Secure Rebalances</span>
                <p className="text-[9px] text-zinc-500 mt-1">Interfacing with liquidity clearing houses...</p>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>1. Verifying compliance schemas...</span>
                    <span>{Math.round(getStepProgress(0))}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-100 ease-out" 
                      style={{ width: `${getStepProgress(0)}%` }}
                    />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>2. Injecting settlement paths...</span>
                    <span>{Math.round(getStepProgress(1))}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full transition-all duration-100 ease-out" 
                      style={{ width: `${getStepProgress(1)}%` }}
                    />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-zinc-400 font-bold">
                    <span>3. Clearing clearinghouse network routes...</span>
                    <span>{Math.round(getStepProgress(2))}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-100 ease-out" 
                      style={{ width: `${getStepProgress(2)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* PHASE 3: Execution Complete and Success Checkmark screen */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-6 gap-4 select-none"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="text-emerald-400"
              >
                <CheckCircle className="w-16 h-16 filter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
              </motion.div>
              
              <div className="space-y-1">
                <h3 className="text-md font-black uppercase text-white tracking-widest">Rebalance Deployed Successfully</h3>
                <p className="text-zinc-550 text-xs font-semibold">Ledger balances have been updated and verified by guardian policies.</p>
              </div>

              {/* Dynamic balances rebalanced indicator list */}
              <div className="bg-zinc-950/80 border border-zinc-900 rounded-2xl p-4 w-full text-left font-mono text-[9px] leading-relaxed text-zinc-450 space-y-1 border-dashed">
                <div>SWEEP COMPLETED AT: <span className="text-zinc-350">{new Date().toLocaleTimeString()}</span></div>
                <div>MUTATION LEDGER REFERENCE: <span className="text-zinc-350 font-bold">APX-WL-98231</span></div>
                <div>YIELD VELOCITY STATUS: <span className="text-emerald-400 font-bold">MAXIMIZED</span></div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-950/20 mt-2"
              >
                Return to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </dialog>
  );
}
