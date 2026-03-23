# Dope: Verifiable Integrity Scoring for DePIN & Public Goods

## Project Summary

**Dope** is an AI-powered system that evaluates project integrity by analyzing real on-chain data, GitHub activity, social sentiment, and governance patterns. It produces an **Integrity Score (0-100)** using a divergence formula that measures gaps between what projects claim vs. what data shows.

The system runs inside an **EigenLayer Trusted Execution Environment (TEE)** via EigenCompute, ensuring cryptographic integrity guarantees — the evaluator itself cannot be manipulated.

---

## TODO: Required Fields

### description
> One-sentence project description for discovery/browsing
- [ ] Write: "AI system that scores project integrity by comparing marketing claims to real on-chain + GitHub + governance data. Runs verifiably in EigenCompute TEE."

### problemStatement
> What problem does this solve? Who needs it? Why now?

Problem: DePIN and public goods projects claim incredible metrics, but investors/grantmakers have no objective way to validate. GitHub repos can be zombie projects. Governance can be theater. Token distribution can hide rug patterns.

**Solution:** Dope evaluates integrity across 4 layers in parallel:
- **On-chain**: token concentration, holder distribution, uptime, transaction velocity
- **Development**: commit frequency, contributor health, issue response, zombie detection
- **Social**: community sentiment via Dune DEX data (Twitter fallback), engagement ratio, bot detection
- **Governance**: voter turnout, proposal pass rates, whale dominance, quorum timing

Result: divergence-based score that surfaces gaps between hype and reality.

**Why now:** Octant funding decisions require unbiased evaluation. Public goods grants need integrity assurance. The narrative is strong: *the system that evaluates project integrity itself runs with cryptographic integrity.*

### trackUUIDs
> Which hackathon track(s) does this fit?

- **Octant Public Goods Evaluation** (primary track fit)
- **EigenCompute TEE Integration** (strong secondary — TEE narrative is core value prop)

### deployedURL
> Where can judges access the live system?

- **Web dashboard:** https://dope-score.vercel.app/
- **API endpoint:** https://dope-score.vercel.app/api/cli/analyze
- **CLI key for testing:** Available upon request (use your own or demo mode with `isDemo: true`)

### videoURL
> Demo video (5-10 min) showing:
- 1. Analyze a major project (Aave, Curve, Uniswap)
- 2. Show the 4-layer analysis
- 3. Show EigenCompute attestation verification
- 4. Explain the divergence score

**TO DO:** Record walkthrough

### coverImageURL
> Hero image for the project

**TO DO:** Use the Dope logo or a diagram showing the 4-layer pipeline

### conversationLog
> How Claude Code Agent (or another agent) would interact with Dope

Example conversation:
```
User: "Analyze Aave's integrity"

Agent runs:
  1. POST /api/analyze with Aave contract/GitHub/governance data
  2. Receives IntegrityReport with score 71 (strong)
  3. Explains layer scores: on-chain 84, dev 55, social 68, gov 54
  4. Highlights: "Strong network, active development, but governance turnout is low"

User: "Compare Aave vs Curve"

Agent runs comparison, returns head-to-head analysis across dimensions
```

**TO DO:** Add full conversation example

### intention
> Why you built this. What impact do you hope for?

We built Dope to bring **objective integrity assessment to AI-driven funding decisions.**

Impact:
- **For Octant:** unbiased evaluation system with cryptographic proof that the evaluator itself is tamper-free
- **For grant programs:** foundational layer for AI agents that assess project quality
- **For investors:** signal that cuts through marketing and surfaces real risk patterns
- **For the space:** proof that verifiable AI (via TEE) enables trust in automated systems

The EigenCompute integration isn't a nice-to-have — it's the *entire narrative*. In a world where funding is decided by AI, the AI's integrity must be verifiable.

### skills
> What Claude Code skills/features does this demonstrate?

- **Multi-agent agentic pipeline** (data -> eval -> synthesis waves)
- **Real API integration** (Etherscan, GitHub, Dune, Snapshot, OpenRouter LLM)
- **Graceful degradation** (Promise.allSettled — if one source fails, others continue)
- **Verifiable execution** (EigenCompute TEE integration via Docker)
- **Persistent storage** (Neon Postgres with evaluation history)
- **CLI + HTTP API** (Hono server for TEE, Next.js frontend)
- **Signal-first design** (agents produce micro-signals, never opinions)

### helpfulResources
> Links to docs, repos, tutorials

- **GitHub:** https://github.com/daiwikmh/dope
- **README:** Project architecture, pipeline diagram, 3-wave execution model
- **EigenCompute Guide:** `/plane/EIGENCOMPUTE.md` — deployment, verification, attestation
- **Skill.md:** `/plane/skill.md` — all features, API endpoints, request/response formats
- **Tech Stack:** Next.js 16, Bun, Neon Postgres, OpenRouter, Etherscan V2, Dune, Snapshot, EigenCompute TEE
- **Live endpoints:**
  - Web: https://dope-score.vercel.app/
  - CLI API: https://dope-score.vercel.app/api/cli/analyze
  - Demo: Set `isDemo: true` to test without API keys

---

## Status

- [x] Core pipeline implemented (3-wave agents)
- [x] EigenCompute deployment live (dope-runner on TEE)
- [x] Web dashboard live on Vercel
- [x] CLI API with API key auth
- [x] Real project analysis (Ethereum, Uniswap, Curve tested)
- [ ] Submission draft completion
- [ ] Video demo
- [ ] Cover image

---

## Key Differentiators

1. **Verifiable AI:** Not just an AI evaluation system — one that runs in a TEE with cryptographic proof
2. **Multi-layer synthesis:** Combines on-chain + development + social + governance in parallel
3. **Signal-first:** Never recommends funding; only surfaces what data shows
4. **Graceful degradation:** Partial evaluations are better than none
5. **Divergence metric:** The interesting output isn't the score, but the gap between claims and reality
