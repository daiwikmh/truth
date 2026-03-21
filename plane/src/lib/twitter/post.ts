import crypto from "crypto";
import type { IntegrityReport } from "../schemas";

const API_KEY = () => process.env.TWITTER_API_KEY ?? "";
const API_SECRET = () => process.env.TWITTER_API_KEY_SECRET ?? "";
const ACCESS_TOKEN = () => process.env.TWITTER_ACCESS_TOKEN ?? "";
const ACCESS_SECRET = () => process.env.TWITTER_ACCESS_TOKEN_SECRET ?? "";

// OAuth 1.0a HMAC-SHA1 signature
function oauthSign(
  method: string,
  url: string,
  params: Record<string, string>
): string {
  const baseString = [
    method.toUpperCase(),
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${encodeURIComponent(params[k])}`)
        .join("&")
    ),
  ].join("&");

  const signingKey = `${encodeURIComponent(API_SECRET())}&${encodeURIComponent(ACCESS_SECRET())}`;
  return crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");
}

function buildAuthHeader(method: string, url: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: API_KEY(),
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: ACCESS_TOKEN(),
    oauth_version: "1.0",
  };

  const signature = oauthSign(method, url, oauthParams);
  oauthParams.oauth_signature = signature;

  const header = Object.keys(oauthParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

async function postTweet(
  text: string,
  replyTo?: string
): Promise<{ id: string }> {
  const url = "https://api.x.com/2/tweets";
  const body: Record<string, unknown> = { text };
  if (replyTo) body.reply = { in_reply_to_tweet_id: replyTo };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader("POST", url),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Twitter POST ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { id: data?.data?.id };
}

// Format report into tweet thread
function formatThread(report: IntegrityReport): string[] {
  const tweets: string[] = [];
  const v = report.verdict.toUpperCase();
  const ls = report.layerScores;

  // Tweet 1: score + layer breakdown
  const layerLine = Object.entries(ls)
    .map(([k, s]) => `${k.slice(0, 3).toUpperCase()} ${s}`)
    .join(" | ");

  tweets.push(
    `INTEGRITY SCAN: ${report.projectName}\n\n` +
    `Score: ${report.integrityScore}/100 [${v}]\n` +
    `${layerLine}\n\n` +
    `${report.executiveSummary.slice(0, 140)}`
  );

  // Tweet 2: top signals
  const signals = report.impactVectors
    .flatMap((iv) => iv.signals)
    .sort((a, b) => {
      const sev = { critical: 4, high: 3, medium: 2, low: 1 };
      return (sev[b.severity] ?? 0) - (sev[a.severity] ?? 0);
    })
    .slice(0, 3);

  if (signals.length > 0) {
    const sigLines = signals
      .map((s) => `[${s.severity.toUpperCase()}] ${s.text.slice(0, 80)}`)
      .join("\n");
    tweets.push(`Top signals:\n\n${sigLines}`);
  }

  // Tweet 3: recommendations
  if (report.recommendations.length > 0) {
    const recs = report.recommendations
      .slice(0, 2)
      .map((r, i) => `${String(i + 1).padStart(2, "0")}. ${r.slice(0, 100)}`)
      .join("\n");
    tweets.push(`Key findings:\n\n${recs}\n\nData: Etherscan, GitHub, Snapshot, Dune`);
  }

  // Trim each tweet to 280 chars
  return tweets.map((t) => (t.length > 280 ? t.slice(0, 277) + "..." : t));
}

export async function postScanResult(
  report: IntegrityReport
): Promise<{ tweetIds: string[] }> {
  if (!API_KEY() || !ACCESS_TOKEN()) {
    console.error("[TWITTER] Missing OAuth 1.0a credentials, skipping post");
    return { tweetIds: [] };
  }

  const thread = formatThread(report);
  const tweetIds: string[] = [];

  let replyTo: string | undefined;
  for (const text of thread) {
    try {
      const { id } = await postTweet(text, replyTo);
      tweetIds.push(id);
      replyTo = id;
    } catch (err) {
      console.error("[TWITTER] Failed to post tweet:", err);
      break;
    }
  }

  return { tweetIds };
}
