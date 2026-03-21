import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { OnchainData } from "../sample-data";
import type { EvalAgentConfig } from "./registry";

async function analyzeOnchain(data: OnchainData): Promise<LayerAnalysis> {
  const system = `You are an on-chain data analyst evaluating DePIN/public goods projects. Your role is to objectively assess on-chain health and flag potential scam indicators (rug pull patterns, wash trading, suspicious token distributions). Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.`;

  let contractDetails = "";
  if (data.contracts && data.contracts.length > 1) {
    contractDetails = `\nPer-contract breakdown:\n${data.contracts.map((c) =>
      `- [${c.label}] (${c.address}): ${c.dailyTransactions} tx/day, top10=${c.top10HoldersPercent}%, age=${c.contractAge}d, velocity=${c.tokenVelocity}`
    ).join("\n")}\n`;
  }

  const prompt = `Analyze these on-chain metrics and return a JSON object:

- Token concentration: top 10 holders own ${data.top10HoldersPercent}% of supply
- Network uptime: ${data.uptimePercent}%
- Daily transactions: ${data.dailyTransactions}, velocity: ${data.tokenVelocity}
- Contract age: ${data.contractAge} days
- Holders: ${JSON.stringify(data.tokenHolders)}
${contractDetails}
Return this exact JSON structure:
{"layer":"onchain","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 3-6 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}

export const config: EvalAgentConfig = {
  id: "eval-onchain",
  wave: "eval",
  layer: "onchain",
  dataInputs: ["data-onchain"],
  async run(data) {
    return analyzeOnchain(data["data-onchain"] as OnchainData);
  },
};
