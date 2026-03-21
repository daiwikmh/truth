import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    keys: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      etherscan: !!process.env.ETHERSCAN_API_KEY,
      alchemy: !!process.env.ALCHEMY_RPC_URL,
      dune: !!process.env.DUNE_API_KEY,
      github: !!process.env.GITHUB_TOKEN,
    },
    model: process.env.OPENROUTER_MODEL ?? "nvidia/nemotron-3-super-120b-a12b:free",
    database: !!process.env.DATABASE_URL,
    agentCount: 9,
    waves: 3,
  });
}
