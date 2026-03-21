import type { DataAgentConfig } from "./registry";
import { fetchGithubData } from "../fetchers/github";
import { sampleGithubData } from "../sample-data";

export const config: DataAgentConfig = {
  id: "data-github",
  wave: "data",
  requires: ["githubUrl"],
  async run(project, isDemo) {
    if (isDemo) return { data: sampleGithubData, commits: [] };
    if (!project.githubUrl) return { data: sampleGithubData, commits: [] };
    return fetchGithubData(project.githubUrl);
  },
};
