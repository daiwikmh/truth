import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
import type { ProjectInput } from "@/src/lib/sample-data";
import { runPipeline } from "@/src/lib/agents/orchestrator";
import { createProject, createEvaluation } from "@/src/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body: ProjectInput & { demo?: boolean } = await request.json();

    const isDemoMode = !process.env.OPENROUTER_API_KEY;
    let report;

    if (isDemoMode) {
      report = getDemoReport(body.projectName);
    } else {
      const result = await runPipeline(
        {
          name: body.projectName,
          tokenAddress: body.tokenAddress,
          chain: body.chain,
          contracts: body.contracts,
          githubUrl: body.githubUrl,
          twitterHandle: body.twitterHandle,
          governanceSpace: body.governanceSpace,
        },
        !!body.demo
      );
      report = result.report;
    }

    // persist to DB for comparison support
    let projectId: string | undefined;
    try {
      const project = await createProject({
        name: body.projectName,
        githubUrl: body.githubUrl,
        tokenAddress: body.tokenAddress,
        chain: body.chain,
        twitterHandle: body.twitterHandle,
        governanceSpace: body.governanceSpace,
      });
      await createEvaluation(project.id, report);
      projectId = project.id;
    } catch (e) {
      console.error("DB persist skipped:", e);
    }

    return NextResponse.json({ ...report, projectId });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Check API keys and try again." },
      { status: 500 }
    );
  }
}

function getDemoReport(projectName: string) {
  return {
    projectName: projectName || "NexusNet (Demo)",
    integrityScore: 34,
    verdict: "critical" as const,
    executiveSummary:
      "NexusNet presents a significant divergence between marketing claims and observable reality. Development activity has stalled, governance is captured by whale wallets, and community sentiment is overwhelmingly negative.",
    impactVectors: [
      {
        theme: "Development Sustainability Crisis",
        summary: "Classic zombie repo pattern -- high stars but near-zero recent commits.",
        weight: 0.25,
        claimedPerformance: 0.85,
        observedReality: 0.15,
        signals: [
          { text: "Only 9 commits in 90 days from single contributor", severity: "critical" as const, source: "GitHub API", confidence: 0.95 },
          { text: "142 open issues with 30-day avg response time", severity: "high" as const, source: "GitHub API", confidence: 0.88 },
        ],
      },
      {
        theme: "Governance Capture",
        summary: "Top 5 voters control 91.3% of votes with 95.8% pass rate at 3.2% turnout.",
        weight: 0.25,
        claimedPerformance: 0.9,
        observedReality: 0.1,
        signals: [
          { text: "Top 5 voters control 91.3% of governance votes", severity: "critical" as const, source: "Snapshot", confidence: 0.96 },
          { text: "Community council proposal was only one to fail", severity: "critical" as const, source: "Snapshot", confidence: 0.93 },
        ],
      },
      {
        theme: "Community Trust Erosion",
        summary: "Sentiment 0.35/1.0 with complaints about latency, token dumping, and censorship.",
        weight: 0.3,
        claimedPerformance: 0.8,
        observedReality: 0.2,
        signals: [
          { text: "API latency 4x worse than claimed", severity: "high" as const, source: "Community", confidence: 0.82 },
          { text: "22% estimated bot followers", severity: "medium" as const, source: "Social analysis", confidence: 0.7 },
        ],
      },
      {
        theme: "Token Concentration Risk",
        summary: "84.7% of supply held by top 10 wallets with low velocity.",
        weight: 0.2,
        claimedPerformance: 0.75,
        observedReality: 0.25,
        signals: [
          { text: "Top 10 holders control 84.7% of token supply", severity: "critical" as const, source: "On-chain", confidence: 0.97 },
        ],
      },
    ],
    layerScores: { onchain: 42, development: 18, social: 28, governance: 15 },
    recommendations: [
      "Development activity shows zombie repo pattern -- 9 commits in 90 days from a single contributor despite 142 open issues.",
      "Governance is effectively captured by 5 whale wallets controlling 91.3% of votes with near-zero community turnout.",
      "Token distribution is highly concentrated (84.7% top 10 wallets) with low velocity -- consistent with insider holding patterns.",
      "Community sentiment is strongly negative (0.35/1.0) with unaddressed complaints about performance and censorship.",
    ],
  };
}
