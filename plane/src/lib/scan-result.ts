import type { IntegrityReport, LayerAnalysis } from "./schemas";

export interface ScanResult {
  report: IntegrityReport & { projectId?: string };
  dataOutputs: Record<string, unknown>;
  evalOutputs: LayerAnalysis[];
}
