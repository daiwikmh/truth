import type { GovernanceData } from "../sample-data";

const SNAPSHOT_GRAPHQL = "https://hub.snapshot.org/graphql";

interface SnapshotProposal {
  id: string;
  title: string;
  state: string;
  scores_total: number;
  quorum: number;
  votes: number;
  created: number;
  end: number;
}

interface SnapshotVote {
  voter: string;
  vp: number;
  created: number;
}

async function snapshotQuery(query: string) {
  const res = await fetch(SNAPSHOT_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(15000),
  });
  return res.json();
}

// Fetch votes for a set of proposals to compute whale concentration
async function fetchVotes(proposalIds: string[]): Promise<SnapshotVote[]> {
  const all: SnapshotVote[] = [];
  for (const pid of proposalIds.slice(0, 10)) {
    const data = await snapshotQuery(`{
      votes(
        where: { proposal: "${pid}" }
        orderBy: "vp"
        orderDirection: desc
        first: 1000
      ) { voter vp created }
    }`);
    const votes: SnapshotVote[] = data?.data?.votes ?? [];
    all.push(...votes);
  }
  return all;
}

export async function fetchGovernanceData(
  space: string
): Promise<GovernanceData> {
  try {
    const data = await snapshotQuery(`{
      proposals(
        where: { space_in: ["${space}"] }
        orderBy: "created"
        orderDirection: desc
        first: 30
      ) { id title state scores_total quorum votes created end }
    }`);

    const proposals: SnapshotProposal[] = data?.data?.proposals ?? [];
    if (proposals.length === 0) return emptyGovernance();

    const passed = proposals.filter((p) => p.state === "closed").length;
    const passRate = (passed / proposals.length) * 100;
    const avgVotes = proposals.reduce((s, p) => s + p.votes, 0) / proposals.length;

    // Time to quorum: estimate from created -> end for closed proposals
    const closed = proposals.filter((p) => p.state === "closed" && p.created && p.end);
    let avgQuorumHours = 0;
    if (closed.length > 0) {
      const totalHours = closed.reduce((s, p) => s + (p.end - p.created) / 3600, 0);
      avgQuorumHours = totalHours / closed.length;
    }

    // Fetch votes to compute top 5 voter concentration
    let top5Percent = 0;
    const recentIds = proposals.slice(0, 10).map((p) => p.id);
    const votes = await fetchVotes(recentIds);

    if (votes.length > 0) {
      const voterPower = new Map<string, number>();
      for (const v of votes) {
        voterPower.set(v.voter, (voterPower.get(v.voter) || 0) + v.vp);
      }
      const sorted = [...voterPower.values()].sort((a, b) => b - a);
      const totalVp = sorted.reduce((s, v) => s + v, 0);
      const top5Vp = sorted.slice(0, 5).reduce((s, v) => s + v, 0);
      top5Percent = totalVp > 0 ? Math.round((top5Vp / totalVp) * 1000) / 10 : 0;
    }

    return {
      totalProposals: proposals.length,
      avgVoterTurnout: Math.round(avgVotes * 100) / 100,
      proposalPassRate: Math.round(passRate * 10) / 10,
      top5VotersPercent: top5Percent,
      avgTimeToQuorumHours: Math.round(avgQuorumHours * 10) / 10,
      recentProposals: proposals.slice(0, 5).map((p) => ({
        title: p.title,
        passed: p.state === "closed",
        turnout: p.votes,
      })),
    };
  } catch {
    return emptyGovernance();
  }
}

function emptyGovernance(): GovernanceData {
  return {
    totalProposals: 0,
    avgVoterTurnout: 0,
    proposalPassRate: 0,
    top5VotersPercent: 0,
    avgTimeToQuorumHours: 0,
    recentProposals: [],
  };
}
