"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  GitBranch,
  MessageSquare,
  Landmark,
} from "lucide-react";
import { ScoreGauge, MiniGauge } from "@/src/components/shared/score-gauge";
import { getScoreColor } from "@/src/utils/score";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

const LAYER_ICONS: Record<string, typeof Activity> = {
  onchain: Activity,
  development: GitBranch,
  social: MessageSquare,
  governance: Landmark,
};

const LAYER_LABELS: Record<string, string> = {
  onchain: "ON-CHAIN",
  development: "DEVELOPMENT",
  social: "SOCIAL",
  governance: "GOVERNANCE",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-[#eab308]",
  high: "text-[#f97316]",
  critical: "text-[#ef4444]",
};

interface BlogPostProps {
  report: IntegrityReport;
  publishedAt: string;
  onBack: () => void;
}

export function BlogPost({ report, publishedAt, onBack }: BlogPostProps) {
  const color = getScoreColor(report.integrityScore);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="max-w-3xl mx-auto"
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-4"
      >
        <ArrowLeft size={10} />
        BACK TO BLOG
      </button>

      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="border border-foreground/15 rounded-xl overflow-hidden mb-0"
      >
        <div className="flex items-center justify-between border-b border-foreground/15 px-4 py-2">
          <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            INTEGRITY REPORT
          </span>
          <span className="text-[8px] font-mono text-muted-foreground/50 tabular-nums">
            {publishedAt}
          </span>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Score gauge */}
          <div className="flex flex-col items-center justify-center p-6 md:border-r border-b md:border-b-0 border-foreground/10 min-w-[200px]">
            <ScoreGauge score={report.integrityScore} size={150} />
            <span className="mt-3 text-sm font-mono font-bold tracking-tight">
              {report.projectName}
            </span>
          </div>

          {/* Summary + layers */}
          <div className="flex-1 flex flex-col">
            <div className="px-5 py-4 flex-1">
              <span className="text-[7px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-2">
                EXECUTIVE SUMMARY
              </span>
              <p className="text-[12px] font-mono text-foreground leading-[1.8]">
                {report.executiveSummary}
              </p>
            </div>

            <div className="grid grid-cols-4 border-t border-foreground/15">
              {Object.entries(report.layerScores).map(([layer, score], i) => {
                const Icon = LAYER_ICONS[layer] ?? Activity;
                return (
                  <div
                    key={layer}
                    className={`px-3 py-3 ${i < Object.keys(report.layerScores).length - 1 ? "border-r border-foreground/15" : ""}`}
                  >
                    <div className="flex items-center gap-1 mb-2">
                      <Icon size={9} className="text-muted-foreground/60" />
                      <span className="text-[7px] tracking-[0.12em] uppercase text-muted-foreground font-mono">
                        {LAYER_LABELS[layer] ?? layer.toUpperCase()}
                      </span>
                    </div>
                    <MiniGauge label="" score={score} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Impact Vectors */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
        className="border border-foreground/15 rounded-xl overflow-hidden mt-3"
      >
        <div className="px-4 py-2 border-b border-foreground/15">
          <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            IMPACT VECTORS
          </span>
        </div>

        {report.impactVectors.map((vector, i) => {
          const gap = Math.round(
            Math.abs(vector.claimedPerformance - vector.observedReality) * 100
          );

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.3, ease: EASE }}
              className="border-b border-foreground/10 last:border-b-0 px-5 py-4"
            >
              {/* Vector title */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-mono font-bold">
                  {vector.theme}
                </span>
                <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-foreground text-background rounded-md">
                  GAP {gap}%
                </span>
              </div>

              <p className="text-[11px] font-mono text-muted-foreground leading-[1.7] mb-3">
                {vector.summary}
              </p>

              {/* Divergence bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                    CLAIMED {(vector.claimedPerformance * 100).toFixed(0)}%
                  </span>
                  <span className="text-[7px] tracking-[0.15em] uppercase text-muted-foreground font-mono">
                    OBSERVED {(vector.observedReality * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-2 border border-foreground/20 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-foreground/10"
                    style={{ width: `${vector.claimedPerformance * 100}%` }}
                  />
                  <div
                    className="absolute top-0 left-0 h-full bg-[#ef4444]"
                    style={{ width: `${vector.observedReality * 100}%` }}
                  />
                </div>
              </div>

              {/* Signals */}
              <div className="flex flex-col gap-1.5">
                {vector.signals.map((signal, j) => (
                  <div
                    key={j}
                    className="flex items-start gap-2.5 text-[10px] font-mono"
                  >
                    <span
                      className={`shrink-0 w-14 uppercase text-[8px] tracking-wider pt-0.5 ${SEVERITY_COLORS[signal.severity] ?? "text-muted-foreground"}`}
                    >
                      {signal.severity}
                    </span>
                    <span className="text-foreground/80 flex-1 leading-relaxed">
                      {signal.text}
                    </span>
                    <span className="text-muted-foreground/40 shrink-0 text-[8px] tabular-nums pt-0.5">
                      {(signal.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: EASE }}
        className="border border-foreground/15 rounded-xl overflow-hidden mt-3 mb-8"
      >
        <div className="px-4 py-2 border-b border-foreground/15">
          <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            RECOMMENDATIONS
          </span>
        </div>
        {report.recommendations.map((rec, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-5 py-3 border-b border-foreground/5 last:border-b-0"
          >
            <span
              className="text-[10px] font-mono font-bold shrink-0 tabular-nums"
              style={{ color }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-[11px] font-mono text-foreground/80 leading-[1.7]">
              {rec}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
