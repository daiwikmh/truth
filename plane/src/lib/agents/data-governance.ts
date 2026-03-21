import type { DataAgentConfig } from "./registry";
import { fetchGovernanceData } from "../fetchers/governance";
import { sampleGovernanceData } from "../sample-data";

export const config: DataAgentConfig = {
  id: "data-governance",
  wave: "data",
  requires: ["governanceSpace"],
  async run(project, isDemo) {
    if (isDemo) return sampleGovernanceData;
    if (!project.governanceSpace) return sampleGovernanceData;
    return fetchGovernanceData(project.governanceSpace);
  },
};
