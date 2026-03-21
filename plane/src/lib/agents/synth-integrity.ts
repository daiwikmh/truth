import { llmCall, parseJSON } from "../ai";
import type { IntegrityReport, LayerAnalysis } from "../schemas";
import type { SynthAgentConfig } from "./registry";

async function synthesize(
  projectName: string,
  layers: LayerAnalysis[]
): Promise<IntegrityReport> {
  // Separate available layers from unavailable ones (score -1)
  const availableLayers = layers.filter((l) => l.score >= 0);
  const unavailableLayers = layers.filter((l) => l.score < 0);

  const allSignals = availableLayers.flatMap((l) =>
    l.signals.map((s) => ({ ...s, layer: l.layer }))
  );

  const layerScores: Record<string, number> = {};
  for (const l of availableLayers) {
    layerScores[l.layer] = l.score;
  }

  const unavailableNote = unavailableLayers.length > 0
    ? `\nUNAVAILABLE LAYERS (excluded from scoring): ${unavailableLayers.map((l) => l.layer).join(", ")}. These layers had no data and must NOT affect the integrity score. Only score based on available layers.\n`
    : "";

  const layerScoreStr = Object.entries(layerScores)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  const raw = await llmCall(
    `You are a synthesis analyst producing a project integrity report. Your role is to objectively evaluate project integrity and call out scam indicators (rug pulls, zombie repos, whale capture, bot farms) — but do NOT tell users to fund or stop funding. Respond ONLY with valid JSON — no markdown, no explanation.

CRITICAL RULES:
- Distinguish between "data shows problems" and "data is unavailable." If a layer scored around 50 due to insufficient data, do NOT treat it as evidence of failure. Weight that layer lower or note the gap is unknown.
- The claimedPerformance vs observedReality gap should reflect ACTUAL observed issues, not data pipeline limitations. If social data was unavailable, the gap for social-related vectors should be small (close to 0) with a note about insufficient data.
- Do NOT catastrophize. A well-known protocol with missing Dune data still exists. Judge based on what you can verify.
- Layers with strong data (e.g. active GitHub, deployed contracts) should carry more weight than layers with missing data.`,
    `Project: "${projectName}"
${unavailableNote}
Signals from available layers:
${JSON.stringify(allSignals)}

Layer summaries:
${availableLayers.map((l) => `[${l.layer}] (score: ${l.score}/100) ${l.summary}`).join("\n")}

Layer scores (only available layers): ${layerScoreStr}

Instructions:
1. Group signals into 3-6 thematic Impact Vectors (each combining signals from multiple layers where possible).
2. For each vector assign weight (weights sum ~1.0), claimedPerformance, and observedReality. The GAP between claimed and observed is the key insight.
3. Compute: IntegrityScore = 100 * (1 - sum(weight * |claimed - observed|)), clamped 0-100.
4. Verdict: "exceptional" (80+), "strong" (60-79), "moderate" (40-59), "critical" (<40).
5. Recommendations must be objective risk observations (e.g. "Token distribution shows rug pull patterns"). Do NOT use funding directives like "halt funding" or "approve investment".

Return this exact JSON:
{"projectName":"${projectName}","integrityScore":<number>,"verdict":"exceptional|strong|moderate|critical","executiveSummary":"<2-3 sentences>","impactVectors":[{"theme":"<name>","summary":"<paragraph>","weight":<0-1>,"claimedPerformance":<0-1>,"observedReality":<0-1>,"signals":[{"text":"<text>","severity":"low|medium|high|critical","source":"<src>","confidence":<0-1>}]}],"layerScores":${JSON.stringify(layerScores)},"recommendations":["<rec1>","<rec2>","<rec3>"]}`
  );

  const report = await parseJSON<IntegrityReport>(raw);

  // Add unavailable layers as -1 so UI can show "N/A"
  for (const l of unavailableLayers) {
    report.layerScores[l.layer] = -1;
  }

  return report;
}

export const config: SynthAgentConfig = {
  id: "synth-integrity",
  wave: "synth",
  async run({ projectName, layers }) {
    return synthesize(projectName, layers);
  },
};
