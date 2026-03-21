"use client";

import { motion } from "framer-motion";
import { ProjectCard } from "./project-card";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface DashboardViewProps {
  evaluations: IntegrityReport[];
  onSelectReport: (report: IntegrityReport) => void;
  onNewScan: () => void;
}

export function DashboardView({
  evaluations,
  onSelectReport,
  onNewScan,
}: DashboardViewProps) {
  if (evaluations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center justify-center pt-24"
      >
        <div className="border-2 border-foreground/15 px-8 py-10 text-center max-w-sm">
          <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
            NO EVALUATIONS YET
          </span>
          <p className="text-[11px] font-mono text-muted-foreground/70 leading-relaxed mb-6">
            Run your first project scan to see integrity reports here.
          </p>
          <button
            onClick={onNewScan}
            className="text-[10px] font-mono tracking-[0.15em] uppercase border-2 border-foreground px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
          >
            $ scan --project
          </button>
        </div>
      </motion.div>
    );
  }

  // Summary stats
  const avgScore = Math.round(
    evaluations.reduce((s, e) => s + e.integrityScore, 0) / evaluations.length
  );
  const criticalCount = evaluations.filter(
    (e) => e.verdict === "critical"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="space-y-4"
    >
      {/* Summary bar */}
      <div className="grid grid-cols-3 border-2 border-foreground">
        <div className="px-4 py-3 border-r border-foreground/15">
          <span className="text-[7px] tracking-[0.18em] uppercase text-muted-foreground font-mono block">
            EVALUATED
          </span>
          <span className="text-lg font-mono font-bold">
            {evaluations.length}
          </span>
        </div>
        <div className="px-4 py-3 border-r border-foreground/15">
          <span className="text-[7px] tracking-[0.18em] uppercase text-muted-foreground font-mono block">
            AVG SCORE
          </span>
          <span className="text-lg font-mono font-bold">{avgScore}</span>
        </div>
        <div className="px-4 py-3">
          <span className="text-[7px] tracking-[0.18em] uppercase text-muted-foreground font-mono block">
            CRITICAL
          </span>
          <span className="text-lg font-mono font-bold text-[#ef4444]">
            {criticalCount}
          </span>
        </div>
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {evaluations.map((report, i) => (
          <ProjectCard
            key={`${report.projectName}-${i}`}
            report={report}
            index={i}
            onClick={() => onSelectReport(report)}
          />
        ))}
      </div>
    </motion.div>
  );
}
