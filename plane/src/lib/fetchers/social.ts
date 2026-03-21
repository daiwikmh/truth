import type { SocialData } from "../sample-data";

const TWITTER_BEARER = process.env.TWITTER_BEARER_TOKEN ?? "";
const DUNE_API_KEY = process.env.DUNE_API_KEY ?? "";

// ── Dune (primary) ──────────────────────────────────────

interface DuneRow {
  unique_traders: number;
  total_trades: number;
  total_volume: number;
  buy_volume: number;
  sell_volume: number;
  top5_pct: number;
}

async function duneExecute(sql: string): Promise<DuneRow[]> {
  const exec = await fetch("https://api.dune.com/api/v1/sql/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Dune-Api-Key": DUNE_API_KEY,
    },
    body: JSON.stringify({ sql, performance: "medium" }),
    signal: AbortSignal.timeout(15000),
  });
  const { execution_id } = await exec.json();
  if (!execution_id) throw new Error("Dune: no execution_id");

  // Poll for results (max ~45s)
  const url = `https://api.dune.com/api/v1/execution/${execution_id}/results`;
  for (let i = 0; i < 9; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(url, {
      headers: { "X-Dune-Api-Key": DUNE_API_KEY },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    if (data.is_execution_finished) {
      if (data.state !== "QUERY_STATE_COMPLETED") throw new Error(`Dune: ${data.state}`);
      return data.result?.rows ?? [];
    }
  }
  throw new Error("Dune: query timed out");
}

function buildDuneQuery(tokenAddress: string): string {
  const addr = tokenAddress.toLowerCase();
  return `
    WITH trades AS (
      SELECT tx_from, amount_usd,
        CASE WHEN token_bought_address = ${addr} THEN 'buy' ELSE 'sell' END as side
      FROM dex.trades
      WHERE (token_bought_address = ${addr} OR token_sold_address = ${addr})
        AND block_time > now() - interval '30' day
        AND amount_usd > 0
    ),
    trader_vol AS (
      SELECT tx_from, SUM(amount_usd) as vol FROM trades GROUP BY 1
    )
    SELECT
      COUNT(DISTINCT t.tx_from) as unique_traders,
      COUNT(*) as total_trades,
      SUM(t.amount_usd) as total_volume,
      SUM(CASE WHEN t.side = 'buy' THEN t.amount_usd ELSE 0 END) as buy_volume,
      SUM(CASE WHEN t.side = 'sell' THEN t.amount_usd ELSE 0 END) as sell_volume,
      (SELECT SUM(vol) FROM (SELECT vol FROM trader_vol ORDER BY vol DESC LIMIT 5) x)
        / NULLIF(SUM(t.amount_usd), 0) as top5_pct
    FROM trades t`;
}

function duneToSocial(row: DuneRow): SocialData {
  // Buy/sell ratio as sentiment proxy (>1 = bullish, <1 = bearish)
  const buyRatio = row.total_volume > 0 ? row.buy_volume / row.total_volume : 0.5;
  const sentimentScore = Math.round(buyRatio * 100) / 100;

  // Top-5 trader concentration as bot/manipulation proxy
  const whalePercent = Math.round((row.top5_pct ?? 0) * 1000) / 10;

  // Build mention-like signals from the data
  const mentions: SocialData["recentMentions"] = [];
  const complaints: string[] = [];

  if (buyRatio < 0.45) {
    mentions.push({ text: `Sell pressure dominates: ${Math.round((1 - buyRatio) * 100)}% of volume is sells`, sentiment: "negative" });
    complaints.push(`Net sell pressure: $${Math.round(row.sell_volume - row.buy_volume).toLocaleString()} more sold than bought in 30d`);
  } else if (buyRatio > 0.55) {
    mentions.push({ text: `Buy pressure strong: ${Math.round(buyRatio * 100)}% of volume is buys`, sentiment: "positive" });
  } else {
    mentions.push({ text: `Balanced trading: ${Math.round(buyRatio * 100)}% buys vs ${Math.round((1 - buyRatio) * 100)}% sells`, sentiment: "neutral" });
  }

  if (whalePercent > 50) {
    mentions.push({ text: `Top 5 traders control ${whalePercent}% of volume`, sentiment: "negative" });
    complaints.push(`Whale concentration: top 5 wallets account for ${whalePercent}% of DEX volume`);
  }

  if (row.unique_traders < 100) {
    mentions.push({ text: `Low community participation: only ${row.unique_traders} unique traders in 30d`, sentiment: "negative" });
    complaints.push(`Only ${row.unique_traders} unique DEX traders in the past 30 days`);
  } else if (row.unique_traders > 1000) {
    mentions.push({ text: `Active community: ${row.unique_traders.toLocaleString()} unique traders in 30d`, sentiment: "positive" });
  }

  const avgTradeSize = row.total_trades > 0 ? row.total_volume / row.total_trades : 0;
  if (avgTradeSize > 50000) {
    mentions.push({ text: `High avg trade size ($${Math.round(avgTradeSize).toLocaleString()}) suggests institutional/whale activity`, sentiment: "neutral" });
  }

  return {
    twitterFollowers: row.unique_traders,
    avgEngagementRate: Math.round((row.total_trades / Math.max(row.unique_traders, 1)) * 100) / 100,
    sentimentScore,
    recentMentions: mentions,
    botLikelihoodPercent: whalePercent > 60 ? Math.min(whalePercent, 100) : Math.round(whalePercent / 2),
    communityComplaints: complaints,
  };
}

// ── Twitter (fallback, requires paid tier) ──────────────

async function twitterGet(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`https://api.x.com/2${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TWITTER_BEARER}` },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Twitter API ${res.status}: ${endpoint}`);
  return res.json();
}

function scoreSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const pos = ["great", "love", "amazing", "best", "bullish", "impressed", "incredible", "solid", "good", "nice"];
  const neg = ["scam", "rug", "dump", "broken", "worst", "trash", "fraud", "slow", "hack", "dead", "complaint", "bug", "exploit", "risk", "concern"];
  const pHits = pos.filter((w) => lower.includes(w)).length;
  const nHits = neg.filter((w) => lower.includes(w)).length;
  if (nHits > pHits) return "negative";
  if (pHits > nHits) return "positive";
  return "neutral";
}

async function fetchFromTwitter(handle: string): Promise<SocialData> {
  const searchData = await twitterGet("/tweets/search/recent", {
    query: `${handle} -is:retweet lang:en`,
    max_results: "100",
    "tweet.fields": "public_metrics,author_id,text",
  });

  const tweets: {
    text: string;
    author_id?: string;
    public_metrics?: { like_count: number; retweet_count: number; reply_count: number; impression_count?: number };
  }[] = searchData?.data ?? [];

  if (tweets.length === 0) return emptySocial();

  let totalEngagement = 0;
  let totalImpressions = 0;
  const mentions: SocialData["recentMentions"] = [];
  const complaints: string[] = [];

  for (const t of tweets) {
    const pm = t.public_metrics;
    if (pm) {
      totalEngagement += pm.like_count + pm.retweet_count + pm.reply_count;
      totalImpressions += pm.impression_count ?? 0;
    }
    const sent = scoreSentiment(t.text);
    mentions.push({ text: t.text.slice(0, 200), sentiment: sent });
    if (sent === "negative") complaints.push(t.text.slice(0, 200));
  }

  const engagementRate = totalImpressions > 0
    ? Math.round((totalEngagement / totalImpressions) * 10000) / 100
    : Math.round((totalEngagement / tweets.length) * 100) / 100;

  const negCount = mentions.filter((m) => m.sentiment === "negative").length;
  const sentimentScore = Math.round((1 - negCount / mentions.length) * 100) / 100;
  const uniqueAuthors = new Set(tweets.map((t) => t.author_id).filter(Boolean));

  return {
    twitterFollowers: uniqueAuthors.size,
    avgEngagementRate: engagementRate,
    sentimentScore,
    recentMentions: mentions.slice(0, 10),
    botLikelihoodPercent: 0,
    communityComplaints: complaints.slice(0, 10),
  };
}

// ── Public API ──────────────────────────────────────────

export async function fetchSocialData(
  handle: string,
  tokenAddress?: string
): Promise<SocialData> {
  // Primary: Dune on-chain social metrics (needs token address)
  if (DUNE_API_KEY && tokenAddress) {
    try {
      const rows = await duneExecute(buildDuneQuery(tokenAddress));
      if (rows.length > 0) {
        console.log("[SOCIAL] Dune data fetched");
        return duneToSocial(rows[0]);
      }
    } catch (err) {
      console.error("[SOCIAL] Dune failed:", err);
    }
  }

  // Fallback: Twitter API (requires paid tier)
  if (TWITTER_BEARER) {
    try {
      console.log("[SOCIAL] Falling back to Twitter");
      return await fetchFromTwitter(handle.replace("@", ""));
    } catch (err) {
      console.error("[SOCIAL] Twitter failed:", err);
    }
  }

  return emptySocial();
}

function emptySocial(): SocialData {
  return {
    twitterFollowers: 0,
    avgEngagementRate: 0,
    sentimentScore: 0.5,
    recentMentions: [],
    botLikelihoodPercent: 0,
    communityComplaints: [],
  };
}
