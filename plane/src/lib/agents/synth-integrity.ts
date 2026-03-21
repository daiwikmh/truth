import { llmCall, parseJSON } from "../ai";
import type { IntegrityReport, LayerAnalysis } from "../schemas";
import type { SynthAgentConfig } from "./registry";

async function synthesize(
  projectName: string,
  layers: LayerAnalysis[]
): Promise<IntegrityReport> {
  const allSignals = layers.flatMap((l) =>
    l.signals.map((s) => ({ ...s, layer: l.layer }))
  );

  const layerScores: Record<string, number> = {};
  for (const l of layers) {
    layerScores[l.layer] = l.score;
  }

  const layerScoreStr = Object.entries(layerScores)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  const raw = await llmCall(
    "You are a synthesis analyst producing a project integrity report. Your role is to objectively evaluate project integrity and call out scam indicators (rug pulls, zombie repos, whale capture, bot farms) — but do NOT tell users to fund or stop funding. Respond ONLY with valid JSON — no markdown, no explanation.",
    `Project: "${projectName}"

Signals from all layers:
${JSON.stringify(allSignals)}

Layer summaries:
${layers.map((l) => `[${l.layer}] (score: ${l.score}/100) ${l.summary}`).join("\n")}

Layer scores: ${layerScoreStr}

Instructions:
1. Group signals into 3-6 thematic Impact Vectors (each combining signals from multiple layers where possible).
2. For each vector assign weight (weights sum ~1.0), claimedPerformance, and observedReality. The GAP between claimed and observed is the key insight.
3. Compute: IntegrityScore = 100 * (1 - sum(weight * |claimed - observed|)), clamped 0-100.
4. Verdict: "strong" (80+), "moderate" (60-79), "weak" (40-59), "critical" (<40).
5. Recommendations must be objective risk observations (e.g. "Token distribution shows rug pull patterns"). Do NOT use funding directives like "halt funding" or "approve investment".

Return this exact JSON:
{"projectName":"${projectName}","integrityScore":<number>,"verdict":"strong|moderate|weak|critical","executiveSummary":"<2-3 sentences>","impactVectors":[{"theme":"<name>","summary":"<paragraph>","weight":<0-1>,"claimedPerformance":<0-1>,"observedReality":<0-1>,"signals":[{"text":"<text>","severity":"low|medium|high|critical","source":"<src>","confidence":<0-1>}]}],"layerScores":${JSON.stringify(layerScores)},"recommendations":["<rec1>","<rec2>","<rec3>"]}`
  );

  return parseJSON<IntegrityReport>(raw);
}

export const config: SynthAgentConfig = {
  id: "synth-integrity",
  wave: "synth",
  async run({ projectName, layers }) {
    return synthesize(projectName, layers);
  },
};
