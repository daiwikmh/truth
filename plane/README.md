# Integrity Score

A multi-agent AI system that evaluates the real integrity of DePIN and public goods projects by comparing what they claim against what on-chain data, GitHub activity, community sentiment, and governance patterns actually show.

It produces an **Integrity Score** (0-100) using a divergence formula that measures the gap between marketed performance and observable reality. It flags rug pull patterns, zombie repos, governance capture, bot farms, and whale concentration -- without ever recommending funding decisions.

---

## Pipeline

A project evaluation runs through a **3-wave pipeline** where independent agents fetch data, analyze it, and synthesize findings into a single report.

```
                            +---------------------+
                            |   Project Input     |
                            | name, token, github |
                            | twitter, governance |
                            +---------+-----------+
                                      |
          WAVE 1: DATA                |
          (parallel)                  v
    +------+------+------+------+
    |      |      |      |      |
    v      v      v      v      |
 +------+------+------+------+  |
 |data- |data- |data- |data- |  |
 |onchain|github|social|gov   |  |
 +--+---+--+---+--+---+--+---+  |
    |      |      |      |      |
    | Etherscan   | Dune  | Snapshot
    | Alchemy     | GitHub| (Twitter
    |      |      | API   |  fallback)
    v      v      v      v
 +------------------------------+
 |       dataOutputs{}          |
 | keyed by agent ID            |
 +------+-----------+-----------+
        |           |
        | WAVE 2: EVAL (parallel)
        | each agent sees ONLY its
        | declared dataInputs
        v
 +------+------+------+------+
 |eval- |eval- |eval- |eval- |
 |onchain|dev  |social|gov   |
 +--+---+--+---+--+---+--+---+
    |      |      |      |
    v      v      v      v
 +------------------------------+
 |    LayerAnalysis[] outputs   |
 | score 0-100, signals, summary|
 +-------------+----------------+
               |
               | WAVE 3: SYNTH (single)
               v
 +------------------------------+
 |     synth-integrity          |
 | groups signals into vectors  |
 | computes divergence score    |
 | produces verdict + report    |
 +-------------+----------------+
               |
               v
 +------------------------------+
 |      IntegrityReport         |
 | score, verdict, vectors,     |
 | layer scores, recommendations|
 +------------------------------+
```

### The Divergence Formula

```
IntegrityScore = 100 * (1 - SUM(weight * |claimed - observed|))
```

Each Impact Vector carries a `claimedPerformance` (what the project markets) and an `observedReality` (what data shows). The weighted sum of these gaps produces the final score.

| Verdict    | Score Range |
|------------|-------------|
| Strong     | 80-100      |
| Moderate   | 60-79       |
| Weak       | 40-59       |
| Critical   | 0-39        |

---

## Features

### Multi-Layer Real Data Evaluation

Every evaluation pulls live data from four independent sources:

- **On-chain** (Etherscan V2 + Alchemy RPC): token holder concentration, contract age, daily transactions, token velocity, supply verification, uptime detection
- **Development** (GitHub REST API): commit velocity over 90 days, contributor distribution, bus factor, issue response times, zombie repo detection (high stars, no recent commits)
- **Social** (Dune Analytics): 30-day DEX trading activity as a community sentiment proxy -- buy/sell pressure ratio, unique trader count, whale volume concentration, per-trader engagement
- **Governance** (Snapshot GraphQL): proposal pass rates, voter turnout, top-5 voter concentration from actual vote records, quorum timing analysis

### Signal-First Analysis

Agents don't produce opinions. They produce **micro-signals** -- individual findings with text, severity (low/medium/high/critical), data source, and confidence score. The synthesis agent groups these into thematic **Impact Vectors** that measure the gap between what a project claims and what the data shows.

### Scam Detection Patterns

Each eval agent is trained to recognize specific manipulation patterns:

- **Rug pull signals**: extreme token concentration, insider holding patterns, low velocity
- **Zombie repos**: high star count but <10 commits in 90 days, single-contributor dependency
- **Governance theater**: 95%+ pass rate with <5% turnout, whale capture, rubber-stamping
- **Bot farms**: zero-engagement mention patterns, suspicious follower-to-engagement ratios
- **Astroturfing**: disconnect between official messaging and actual user complaints

### Graceful Degradation

The pipeline uses `Promise.allSettled` at every wave. If a fetcher fails (API down, rate limited, no credentials), the pipeline continues with available data. If an eval agent errors, it's logged and skipped. A 2-layer evaluation is better than no evaluation.

### Pairwise Comparison

Beyond individual scoring, two projects can be compared head-to-head with a scenario context (e.g. "DePIN infrastructure funding"). The comparison agent scores both across multiple dimensions and produces a winner with reasoning.

