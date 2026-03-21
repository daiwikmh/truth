import type { DataAgentConfig } from "./registry";
import { fetchSocialData } from "../fetchers/social";
import { sampleSocialData } from "../sample-data";

export const config: DataAgentConfig = {
  id: "data-social",
  wave: "data",
  requires: ["twitterHandle"],
  async run(project, isDemo) {
    if (isDemo) return sampleSocialData;
    if (!project.twitterHandle) return sampleSocialData;

    // Pick first contract address for Dune DEX queries
    const tokenAddr = project.contracts?.[0]?.address ?? project.tokenAddress ?? undefined;
    return fetchSocialData(project.twitterHandle, tokenAddr);
  },
};
