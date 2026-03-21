import { NextRequest, NextResponse } from "next/server";
import { getProjectById, createEvaluation } from "@/src/lib/db/queries";
import { insertActivityEvents } from "@/src/lib/db/queries";
import { runPipeline } from "@/src/lib/agents/orchestrator";
import { extractActivityEvents } from "@/src/lib/activity/extract";
import type { GovernanceData } from "@/src/lib/sample-data";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const isDemo = body.demo || !process.env.OPENROUTER_API_KEY;

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 503 });
    }

    const { report, dataOutputs } = await runPipeline(
      {
        name: project.name,
        tokenAddress: project.tokenAddress,
        chain: project.chain,
        githubUrl: project.githubUrl,
        twitterHandle: project.twitterHandle,
        governanceSpace: project.governanceSpace,
      },
      isDemo
    );

    // Persist evaluation
    const evaluation = await createEvaluation(id, report);

    // Extract activity events from raw data
    const ghData = dataOutputs["data-github"] as { commits?: { sha: string; message: string; date: string }[] } | undefined;
    const rawCommits = ghData?.commits ?? [];
    const governanceData = (dataOutputs["data-governance"] as GovernanceData) ?? undefined;

    const events = extractActivityEvents({
      projectId: id,
      evaluationId: evaluation.id,
      commits: rawCommits,
      governanceData,
    });

    if (events.length > 0) {
      await insertActivityEvents(events);
    }

    return NextResponse.json({ evaluation, report });
  } catch (error) {
    console.error("Evaluate error:", error);
    return NextResponse.json(
      { error: "Evaluation failed" },
      { status: 500 }
    );
  }
}
