import type { DataAgentConfig, EvalAgentConfig, SynthAgentConfig } from "./registry";

import { config as dataOnchain } from "./data-onchain";
import { config as dataGithub } from "./data-github";
import { config as dataSocial } from "./data-social";
import { config as dataGovernance } from "./data-governance";

import { config as evalOnchain } from "./eval-onchain";
import { config as evalDevelopment } from "./eval-development";
import { config as evalSocial } from "./eval-social";
import { config as evalGovernance } from "./eval-governance";

import { config as synthIntegrity } from "./synth-integrity";

export const dataAgents: DataAgentConfig[] = [
  dataOnchain,
  dataGithub,
  dataSocial,
  dataGovernance,
];

export const evalAgents: EvalAgentConfig[] = [
  evalOnchain,
  evalDevelopment,
  evalSocial,
  evalGovernance,
];

export const synthAgents: SynthAgentConfig[] = [
  synthIntegrity,
];
