"use client";

import { motion } from "framer-motion";
import { getScoreColor } from "@/src/utils/score";
import { EASE } from "@/src/config/constants";
import type { IntegrityReport } from "@/src/lib/schemas";

interface RecentScansProps {
  evaluations: IntegrityReport[];
  onSelect: (report: IntegrityReport) => void;
}

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}`;
}

export function RecentScans({ evaluations, onSelect }: RecentScansProps) {
  const recent = evaluations.slice(0, 5);

  return (
    <div className="border border-foreground/15 rounded-xl">
      <div className="border-b border-foreground/10 px-4 py-2">
        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
          RECENT SCANS
        </span>
      </div>
      <div className="divide-y divide-foreground/10">
        {recent.length === 0 && (
          <div className="px-4 py-6 text-center">
            <span className="text-[11px] font-mono text-muted-foreground/40">
              No scans yet
            </span>
          </div>
        )}
        {recent.map((report, i) => {
          const color = getScoreColor(report.integrityScore);
          return (
            <motion.button
              key={`${report.projectName}-${i}`}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: EASE }}
              onClick={() => onSelect(report)}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-foreground/[0.03] transition-colors cursor-pointer"
            >
              <img
                src={avatarUrl(report.projectName)}
                alt={report.projectName}
                className="w-6 h-6 rounded-md opacity-60 shrink-0"
              />
              <span className="text-[12px] font-mono font-bold tracking-wider uppercase truncate flex-1">
                {report.projectName}
              </span>
              <span
                className="text-[12px] font-mono font-bold shrink-0"
                style={{ color, fontVariantNumeric: "tabular-nums" }}
              >
                {report.integrityScore}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
