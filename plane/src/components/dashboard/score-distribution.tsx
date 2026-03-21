"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface ScoreDistributionProps {
  evaluations: IntegrityReport[];
}

const BUCKETS = [
  { key: "exceptional", label: "EXCEPTIONAL", range: "80+", color: "#22c55e" },
  { key: "strong", label: "STRONG", range: "60-79", color: "#eab308" },
  { key: "moderate", label: "MODERATE", range: "40-59", color: "#a855f7" },
  { key: "critical", label: "CRITICAL", range: "<40", color: "#ef4444" },
] as const;

function getBucket(score: number) {
  if (score >= 80) return "exceptional";
  if (score >= 60) return "strong";
  if (score >= 40) return "moderate";
  return "critical";
}

export function ScoreDistribution({ evaluations }: ScoreDistributionProps) {
  const counts: Record<string, number> = { exceptional: 0, strong: 0, moderate: 0, critical: 0 };
  for (const e of evaluations) counts[getBucket(e.integrityScore)]++;
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="border border-foreground/15 rounded-xl">
      <div className="border-b border-foreground/10 px-4 py-2">
        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
          SCORE DISTRIBUTION
        </span>
      </div>
      <div className="p-4 space-y-3">
        {BUCKETS.map((b, i) => (
          <motion.div
            key={b.key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className="text-[10px] font-mono tracking-wider w-20 text-muted-foreground/60">
              {b.label}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground/40 w-10">
              {b.range}
            </span>
            <div className="flex-1 h-5 bg-foreground/[0.04] rounded overflow-hidden">
              <motion.div
                className="h-full rounded"
                style={{ backgroundColor: b.color, opacity: 0.7 }}
                initial={{ width: 0 }}
                animate={{ width: `${(counts[b.key] / max) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: EASE }}
              />
            </div>
            <span
              className="text-[12px] font-mono font-bold w-6 text-right"
              style={{ color: b.color, fontVariantNumeric: "tabular-nums" }}
            >
              {counts[b.key]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
