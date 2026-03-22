"use client";

import { motion } from "framer-motion";
import { EASE } from "@/src/config/constants";
import { Shield, Check } from "lucide-react";

export function EigencomputeSection() {
  return (
    <section className="w-full px-6 py-20 lg:px-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-center gap-4 mb-8"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          {"// SECTION: VERIFIABLE_EXECUTION"}
        </span>
        <div className="flex-1 border-t border-border" />
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono">
          005
        </span>
      </motion.div>

      <div className="border-2 border-foreground">
        <div className="p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-[#06b6d4]" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#06b6d4] font-mono">
                EigenCompute TEE
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Verifiable Integrity Scoring
            </h2>

            <p className="text-sm lg:text-base text-muted-foreground font-mono leading-relaxed mb-8 max-w-3xl">
              The integrity evaluation system itself runs with cryptographic integrity guarantees inside an EigenLayer Trusted Execution Environment. Every analysis is verifiably produced by the exact code deployed, attested by the TEE, and cannot be manipulated.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
                className="border-2 border-border p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Check size={16} className="text-[#06b6d4] flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-sm text-foreground">Cryptographic Proof</h3>
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  TEE attestation proves the exact Docker image and source code executed your analysis. No hidden modifications possible.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
                className="border-2 border-border p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Check size={16} className="text-[#06b6d4] flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-sm text-foreground">Fallback Safety</h3>
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  If TEE runner is offline, analysis runs locally on Vercel. No evaluation is blocked — the system gracefully degrades.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                className="border-2 border-border p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Check size={16} className="text-[#06b6d4] flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-sm text-foreground">Octant Narrative</h3>
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  For funding decisions, this proves the evaluator is unbiased and tamper-proof. Strong signal for Octant public goods grants.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, ease: EASE }}
                className="border-2 border-border p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Check size={16} className="text-[#06b6d4] flex-shrink-0 mt-0.5" />
                  <h3 className="font-bold text-sm text-foreground">Live Attestation</h3>
                </div>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  Users can verify any report via EigenCompute's public attestation dashboard with a single command.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6, ease: EASE }}
              className="border-t-2 border-border pt-6"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-mono mb-3">
                Architecture
              </p>
              <div className="bg-muted/30 border border-border p-4 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <pre>{`Next.js (Vercel)
    |
    v
Proxy to EIGENCOMPUTE_RUNNER_URL
    |
    v
EigenCompute TEE (Hono server)
    |
    v
runPipeline()
 • data agents (Etherscan, GitHub, Dune, Snapshot)
 • eval agents (LLM scoring per layer)
 • synth agent (integrity report generation)
    |
    v
IntegrityReport (attested by TEE)`}</pre>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
