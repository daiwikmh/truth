import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { runPipeline } from "./lib/agents/orchestrator";
import type { ProjectFields } from "./lib/agents/registry";

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));

app.post("/analyze", async (c) => {
  const body = await c.req.json<{ project: ProjectFields; isDemo: boolean }>();
  const result = await runPipeline(body.project, body.isDemo);
  return c.json(result);
});

const port = Number(process.env.PORT ?? 3001);
console.log(`Runner listening on 0.0.0.0:${port}`);
serve({ fetch: app.fetch, hostname: "0.0.0.0", port });
