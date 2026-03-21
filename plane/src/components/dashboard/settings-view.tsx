"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";

interface SettingsData {
  keys: Record<string, boolean>;
  model: string;
  database: boolean;
  agentCount: number;
  waves: number;
}

const KEY_LABELS: Record<string, string> = {
  openrouter: "OPENROUTER",
  etherscan: "ETHERSCAN V2",
  alchemy: "ALCHEMY RPC",
  dune: "DUNE ANALYTICS",
  github: "GITHUB TOKEN",
};

export function SettingsView() {
  const [data, setData] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-[12px] font-mono text-muted-foreground/50 animate-pulse">
          LOADING...
        </span>
      </div>
    );
  }

  const sections = [
    {
      label: "API KEYS",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(data.keys).map(([key, configured]) => (
            <div
              key={key}
              className="flex items-center gap-2 py-1.5"
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  configured ? "bg-green-500" : "bg-red-500/60"
                }`}
              />
              <span className="text-[12px] font-mono tracking-wider uppercase">
                {KEY_LABELS[key] ?? key}
              </span>
              <span className="text-[13px] font-mono text-muted-foreground/50 ml-auto">
                {configured ? "configured" : "not set"}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "MODEL",
      content: (
        <span className="text-[13px] font-mono text-muted-foreground/80 break-all">
          {data.model}
        </span>
      ),
    },
    {
      label: "PIPELINE",
      content: (
        <span className="text-[13px] font-mono text-muted-foreground/80">
          {data.agentCount} agents / {data.waves} waves
        </span>
      ),
    },
    {
      label: "DATABASE",
      content: (
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              data.database ? "bg-green-500" : "bg-red-500/60"
            }`}
          />
          <span className="text-[13px] font-mono text-muted-foreground/80">
            {data.database ? "Neon Postgres connected" : "not configured"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="flex-1 p-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <span className="text-[13px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-6">
        SETTINGS
      </span>

      <div className="max-w-lg space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            className="border border-foreground/15 rounded-xl p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
          >
            <span className="text-[13px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
              {section.label}
            </span>
            {section.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
