import { NextResponse } from "next/server";
import { listProjectsWithScores } from "@/src/lib/db/queries";

interface DefiLlamaProtocol {
  name: string;
  slug: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  category: string;
  address: string | null;
  logo: string;
}

export interface ExploreProtocol {
  rank: number;
  name: string;
  slug: string;
  logo: string;
  tvl: number;
  change_1d: number | null;
  change_7d: number | null;
  chains: string[];
  category: string;
  integrityScore: number | null;
  verdict: string | null;
  projectId: string | null;
}

// 5-min server-side cache
let cache: { data: DefiLlamaProtocol[]; ts: number } | null = null;
const TTL = 5 * 60 * 1000;

async function fetchProtocols(): Promise<DefiLlamaProtocol[]> {
  if (cache && Date.now() - cache.ts < TTL) return cache.data;

  const res = await fetch("https://api.llama.fi/protocols", {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`DeFiLlama ${res.status}`);

  const raw = await res.json();
  const data = (raw as Record<string, unknown>[]).map((p) => ({
    name: (p.name as string) ?? "",
    slug: (p.slug as string) ?? "",
    tvl: (p.tvl as number) ?? 0,
    change_1d: (p.change_1d as number) ?? null,
    change_7d: (p.change_7d as number) ?? null,
    chains: (p.chains as string[]) ?? [],
    category: (p.category as string) ?? "",
    address: (p.address as string) ?? null,
    logo: (p.logo as string) ?? "",
  }));

  cache = { data, ts: Date.now() };
  return data;
}

export async function GET() {
  try {
    const [protocols, scored] = await Promise.all([
      fetchProtocols(),
      listProjectsWithScores().catch(() => []),
    ]);

    // build lookup maps from our DB
    const nameMap = new Map<string, (typeof scored)[0]>();
    const addressMap = new Map<string, (typeof scored)[0]>();

    for (const p of scored) {
      nameMap.set(p.name.toLowerCase().trim(), p);
      if (p.tokenAddress) addressMap.set(p.tokenAddress.toLowerCase(), p);
      if (p.contracts) {
        for (const c of p.contracts) {
          if (c.address) addressMap.set(c.address.toLowerCase(), p);
        }
      }
    }

    // merge and rank
    const sorted = protocols
      .filter((p) => p.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl);

    const result: ExploreProtocol[] = sorted.map((p, i) => {
      const match =
        nameMap.get(p.name.toLowerCase().trim()) ||
        (p.address ? addressMap.get(p.address.toLowerCase()) : undefined) ||
        null;

      return {
        rank: i + 1,
        name: p.name,
        slug: p.slug,
        logo: p.logo,
        tvl: p.tvl,
        change_1d: p.change_1d,
        change_7d: p.change_7d,
        chains: p.chains,
        category: p.category,
        integrityScore: match?.integrityScore ?? null,
        verdict: match?.verdict ?? null,
        projectId: match?.id ?? null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Explore API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch protocol data" },
      { status: 500 }
    );
  }
}
