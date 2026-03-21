"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import { getScoreColor } from "@/src/utils/score";
import type { IntegrityReport, ComparisonResult } from "@/src/lib/schemas";

interface Evaluation extends IntegrityReport {
  projectId?: string;
}

interface CompareViewProps {
  evaluations: Evaluation[];
}

export function CompareView({ evaluations }: CompareViewProps) {
  const [idxA, setIdxA] = useState(0);
  const [idxB, setIdxB] = useState(evaluations.length > 1 ? 1 : 0);
  const [scenario, setScenario] = useState("general_integrity");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (evaluations.length < 2) {
    return (
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      >
        <div className="border border-foreground/15 rounded-xl px-8 py-10 text-center max-w-sm">
          <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-3">
            PAIRWISE COMPARISON
          </span>
          <p className="text-[14px] font-mono text-muted-foreground/70 leading-relaxed">
            Evaluate at least 2 projects to unlock comparison.
          </p>
        </div>
      </motion.div>
    );
  }

  async function handleCompare() {
    const a = evaluations[idxA];
    const b = evaluations[idxB];
    if (!a?.projectId || !b?.projectId) {
      setError("Projects missing DB IDs. Re-run analysis.");
      return;
    }
    if (a.projectId === b.projectId) {
      setError("Select two different projects.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/projects/${a.projectId}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponentId: b.projectId,
          scenario,
        }),
      });
      if (!res.ok) throw new Error("Comparison failed");
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="flex-1 p-6 space-y-6 overflow-y-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono block">
        PAIRWISE COMPARISON
      </span>

      {/* selector row */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            PROJECT A
          </label>
          <select
            value={idxA}
            onChange={(e) => setIdxA(Number(e.target.value))}
            className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground"
          >
            {evaluations.map((ev, i) => (
              <option key={i} value={i}>
                {ev.projectName}
              </option>
            ))}
          </select>
        </div>

        <span className="text-[14px] font-mono text-muted-foreground pb-2">
          vs
        </span>

        <div className="space-y-1">
          <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            PROJECT B
          </label>
          <select
            value={idxB}
            onChange={(e) => setIdxB(Number(e.target.value))}
            className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground"
          >
            {evaluations.map((ev, i) => (
              <option key={i} value={i}>
                {ev.projectName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
            SCENARIO
          </label>
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="block border border-foreground/20 rounded-lg bg-background text-[14px] font-mono px-3 py-2 focus:outline-none focus:border-foreground w-48"
          />
        </div>

        <button
          onClick={handleCompare}
          disabled={loading}
          className="border border-foreground/20 rounded-lg px-5 py-2 text-[12px] tracking-[0.2em] uppercase font-mono hover:bg-foreground hover:text-background transition-colors disabled:opacity-40"
        >
          {loading ? "COMPARING..." : "COMPARE"}
        </button>
      </div>

      {error && (
        <p className="text-[14px] font-mono text-red-500">{error}</p>
      )}

      {/* results */}
      {result && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* winner banner */}
          <div className="border border-foreground/15 rounded-xl p-5">
            <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono block mb-2">
              WINNER
            </span>
            <div className="flex items-baseline gap-4">
              <span className="text-lg font-mono font-bold tracking-wider">
                {result.winnerName ?? "TIE"}
              </span>
              <div className="flex gap-3 text-[14px] font-mono">
                <span style={{ color: getScoreColor(result.scoreA) }}>
                  {evaluations[idxA]?.projectName}: {result.scoreA}
                </span>
                <span className="text-muted-foreground">/</span>
                <span style={{ color: getScoreColor(result.scoreB) }}>
                  {evaluations[idxB]?.projectName}: {result.scoreB}
                </span>
              </div>
            </div>
            <p className="text-[14px] font-mono text-muted-foreground/80 mt-3 leading-relaxed">
              {result.reasoning}
            </p>
          </div>

          {/* score bars */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: evaluations[idxA]?.projectName, score: result.scoreA },
              { label: evaluations[idxB]?.projectName, score: result.scoreB },
            ].map((s) => (
              <div key={s.label} className="border border-foreground/10 rounded-xl p-3">
                <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  {s.label}
                </span>
                <div className="mt-2 h-2 bg-foreground/10 relative">
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    style={{ backgroundColor: getScoreColor(s.score) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </div>
                <span
                  className="text-[14px] font-mono font-bold mt-1 block"
                  style={{ color: getScoreColor(s.score) }}
                >
                  {s.score}
                </span>
              </div>
            ))}
          </div>

          {/* dimensions */}
          {result.dimensions?.length > 0 && (
            <div className="border border-foreground/10 rounded-xl">
              <div className="border-b-2 border-foreground/10 px-4 py-2 grid grid-cols-[1fr_60px_60px_2fr] gap-2">
                <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  DIMENSION
                </span>
                <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono text-center">
                  A
                </span>
                <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono text-center">
                  B
                </span>
                <span className="text-[14px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                  INSIGHT
                </span>
              </div>
              {result.dimensions.map((dim, i) => (
                <motion.div
                  key={dim.name}
                  className="border-b border-foreground/5 px-4 py-2.5 grid grid-cols-[1fr_60px_60px_2fr] gap-2 items-center"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06, ease: EASE }}
                >
                  <span className="text-[12px] font-mono font-bold tracking-wider uppercase">
                    {dim.name}
                  </span>
                  <span
                    className="text-[14px] font-mono text-center font-bold"
                    style={{ color: getScoreColor(dim.scoreA) }}
                  >
                    {dim.scoreA}
                  </span>
                  <span
                    className="text-[14px] font-mono text-center font-bold"
                    style={{ color: getScoreColor(dim.scoreB) }}
                  >
                    {dim.scoreB}
                  </span>
                  <span className="text-[12px] font-mono text-muted-foreground/70">
                    {dim.insight}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