### Activity Timeline

Evaluations extract activity events from raw data -- individual commits from GitHub, governance proposals from Snapshot -- and persist them as a timeline for tracking project health over time.

### Demo Mode

Every endpoint supports `{ "demo": true }` which runs the full pipeline against a pre-built dataset (NexusNet -- an intentionally problematic project with zombie repo, governance capture, and whale concentration). Useful for testing and presentations without burning API credits.

### Extensible Agent System

Adding a new evaluation layer means creating one file and adding one import line. The orchestrator discovers it automatically. No route changes, no schema migrations, no pipeline rewiring.

---

## Inspired by Octant Council Builder

The 3-wave pipeline architecture is adapted from [Octant's council-builder](https://github.com/golemfoundation/octant-council-builder), a Claude Code plugin for generating multi-agent evaluation councils.

Council-builder introduced the pattern of convention-based agent discovery via filename prefixes (`data-*`, `eval-*`, `synth-*`) with strict wave isolation -- eval agents cannot see each other's outputs, preventing cascade bias where one agent's conclusion influences another.

**What we kept:**
- 3-wave execution model (data -> eval -> synth)
- Filename-prefix conventions for agent registration
- Eval agents declare their `dataInputs` and receive nothing else
- `Promise.allSettled` per wave so one failure doesn't kill the pipeline
- Single barrel file as the registration point

**What we changed:**
- Council-builder runs as a dev-time CLI tool with markdown agent configs. Integrity Score runs the same pattern at **runtime** inside Next.js, backed by OpenRouter LLMs, real API data sources, and Neon Postgres persistence.
- Agents are typed TypeScript modules, not markdown templates
- Data agents wrap live API fetchers (Etherscan, GitHub, Dune, Snapshot)
- Results persist to Postgres with full evaluation history
- Adding an agent = one file + one import (no CLI scaffolding needed)

---

## Social Layer via Dune Analytics

Twitter's free API tier is insufficient for meaningful social analysis. Instead, the social layer uses **on-chain trading behavior** as a community sentiment proxy via Dune's SQL API.

A parameterized query analyzes 30 days of DEX activity for the project's token:

- **Sentiment**: buy volume / total volume ratio (>0.5 = net bullish, <0.5 = net bearish)
- **Community size**: unique trader count across all DEX pairs
- **Whale manipulation signal**: top-5 trader volume concentration percentage
- **Engagement**: average trades per unique trader

Twitter v2 API code is retained as fallback and activates automatically when Dune is unavailable or no token address is provided.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | Bun |
| Database | Neon Postgres (serverless) + Drizzle ORM |
| LLM | OpenRouter (nvidia/nemotron-3-super-120b-a12b:free) |
| On-chain | Etherscan V2 API, Alchemy RPC |
| Social | Dune Analytics SQL API, Twitter v2 (fallback) |
| Governance | Snapshot GraphQL |
| Validation | Zod |
| UI | Tailwind CSS 4, Framer Motion |

---

## Design Principles

- **Signal-first, not opinion-first**: agents produce micro-signals (text, severity, source, confidence), never conclusions. The synthesis layer groups signals into impact vectors. No agent makes funding recommendations -- they only report what the data shows.
- **Divergence over scoring**: the interesting output is not "72/100" but the gap between what a project claims and what data shows. A project with honest modest claims can score higher than one with inflated marketing and good fundamentals.
- **Independence by contract**: eval agents declare their data inputs and receive nothing else. They cannot see peer agent outputs. This prevents cascade bias where one agent's negative finding poisons another agent's assessment of unrelated data.
- **Graceful degradation**: if a fetcher fails, the pipeline continues with available data. Failed agents log and skip. Partial evaluations are better than no evaluation. The system never blocks on a single point of failure.
- **Convention over configuration**: adding a new evaluation layer is one file and one import line. The orchestrator discovers agents by convention, not by hardcoded wiring. No route changes, no schema migrations.

---

## Environment Variables

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_API_KEY_2=sk-or-v1-...     # optional, round-robin pool
DATABASE_URL=postgresql://...
ETHERSCAN_API_KEY=...
ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/...
DUNE_API_KEY=...
TWITTER_BEARER_TOKEN=...               # fallback, requires Basic tier
GITHUB_TOKEN=...                       # optional, higher rate limits
```

---

## Running

```bash
bun install
bun run dev
```

Demo mode (no API keys needed):
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"projectName": "NexusNet", "demo": true}'
```

Live evaluation:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Aave",
    "tokenAddress": "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    "githubUrl": "https://github.com/aave/aave-v4",
    "governanceSpace": "aavedao.eth"
  }'
```
