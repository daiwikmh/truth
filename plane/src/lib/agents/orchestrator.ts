import type { IntegrityReport, LayerAnalysis } from "../schemas";
import type { ProjectFields } from "./registry";
import { dataAgents, evalAgents, synthAgents } from "./index";

export interface PipelineResult {
  report: IntegrityReport;
  dataOutputs: Record<string, unknown>;
  evalOutputs: LayerAnalysis[];
}

export async function runPipeline(
  project: ProjectFields,
  isDemo: boolean
): Promise<PipelineResult> {
  // Wave 1: data fetchers in parallel
  const dataOutputs: Record<string, unknown> = {};
  const dataResults = await Promise.allSettled(
    dataAgents.map((agent) => agent.run(project, isDemo))
  );

  for (let i = 0; i < dataAgents.length; i++) {
    const r = dataResults[i];
    if (r.status === "fulfilled") {
      dataOutputs[dataAgents[i].id] = r.value;
    } else {
      console.error(`[WAVE1] ${dataAgents[i].id} failed:`, r.reason);
    }
  }

  // Wave 2: eval agents in parallel, each gets only declared inputs
  const evalResults = await Promise.allSettled(
    evalAgents.map((agent) => {
      const inputs: Record<string, unknown> = {};
      for (const dep of agent.dataInputs) {
        if (dataOutputs[dep] !== undefined) inputs[dep] = dataOutputs[dep];
      }
      return agent.run(inputs);
    })
  );

  const evalOutputs: LayerAnalysis[] = [];
  for (let i = 0; i < evalAgents.length; i++) {
    const r = evalResults[i];
    if (r.status === "fulfilled") {
      evalOutputs.push(r.value);
    } else {
      console.error(`[WAVE2] ${evalAgents[i].id} failed:`, r.reason);
    }
  }

  // Wave 3: single synth agent
  const synth = synthAgents[0];
  const report = await synth.run({
    projectName: project.name,
    layers: evalOutputs,
    dataOutputs,
  });

  return { report, dataOutputs, evalOutputs };
}
