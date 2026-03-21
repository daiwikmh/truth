import type { LayerAnalysis, IntegrityReport } from "../schemas";
import type { ContractEntry } from "../sample-data";

// Project fields available to data agents
export interface ProjectFields {
  name: string;
  tokenAddress?: string | null;
  chain?: string | null;
  contracts?: ContractEntry[];
  githubUrl?: string | null;
  twitterHandle?: string | null;
  governanceSpace?: string | null;
}

export interface DataAgentConfig {
  id: string;
  wave: "data";
  requires: (keyof ProjectFields)[];
  run: (project: ProjectFields, isDemo: boolean) => Promise<unknown>;
}

export interface EvalAgentConfig {
  id: string;
  wave: "eval";
  layer: string;
  dataInputs: string[];
  run: (data: Record<string, unknown>) => Promise<LayerAnalysis>;
}

export interface SynthAgentConfig {
  id: string;
  wave: "synth";
  run: (ctx: {
    projectName: string;
    layers: LayerAnalysis[];
    dataOutputs: Record<string, unknown>;
  }) => Promise<IntegrityReport>;
}

export type AgentConfig = DataAgentConfig | EvalAgentConfig | SynthAgentConfig;
