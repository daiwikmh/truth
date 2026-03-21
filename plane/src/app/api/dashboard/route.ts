import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/src/lib/db";
import { projects, evaluations, blogPosts } from "@/src/lib/db/schema";

export async function GET() {
  try {
    const [projectCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects);

    const [evalCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(evaluations);

    const [publishedCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(blogPosts);

    // trending = published projects sorted by score desc
    const trending = await db
      .select({
        projectName: blogPosts.projectName,
        integrityScore: blogPosts.integrityScore,
        verdict: blogPosts.verdict,
        summary: blogPosts.summary,
        publishedAt: blogPosts.publishedAt,
        report: blogPosts.report,
      })
      .from(blogPosts)
      .orderBy(sql`${blogPosts.integrityScore} desc`)
      .limit(6);

    return NextResponse.json({
      totalProjects: projectCount?.count ?? 0,
      totalEvaluations: evalCount?.count ?? 0,
      totalPublished: publishedCount?.count ?? 0,
      trending,
    });
  } catch (e) {
    console.error("Dashboard stats error:", e);
    return NextResponse.json({
      totalProjects: 0,
      totalEvaluations: 0,
      totalPublished: 0,
      trending: [],
    });
  }
}
