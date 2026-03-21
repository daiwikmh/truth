"use client";

import { motion } from "framer-motion";
import { getScoreColor } from "@/src/utils/score";
import { EASE } from "@/src/config/constants";
import type { LayerAnalysis } from "@/src/lib/schemas";

interface EvalOutputCardProps {
  eval: LayerAnalysis;
  color: string;
  index: number;
}

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#a855f7",
  medium: "#eab308",
  low: "#6b7280",
};

export function EvalOutputCard({ eval: evalData, color, index }: EvalOutputCardProps) {
  const skipped = evalData.score < 0;
  const scoreColor = skipped ? undefined : getScoreColor(evalData.score);

  return (
    <motion.div
      className="border border-foreground/15 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: EASE }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
            eval-{evalData.layer}
          </span>
        </div>
        {skipped ? (
          <span className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">
            SKIPPED
          </span>
        ) : (
          <span
            className="text-[14px] font-mono font-bold"
            style={{ color: scoreColor, fontVariantNumeric: "tabular-nums" }}
          >
            {evalData.score}
          </span>
        )}
      </div>

      {/* Summary */}
      <div className="px-4 py-3 border-b border-foreground/10">
        <p className="text-[11px] font-mono text-muted-foreground/70 leading-relaxed">
          {skipped ? "No data available for this layer." : evalData.summary}
        </p>
      </div>

      {/* Signals */}
      {evalData.signals.length > 0 && (
        <div className="px-4 py-2 space-y-1.5">
          {evalData.signals.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] font-mono">
              <span
                className="shrink-0 font-bold tracking-wider"
                style={{ color: SEV_COLORS[s.severity] ?? "#6b7280" }}
              >
                [{s.severity.slice(0, 4).toUpperCase()}]
              </span>
              <span className="text-foreground/50 flex-1">{s.text}</span>
              <span className="text-muted-foreground/30 shrink-0 tabular-nums">
                {Math.round(s.confidence * 100)}%
              </span>
              <span className="text-muted-foreground/30 shrink-0">{s.source}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
