"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import { getScoreColor, getVerdict } from "@/src/utils/score";
import type { IntegrityReport } from "@/src/lib/schemas";
import type { ScanResult } from "@/src/lib/scan-result";

interface DashboardViewProps {
  scans: ScanResult[];
  onSelectReport: (report: IntegrityReport) => void;
  onNewScan: () => void;
  onCompare?: () => void;
}

interface DashboardStats {
  totalProjects: number;
  totalEvaluations: number;
  totalPublished: number;
  trending: {
    projectName: string;
    integrityScore: number;
    verdict: string;
    summary: string | null;
    publishedAt: string | null;
    report: IntegrityReport;
  }[];
}

function avatarUrl(name: string) {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name)}`;
}

export function DashboardView({
  scans,
  onSelectReport,
  onNewScan,
  onCompare,
}: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [fundedProjects, setFundedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, [scans.length]);

  const toggleFunded = (name: string) => {
    setFundedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const myProjects = scans.map((s) => s.report);
  const totalProjects = (stats?.totalProjects ?? 0) + myProjects.filter((p) => !stats?.trending.some((t) => t.projectName === p.projectName)).length;
  const fundedCount = fundedProjects.size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="space-y-5"
    >
      {/* Stats row */}
      <div className="grid grid-cols-4 border border-foreground/15 rounded-xl overflow-hidden">
        {[
          { label: "MY PROJECTS", value: String(myProjects.length) },
          { label: "TOTAL PROJECTS", value: String(totalProjects) },
          { label: "PUBLISHED", value: String(stats?.totalPublished ?? 0), color: "#06b6d4" },
          { label: "FUNDED", value: String(fundedCount), color: fundedCount > 0 ? "#22c55e" : undefined },
        ].map((stat, i) => (
          <div key={stat.label} className={`px-4 py-3 ${i < 3 ? "border-r border-foreground/15" : ""}`}>
            <span className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground font-mono block">
              {stat.label}
            </span>
            <span
              className="text-lg font-mono font-bold"
              style={{ color: stat.color, fontVariantNumeric: "tabular-nums" }}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: My Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
              MY PROJECTS
            </span>
            <button
              onClick={onNewScan}
              className="text-[10px] font-mono tracking-[0.15em] uppercase text-[#06b6d4] hover:text-[#06b6d4]/80 transition-colors cursor-pointer"
            >
              + NEW SCAN
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div className="border border-foreground/15 rounded-xl px-8 py-12 text-center">
              <span className="text-[12px] font-mono text-muted-foreground/50 block mb-4">
                No projects scanned yet
              </span>
              <button
                onClick={onNewScan}
                className="text-[11px] font-mono tracking-[0.15em] uppercase border border-foreground/20 rounded-lg px-5 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
              >
                $ scan project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myProjects.map((report, i) => {
                const isFunded = fundedProjects.has(report.projectName);
                const color = getScoreColor(report.integrityScore);
                return (
                  <motion.div
                    key={`${report.projectName}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                    className="border border-foreground/15 rounded-xl overflow-hidden hover:bg-foreground/[0.03] transition-colors"
                  >
                    {/* Card header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/10">
                      <img
                        src={avatarUrl(report.projectName)}
                        alt={report.projectName}
                        className="w-8 h-8 rounded-lg opacity-70 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-mono font-bold tracking-wider uppercase block truncate">
                          {report.projectName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/40">
                          {Object.keys(report.layerScores).filter((k) => (report.layerScores[k] ?? 0) >= 0).length} layers analyzed
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFunded(report.projectName); }}
                        className={`text-[9px] font-mono font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                          isFunded
                            ? "bg-[#22c55e]/10 border-[#22c55e]/40 text-[#22c55e]"
                            : "border-foreground/15 text-muted-foreground/40 hover:border-foreground/30"
                        }`}
                      >
                        {isFunded ? "FUNDED" : "FUND"}
                      </button>
                    </div>

                    {/* Card body */}
                    <button
                      onClick={() => onSelectReport(report)}
                      className="w-full text-left px-4 py-3 cursor-pointer"
                    >
                      <p className="text-[11px] font-mono text-muted-foreground/60 leading-relaxed line-clamp-2 mb-3">
                        {report.executiveSummary}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                          {Object.entries(report.layerScores).map(([layer, score]) => {
                            const available = score >= 0;
                            return (
                              <div key={layer} className="flex items-center gap-1">
                                <span className="text-[9px] font-mono text-muted-foreground/30 uppercase">
                                  {layer.slice(0, 3)}
                                </span>
                                {available ? (
                                  <span
                                    className="text-[10px] font-mono font-bold"
                                    style={{ color: getScoreColor(score), fontVariantNumeric: "tabular-nums" }}
                                  >
                                    {score}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono text-muted-foreground/25">N/A</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <span
                          className="text-[10px] font-mono font-bold tracking-[0.12em]"
                          style={{ color }}
                        >
                          {getVerdict(report.integrityScore)}
                        </span>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Compare action */}
          {onCompare && myProjects.length >= 2 && (
            <button
              onClick={onCompare}
              className="text-[10px] font-mono tracking-[0.15em] uppercase border border-foreground/15 rounded-lg px-4 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
            >
              compare projects
            </button>
          )}
        </div>

        {/* Right: Trending / Published */}
        <div className="space-y-4">
          <div className="border border-foreground/15 rounded-xl">
            <div className="border-b border-foreground/10 px-4 py-2">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                TRENDING PROJECTS
              </span>
            </div>
            <div className="divide-y divide-foreground/10">
              {(!stats || stats.trending.length === 0) ? (
                <div className="px-4 py-8 text-center">
                  <span className="text-[11px] font-mono text-muted-foreground/40">
                    No published projects yet
                  </span>
                </div>
              ) : (
                stats.trending.map((t, i) => {
                  const color = getScoreColor(t.integrityScore);
                  return (
                    <motion.button
                      key={`${t.projectName}-${i}`}
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25, ease: EASE }}
                      onClick={() => onSelectReport(t.report)}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-foreground/[0.03] transition-colors cursor-pointer"
                    >
                      <img
                        src={avatarUrl(t.projectName)}
                        alt={t.projectName}
                        className="w-7 h-7 rounded-md opacity-60 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[12px] font-mono font-bold tracking-wider uppercase block truncate">
                          {t.projectName}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground/40 tracking-wider uppercase">
                          {t.verdict}
                        </span>
                      </div>
                      <span
                        className="text-[13px] font-mono font-bold shrink-0"
                        style={{ color, fontVariantNumeric: "tabular-nums" }}
                      >
                        {t.integrityScore}
                      </span>
                    </motion.button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="border border-foreground/15 rounded-xl">
            <div className="border-b border-foreground/10 px-4 py-2">
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
                QUICK ACTIONS
              </span>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={onNewScan}
                className="w-full text-[11px] font-mono tracking-[0.15em] uppercase border border-foreground/20 rounded-lg px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer text-left"
              >
                + new scan
              </button>
              {onCompare && myProjects.length >= 2 && (
                <button
                  onClick={onCompare}
                  className="w-full text-[11px] font-mono tracking-[0.15em] uppercase border border-foreground/20 rounded-lg px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer text-left"
                >
                  compare projects
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
