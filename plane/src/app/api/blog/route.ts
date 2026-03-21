import { NextRequest, NextResponse } from "next/server";
import { listBlogPosts, createBlogPost } from "@/src/lib/db/queries";

export async function GET() {
  try {
    const posts = await listBlogPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Blog list error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { report } = await request.json();
    if (!report?.projectName) {
      return NextResponse.json({ error: "Missing report" }, { status: 400 });
    }

    const post = await createBlogPost({
      projectName: report.projectName,
      integrityScore: report.integrityScore,
      verdict: report.verdict,
      summary: report.executiveSummary ?? "",
      report,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Blog create error:", error);
    return NextResponse.json(
      { error: "Failed to publish" },
      { status: 500 }
    );
  }
}
