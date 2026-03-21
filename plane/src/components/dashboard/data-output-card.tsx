"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";

interface DataOutputCardProps {
  agentId: string;
  data: unknown;
  color: string;
  index: number;
}

function renderValue(val: unknown, depth: number): React.ReactNode {
  if (val === null || val === undefined) return <span className="text-muted-foreground/30">null</span>;
  if (typeof val === "number") return <span className="text-[#06b6d4]">{val.toLocaleString()}</span>;
  if (typeof val === "boolean") return <span className="text-[#a855f7]">{String(val)}</span>;
  if (typeof val === "string") return <span className="text-foreground/70">{val}</span>;

  if (Array.isArray(val)) {
    if (depth >= 2) return <span className="text-muted-foreground/40">[{val.length} items]</span>;
    return (
      <div className="space-y-1 pl-3 border-l border-foreground/10">
        {val.slice(0, 5).map((item, i) => (
          <div key={i}>{renderValue(item, depth + 1)}</div>
        ))}
        {val.length > 5 && (
          <span className="text-[10px] text-muted-foreground/40">+{val.length - 5} more</span>
        )}
      </div>
    );
  }

  if (typeof val === "object") {
    if (depth >= 3) return <span className="text-muted-foreground/40">{"{...}"}</span>;
    return (
      <div className="space-y-1">
        {Object.entries(val as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="flex items-start gap-2">
            <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 tracking-wider uppercase min-w-[80px]">
              {k}
            </span>
            <div className="text-[11px] font-mono">{renderValue(v, depth + 1)}</div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(val)}</span>;
}

export function DataOutputCard({ agentId, data, color, index }: DataOutputCardProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <motion.div
      className="border border-foreground/15 rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: EASE }}
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
            {agentId}
          </span>
        </div>
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-pointer tracking-wider"
        >
          {showRaw ? "PARSED" : "RAW"}
        </button>
      </div>
      <div className="p-4 max-h-[300px] overflow-y-auto">
        {!data ? (
          <span className="text-[11px] font-mono text-muted-foreground/40">No data</span>
        ) : showRaw ? (
          <pre className="text-[10px] font-mono text-muted-foreground/60 whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div className="text-[11px] font-mono">{renderValue(data, 0)}</div>
        )}
      </div>
    </motion.div>
  );
}
