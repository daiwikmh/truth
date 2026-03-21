"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import type { ImpactVector } from "@/src/lib/schemas";

interface SynthOutputCardProps {
  vectors: ImpactVector[];
}

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#a855f7",
  medium: "#eab308",
  low: "#6b7280",
};

export function SynthOutputCard({ vectors }: SynthOutputCardProps) {
  return (
    <div className="space-y-3">
      {vectors.map((v, i) => {
        const gap = Math.round(Math.abs(v.claimedPerformance - v.observedReality) * 100);
        return (
          <motion.div
            key={i}
            className="border border-foreground/15 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: EASE }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
                  {v.theme}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/40">
                weight: {v.weight}
              </span>
            </div>

            {/* Claimed vs Observed */}
            <div className="px-4 py-3 space-y-2">
              <p className="text-[11px] font-mono text-muted-foreground/70 leading-relaxed">
                {v.summary}
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-16">CLAIMED</span>
                  <div className="flex-1 h-3 bg-foreground/[0.04] rounded overflow-hidden">
                    <div
                      className="h-full rounded bg-foreground/20"
                      style={{ width: `${v.claimedPerformance * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-8 text-right tabular-nums">
                    {Math.round(v.claimedPerformance * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground/50 w-16">ACTUAL</span>
                  <div className="flex-1 h-3 bg-foreground/[0.04] rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${v.observedReality * 100}%`,
                        backgroundColor: gap > 40 ? "#ef4444" : gap > 20 ? "#a855f7" : "#22c55e",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-8 text-right tabular-nums">
                    {Math.round(v.observedReality * 100)}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground/30">
                    GAP: {gap}%
                  </span>
                </div>
              </div>
            </div>

            {/* Signals */}
            {v.signals.length > 0 && (
              <div className="border-t border-foreground/10 px-4 py-2 space-y-1">
                {v.signals.map((s, si) => (
                  <div key={si} className="flex items-start gap-2 text-[10px] font-mono">
                    <span
                      className="shrink-0 font-bold tracking-wider"
                      style={{ color: SEV_COLORS[s.severity] ?? "#6b7280" }}
                    >
                      [{s.severity.slice(0, 4).toUpperCase()}]
                    </span>
                    <span className="text-foreground/50">{s.text}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
