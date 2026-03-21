"use client";

import { motion } from "framer-motion";
import { getScoreColor, getVerdict } from "@/src/utils/score";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface BlogCardProps {
  report: IntegrityReport;
  publishedAt: string;
  index: number;
  onClick: () => void;
}

export function BlogCard({ report, publishedAt, index, onClick }: BlogCardProps) {
  const color = getScoreColor(report.integrityScore);
  const verdict = getVerdict(report.integrityScore);

  // Top 2 signals by severity
  const topSignals = report.impactVectors
    .flatMap((v) => v.signals)
    .sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
    })
    .slice(0, 2);

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: EASE }}
      onClick={onClick}
      className="border border-foreground/15 rounded-xl text-left w-full cursor-pointer hover:bg-foreground/[0.03] transition-colors group"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 border border-foreground/20 rounded-lg flex items-center justify-center"
            style={{ borderColor: color }}
          >
            <span
              className="text-[11px] font-mono font-bold"
              style={{ color, fontVariantNumeric: "tabular-nums" }}
            >
              {report.integrityScore}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase block">
              {report.projectName}
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/50 tracking-wider">
              {publishedAt}
            </span>
          </div>
        </div>
        <span
          className="text-[8px] font-mono font-bold tracking-[0.15em] px-2 py-0.5 border rounded-md"
          style={{ color, borderColor: color }}
        >
          {verdict}
        </span>
      </div>

      {/* Summary */}
      <div className="px-4 py-3">
        <p className="text-[10px] font-mono text-muted-foreground leading-relaxed line-clamp-2">
          {report.executiveSummary}
        </p>
      </div>

      {/* Top signals */}
      {topSignals.length > 0 && (
        <div className="px-4 pb-3 flex flex-col gap-1">
          {topSignals.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[9px] font-mono">
              <span
                className={`shrink-0 uppercase tracking-wider ${
                  s.severity === "critical"
                    ? "text-[#ef4444]"
                    : s.severity === "high"
                      ? "text-[#f97316]"
                      : "text-muted-foreground/50"
                }`}
              >
                [{s.severity.slice(0, 4).toUpperCase()}]
              </span>
              <span className="text-foreground/60 line-clamp-1">{s.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Layer scores footer */}
      <div className="grid grid-cols-4 border-t border-foreground/15">
        {Object.entries(report.layerScores).map(([layer, score]) => {
          const lColor = getScoreColor(score);
          return (
            <div
              key={layer}
              className="flex items-center justify-between px-3 py-1.5 border-r last:border-r-0 border-foreground/10"
            >
              <span className="text-[7px] font-mono tracking-wider uppercase text-muted-foreground/40">
                {layer.slice(0, 3)}
              </span>
              <span
                className="text-[9px] font-mono font-bold"
                style={{ color: lColor, fontVariantNumeric: "tabular-nums" }}
              >
                {score}
              </span>
            </div>
          );
        })}
      </div>
    </motion.button>
  );
}
