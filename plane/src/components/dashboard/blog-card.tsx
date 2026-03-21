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
  variant?: "default" | "featured";
}

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}`;
}

// Spotlight card: wide horizontal, avatar left, info right
function FeaturedCard({ report, publishedAt, index, onClick }: Omit<BlogCardProps, "variant">) {
  const color = getScoreColor(report.integrityScore);
  const verdict = getVerdict(report.integrityScore);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: EASE }}
      onClick={onClick}
      className="border border-foreground/15 rounded-xl text-left w-full cursor-pointer hover:bg-foreground/[0.03] transition-colors"
    >
      <div className="flex">
        {/* Avatar */}
        <div className="shrink-0 w-28 md:w-36 flex items-center justify-center border-r border-foreground/10 p-4">
          <img
            src={avatarUrl(report.projectName)}
            alt={report.projectName}
            className="w-16 h-16 md:w-20 md:h-20 rounded-xl opacity-80"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-[0.15em] text-[#06b6d4]">
                #{index + 1} Spotlight
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/40">
                {publishedAt}
              </span>
            </div>
            <span
              className="text-[11px] font-mono font-bold tracking-[0.15em]"
              style={{ color }}
            >
              {verdict}
            </span>
          </div>

          {/* Name + summary */}
          <div className="px-4 py-3 flex-1">
            <span className="text-[14px] font-mono font-bold tracking-wider uppercase block mb-1">
              {report.projectName}
            </span>
            <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed line-clamp-2">
              {report.executiveSummary}
            </p>
          </div>

          {/* Score + layers footer */}
          <div className="flex items-center border-t border-foreground/10">
            <div className="px-4 py-2 border-r border-foreground/10 flex items-baseline gap-1">
              <span
                className="text-[18px] font-mono font-bold leading-none"
                style={{ color, fontVariantNumeric: "tabular-nums" }}
              >
                {report.integrityScore}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/40">/100</span>
            </div>
            {Object.entries(report.layerScores).map(([layer, score]) => {
              const available = score >= 0;
              const lColor = available ? getScoreColor(score) : undefined;
              return (
                <div key={layer} className="px-3 py-2 border-r last:border-r-0 border-foreground/10 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/40">
                    {layer.slice(0, 3)}
                  </span>
                  {available ? (
                    <span className="text-[11px] font-mono font-bold" style={{ color: lColor, fontVariantNumeric: "tabular-nums" }}>
                      {score}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-muted-foreground/25">N/A</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// Default card: standard brutalist card with avatar
function DefaultCard({ report, publishedAt, index, onClick }: Omit<BlogCardProps, "variant">) {
  const color = getScoreColor(report.integrityScore);
  const verdict = getVerdict(report.integrityScore);

  const topSignals = report.impactVectors
    .flatMap((v) => v.signals)
    .sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
    })
    .slice(0, 2);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
      onClick={onClick}
      className="border border-foreground/15 rounded-xl text-left w-full cursor-pointer hover:bg-foreground/[0.03] transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl(report.projectName)}
            alt={report.projectName}
            className="w-8 h-8 rounded-lg opacity-70"
          />
          <div>
            <span className="text-[13px] font-mono font-bold tracking-wider uppercase block">
              {report.projectName}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/40 tracking-wider">
              {publishedAt}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[13px] font-mono font-bold"
            style={{ color, fontVariantNumeric: "tabular-nums" }}
          >
            {report.integrityScore}
          </span>
          <span className="text-[10px] font-mono font-bold tracking-[0.15em]" style={{ color }}>
            {verdict}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 py-2.5">
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed line-clamp-2">
          {report.executiveSummary}
        </p>
      </div>

      {/* Signals */}
      {topSignals.length > 0 && (
        <div className="px-4 pb-2.5 flex flex-col gap-1">
          {topSignals.map((s, i) => {
            const sc = s.severity === "critical" ? "#ef4444"
              : s.severity === "high" ? "#a855f7"
              : s.severity === "medium" ? "#eab308" : "#6b7280";
            return (
              <div key={i} className="flex items-start gap-2 text-[11px] font-mono">
                <span
                  className="shrink-0 text-[9px] font-bold tracking-wider"
                  style={{ color: sc }}
                >
                  [{s.severity.slice(0, 4).toUpperCase()}]
                </span>
                <span className="text-foreground/50 line-clamp-1">{s.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Layer scores */}
      <div className="grid grid-cols-4 border-t border-foreground/15 rounded-b-xl overflow-hidden">
        {Object.entries(report.layerScores).map(([layer, score]) => {
          const available = score >= 0;
          const lColor = available ? getScoreColor(score) : undefined;
          return (
            <div
              key={layer}
              className="flex items-center justify-between px-3 py-1.5 border-r last:border-r-0 border-foreground/10"
            >
              <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/40">
                {layer.slice(0, 3)}
              </span>
              {available ? (
                <span className="text-[11px] font-mono font-bold" style={{ color: lColor, fontVariantNumeric: "tabular-nums" }}>
                  {score}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-muted-foreground/25 tracking-wider">N/A</span>
              )}
            </div>
          );
        })}
      </div>
    </motion.button>
  );
}

export function BlogCard({ variant = "default", ...props }: BlogCardProps) {
  if (variant === "featured") return <FeaturedCard {...props} />;
  return <DefaultCard {...props} />;
}
