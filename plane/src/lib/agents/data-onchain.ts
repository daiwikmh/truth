import type { DataAgentConfig } from "./registry";
import { fetchOnchainData } from "../fetchers/onchain";
import { sampleOnchainData } from "../sample-data";
import type { OnchainData, OnchainContractData } from "../sample-data";

function mergeContractData(results: OnchainContractData[]): OnchainData {
  if (results.length === 0) return sampleOnchainData;
  if (results.length === 1) {
    return { ...results[0], contracts: results };
  }

  // Merge: combine holders, sum transactions, use oldest contract age, average velocity
  const allHolders = new Map<string, number>();
  let totalTx = 0;
  let totalVelocity = 0;
  let oldestAge = 0;
  let hasCode = false;

  for (const c of results) {
    for (const h of c.tokenHolders) {
      allHolders.set(h.address, (allHolders.get(h.address) || 0) + h.percentage);
    }
    totalTx += c.dailyTransactions;
    totalVelocity += c.tokenVelocity;
    if (c.contractAge > oldestAge) oldestAge = c.contractAge;
    if (c.uptimePercent > 0) hasCode = true;
  }

  const sortedHolders = [...allHolders.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([address, percentage]) => ({ address, percentage: Math.round(percentage * 10) / 10 }));

  const top10Pct = sortedHolders.reduce((s, h) => s + h.percentage, 0);

  return {
    tokenHolders: sortedHolders,
    top10HoldersPercent: Math.round(top10Pct * 10) / 10,
    uptimePercent: hasCode ? 99.9 : 0,
    dailyTransactions: totalTx,
    tokenVelocity: Math.round((totalVelocity / results.length) * 100) / 100,
    contractAge: oldestAge,
    totalSupply: results[0].totalSupply,
    contracts: results,
  };
}

export const config: DataAgentConfig = {
  id: "data-onchain",
  wave: "data",
  requires: ["tokenAddress"],
  async run(project, isDemo) {
    if (isDemo) return sampleOnchainData;

    const contracts = project.contracts ?? [];

    // Fallback to single tokenAddress if no contracts array
    if (contracts.length === 0 && project.tokenAddress) {
      contracts.push({
        label: "Token",
        address: project.tokenAddress,
        chain: project.chain ?? "ethereum",
      });
    }

    if (contracts.length === 0) return sampleOnchainData;

    const results = await Promise.allSettled(
      contracts.map(async (c) => {
        const data = await fetchOnchainData(c.address, c.chain ?? project.chain ?? "ethereum");
        return { ...data, label: c.label, address: c.address } as OnchainContractData;
      })
    );

    const successful = results
      .filter((r): r is PromiseFulfilledResult<OnchainContractData> => r.status === "fulfilled")
      .map((r) => r.value);

    if (successful.length === 0) return sampleOnchainData;
    return mergeContractData(successful);
  },
};
