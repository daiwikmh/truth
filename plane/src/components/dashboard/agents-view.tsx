"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";

const AGENTS = {
  data: [
    { id: "data-onchain", requires: ["tokenAddress", "chain", "contracts"] },
    { id: "data-github", requires: ["githubUrl"] },
    { id: "data-social", requires: ["twitterHandle", "tokenAddress"] },
    { id: "data-governance", requires: ["governanceSpace"] },
  ],
  eval: [
    { id: "eval-onchain", layer: "onchain", dataInputs: ["data-onchain"] },
    { id: "eval-development", layer: "development", dataInputs: ["data-github"] },
    { id: "eval-social", layer: "social", dataInputs: ["data-social"] },
    { id: "eval-governance", layer: "governance", dataInputs: ["data-governance"] },
  ],
  synth: [
    { id: "synth-integrity", consumes: "all eval outputs" },
  ],
};

const WAVES = [
  { key: "data" as const, label: "WAVE 1: DATA FETCHERS", color: "#3b82f6", count: 4 },
  { key: "eval" as const, label: "WAVE 2: EVAL AGENTS", color: "#ea580c", count: 4 },
  { key: "synth" as const, label: "WAVE 3: SYNTHESIS", color: "#22c55e", count: 1 },
];

export function AgentsView() {
  return (
    <motion.div
      className="flex-1 p-6 space-y-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          AGENT REGISTRY
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          9 agents / 3 waves / Promise.allSettled
        </span>
      </div>

      {WAVES.map((wave, wi) => (
        <div key={wave.key}>
          {/* wave header */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-1 h-4"
              style={{ backgroundColor: wave.color }}
            />
            <span className="text-[9px] tracking-[0.2em] uppercase font-mono font-bold">
              {wave.label}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground/50">
              {wave.count} agent{wave.count > 1 ? "s" : ""}
            </span>
          </div>

          {/* agent cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
            {AGENTS[wave.key].map((agent, i) => (
              <motion.div
                key={agent.id}
                className="border border-foreground/15 rounded-xl p-3 space-y-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: wi * 0.1 + i * 0.06,
                  ease: EASE,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: wave.color }}
                  />
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                    {agent.id}
                  </span>
                </div>

                {"layer" in agent && (
                  <div className="flex gap-2">
                    <span className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground/60 font-mono">
                      LAYER
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {agent.layer}
                    </span>
                  </div>
                )}

                {"requires" in agent && (
                  <div className="flex flex-wrap gap-1">
                    {agent.requires.map((r) => (
                      <span
                        key={r}
                        className="text-[8px] font-mono border border-foreground/10 rounded-md px-1.5 py-0.5 text-muted-foreground/60"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {"dataInputs" in agent && (
                  <div className="flex flex-wrap gap-1">
                    {agent.dataInputs.map((d) => (
                      <span
                        key={d}
                        className="text-[8px] font-mono border border-foreground/10 rounded-md px-1.5 py-0.5 text-muted-foreground/60"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {"consumes" in agent && (
                  <span className="text-[8px] font-mono text-muted-foreground/60">
                    {agent.consumes}
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* flow connector */}
          {wi < WAVES.length - 1 && (
            <div className="flex justify-center py-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-4 border-l-2 border-dashed border-foreground/15" />
                <span className="text-[8px] font-mono text-muted-foreground/30">
                  v
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}
