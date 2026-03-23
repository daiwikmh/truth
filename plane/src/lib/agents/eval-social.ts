import { llmCall, parseJSON } from "../ai";
import type { LayerAnalysis } from "../schemas";
import type { SocialData } from "../sample-data";
import type { EvalAgentConfig } from "./registry";

async function analyzeSocial(data: SocialData): Promise<LayerAnalysis> {
  const system = `You are a community sentiment analyst evaluating DePIN/public goods projects. Your role is to objectively assess community health and flag suspicious patterns like bot farms, astroturfing, censored criticism, or manufactured engagement. Do NOT make funding recommendations — just report what the data shows. Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

CRITICAL RULES:
- If all metrics are zero or empty, it means we could NOT fetch social data for this project. This is a data availability issue, NOT evidence of no community.
- When data is unavailable, score should be 50 (neutral/unknown) and signals should indicate "insufficient data" with LOW confidence. Do NOT penalize a project for missing data.
- Only draw negative conclusions from data that is actually present and clearly negative.
- Well-known protocols (Aave, Uniswap, Compound, etc.) have massive communities. Zero metrics for these projects means our data pipeline failed, not that they have no community.`;

  // Insufficient data: skip LLM call, mark as unavailable (-1)
  // Return -1 if: no followers AND (no mentions OR no engagement) — indicates data fetch failure
  const hasFollowers = data.twitterFollowers > 0;
  const hasMentions = data.recentMentions && data.recentMentions.length > 0;
  const hasEngagement = data.avgEngagementRate > 0;
  const noData = !hasFollowers && (!hasMentions || !hasEngagement);

  if (noData) {
    return {
      layer: "social",
      score: -1,
      summary: "Social data unavailable. No meaningful metrics could be fetched for this project. This layer is excluded from the final integrity score.",
      signals: [{ text: "Insufficient social data from Dune or Twitter API — this layer cannot be scored and is excluded from integrity calculation", severity: "low", source: "data-pipeline", confidence: 0.1 }],
    };
  }

  const prompt = `Analyze this social data and return a JSON object:

- Followers: ${data.twitterFollowers}, engagement: ${data.avgEngagementRate}%
- Sentiment: ${data.sentimentScore}/1.0
- Bot likelihood: ${data.botLikelihoodPercent}%
- Complaints: ${data.communityComplaints.map((c) => `"${c}"`).join(", ") || "none"}
- Recent mentions: ${data.recentMentions.map((m) => `[${m.sentiment}] "${m.text}"`).join(" | ") || "none available"}

Focus on disconnect between official messaging and user experience.

Return this exact JSON structure:
{"layer":"social","score":<0-100>,"summary":"<one paragraph>","signals":[{"text":"<signal>","severity":"low|medium|high|critical","source":"<source>","confidence":<0-1>}]}

Produce 4-8 signals. Score 0-100 where 100 is perfectly healthy.`;

  const raw = await llmCall(system, prompt);
  return parseJSON<LayerAnalysis>(raw);
}

export const config: EvalAgentConfig = {
  id: "eval-social",
  wave: "eval",
  layer: "social",
  dataInputs: ["data-social"],
  async run(data) {
    return analyzeSocial(data["data-social"] as SocialData);
  },
};
