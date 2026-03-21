"use client";

import { motion } from "framer-motion";
import { Activity, GitBranch, MessageSquare, Landmark } from "lucide-react";
import { getScoreColor, getVerdict } from "@/src/utils/score";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface ProjectCardProps {
  report: IntegrityReport;
  index: number;
  onClick?: () => void;
}

const LAYER_ICONS: Record<string, typeof Activity> = {
  onchain: Activity,
  development: GitBranch,
  social: MessageSquare,
  governance: Landmark,
};

export function ProjectCard({ report, index, onClick }: ProjectCardProps) {
  const color = getScoreColor(report.integrityScore);
  const verdict = getVerdict(report.integrityScore);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
      onClick={onClick}
      className="border border-foreground/15 rounded-xl text-left w-full cursor-pointer hover:bg-foreground/[0.03] transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-foreground/15 px-4 py-2.5">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase truncate">
          {report.projectName}
        </span>
        <span
          className="text-[9px] font-mono font-bold tracking-[0.15em]"
          style={{ color }}
        >
          {verdict}
        </span>
      </div>

      {/* Score + summary */}
      <div className="px-4 py-3 flex gap-4">
        <div className="flex flex-col items-center justify-center min-w-[56px]">
          <span
            className="text-3xl font-mono font-bold leading-none"
            style={{ color, fontVariantNumeric: "tabular-nums" }}
          >
            {report.integrityScore}
          </span>
          <span className="text-[7px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
            SCORE
          </span>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground leading-relaxed line-clamp-3">
          {report.executiveSummary}
        </p>
      </div>

      {/* Layer scores bar */}
      <div className="grid grid-cols-4 border-t border-foreground/15">
        {Object.entries(report.layerScores).map(([layer, score]) => {
          const Icon = LAYER_ICONS[layer] ?? Activity;
          const lColor = getScoreColor(score);
          return (
            <div
              key={layer}
              className="flex items-center gap-1.5 px-3 py-2 border-r last:border-r-0 border-foreground/10"
            >
              <Icon size={10} className="text-muted-foreground/50 shrink-0" />
              <span
                className="text-[10px] font-mono font-bold"
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
