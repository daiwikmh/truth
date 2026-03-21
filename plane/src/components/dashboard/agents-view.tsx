"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import { DataOutputCard } from "./data-output-card";
import { EvalOutputCard } from "./eval-output-card";
import { SynthOutputCard } from "./synth-output-card";
import type { ScanResult } from "@/src/lib/scan-result";

interface AgentsViewProps {
  scans: ScanResult[];
  selectedIndex: number;
  onSelectIndex: (i: number) => void;
}

const DATA_AGENTS = ["data-onchain", "data-github", "data-social", "data-governance"];
const EVAL_LAYERS = ["onchain", "development", "social", "governance"];

const WAVES = [
  { label: "WAVE 1: DATA FETCHERS", color: "#3b82f6", count: 4 },
  { label: "WAVE 2: EVAL AGENTS", color: "#06b6d4", count: 4 },
  { label: "WAVE 3: SYNTHESIS", color: "#22c55e", count: 1 },
];

export function AgentsView({ scans, selectedIndex, onSelectIndex }: AgentsViewProps) {
  if (scans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col items-center justify-center pt-24"
      >
        <div className="border border-foreground/15 rounded-xl px-8 py-10 text-center max-w-sm">
          <span className="text-[13px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
            NO AGENT OUTPUTS
          </span>
          <p className="text-[13px] font-mono text-muted-foreground/70 leading-relaxed">
            Run a scan to inspect agent outputs here.
          </p>
        </div>
      </motion.div>
    );
  }

  const scan = scans[selectedIndex] ?? scans[0];
  const hasData = Object.keys(scan.dataOutputs).length > 0;
  const hasEvals = scan.evalOutputs.length > 0;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Header: scan selector + wave pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            AGENT OUTPUT INSPECTOR
          </span>
          <select
            value={selectedIndex}
            onChange={(e) => onSelectIndex(Number(e.target.value))}
            className="text-[11px] font-mono bg-transparent border border-foreground/15 rounded-lg px-3 py-1.5 text-foreground cursor-pointer"
          >
            {scans.map((s, i) => (
              <option key={i} value={i}>
                {s.report.projectName} ({s.report.integrityScore})
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          {WAVES.map((w) => (
            <span
              key={w.label}
              className="text-[10px] font-mono tracking-wider px-2 py-1 rounded-md border"
              style={{ borderColor: w.color, color: w.color, opacity: 0.7 }}
            >
              {w.count}
            </span>
          ))}
        </div>
      </div>

      {/* Wave 1: Data Fetchers */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-4" style={{ backgroundColor: "#3b82f6" }} />
          <span className="text-[11px] tracking-[0.2em] uppercase font-mono font-bold">
            WAVE 1: DATA FETCHERS
          </span>
        </div>
        {!hasData ? (
          <div className="border border-foreground/15 rounded-xl px-4 py-6 text-center">
            <span className="text-[11px] font-mono text-muted-foreground/40">
              Raw outputs not available for this scan
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DATA_AGENTS.map((agentId, i) => (
              <DataOutputCard
                key={agentId}
                agentId={agentId}
                data={scan.dataOutputs[agentId] ?? null}
                color="#3b82f6"
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-4 border-l-2 border-dashed border-foreground/15" />
          <span className="text-[12px] font-mono text-muted-foreground/30">v</span>
        </div>
      </div>

      {/* Wave 2: Eval Agents */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-4" style={{ backgroundColor: "#06b6d4" }} />
          <span className="text-[11px] tracking-[0.2em] uppercase font-mono font-bold">
            WAVE 2: EVAL AGENTS
          </span>
        </div>
        {!hasEvals ? (
          <div className="border border-foreground/15 rounded-xl px-4 py-6 text-center">
            <span className="text-[11px] font-mono text-muted-foreground/40">
              Eval outputs not available for this scan
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EVAL_LAYERS.map((layer, i) => {
              const evalData = scan.evalOutputs.find((e) => e.layer === layer);
              if (!evalData) return null;
              return (
                <EvalOutputCard
                  key={layer}
                  eval={evalData}
                  color="#06b6d4"
                  index={i}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Connector */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-4 border-l-2 border-dashed border-foreground/15" />
          <span className="text-[12px] font-mono text-muted-foreground/30">v</span>
        </div>
      </div>

      {/* Wave 3: Synthesis */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-4" style={{ backgroundColor: "#22c55e" }} />
          <span className="text-[11px] tracking-[0.2em] uppercase font-mono font-bold">
            WAVE 3: SYNTHESIS
          </span>
        </div>
        {scan.report.impactVectors.length > 0 ? (
          <SynthOutputCard vectors={scan.report.impactVectors} />
        ) : (
          <div className="border border-foreground/15 rounded-xl px-4 py-6 text-center">
            <span className="text-[11px] font-mono text-muted-foreground/40">
              No impact vectors generated
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
