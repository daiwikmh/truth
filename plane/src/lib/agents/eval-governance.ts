import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { GovernanceData } from "../sample-data";
import type { EvalAgentConfig } from "./registry";

async function analyzeGovernance(data: GovernanceData): Promise<LayerAnalysis> {
  const system = `You are a governance analyst evaluating DePIN/public goods projects. Your role is to objectively assess governance health and note concentration patterns. Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

IMPORTANT CONTEXT FOR DeFi GOVERNANCE:
- Token-weighted voting naturally concentrates power among large holders. Top 5 voters controlling 60-90%+ is COMMON in major DeFi protocols (Aave, Uniswap, Compound, MakerDAO). This is a structural feature of token governance, not necessarily malicious.
- Low voter turnout (1-10%) is the NORM in on-chain governance. Most token holders are passive. A 3-5% turnout is typical, not alarming.
- High pass rates (80-95%+) are normal because controversial proposals get discussed off-chain before reaching a vote. Proposals that would fail are usually withdrawn before voting.
- Evaluate governance RELATIVE to DeFi norms: a protocol with active proposals, regular voting, and transparent processes is healthy even if whale-heavy.
- Only flag as critical if there is evidence of actual abuse: proposals that harm users passing with suspiciously low turnout, governance attacks, or complete absence of community voice.
- Score should reflect realistic DeFi governance health. A protocol with regular proposals, some voter participation, and transparent processes deserves 55-75 even with whale concentration.`;

  const prompt = `Analyze this governance data and return a JSON object:

- Total proposals: ${data.totalProposals}
- Pass rate: ${data.proposalPassRate}%, avg turnout: ${data.avgVoterTurnout}%
- Top 5 voters control: ${data.top5VotersPercent}%
- Time to quorum: ${data.avgTimeToQuorumHours}h
- Recent: ${data.recentProposals.map((p) => `"${p.title}" ${p.passed ? "PASSED" : "FAILED"} (${p.turnout}% turnout)`).join(" | ")}

Note concentration patterns but judge them in context of DeFi governance norms.

Return this exact JSON structure:
{"layer":"governance","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 3-6 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}

export const config: EvalAgentConfig = {
  id: "eval-governance",
  wave: "eval",
  layer: "governance",
  dataInputs: ["data-governance"],
  async run(data) {
    return analyzeGovernance(data["data-governance"] as GovernanceData);
  },
};
