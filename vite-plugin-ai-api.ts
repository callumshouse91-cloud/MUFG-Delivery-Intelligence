import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

interface AiRequestBody {
  provider?: string;
  model?: string;
  system?: string;
  user?: string;
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function callOpenAi(model: string, system: string, user: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY not set");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no content");
  return text;
}

async function callAnthropic(model: string, system: string, user: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY not set");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}`);
  const json = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = json.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned no content");
  return text;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export function aiApiPlugin(): Plugin {
  const handler = async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const body = JSON.parse(await readBody(req)) as AiRequestBody;
      const provider = body.provider === "anthropic" ? "anthropic" : "openai";
      const model = body.model || (provider === "anthropic" ? "claude-3-5-haiku-latest" : "gpt-4o-mini");
      const system = body.system || "";
      const user = body.user || "";
      const text =
        provider === "anthropic"
          ? await callAnthropic(model, system, user)
          : await callOpenAi(model, system, user);
      sendJson(res, 200, { text });
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI request failed";
      sendJson(res, 502, { error: message });
    }
  };

  const attach = (server: { middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) => {
    server.middlewares.use((req, res, next) => {
      if (req.url !== "/api/ai") return next();
      void handler(req, res);
    });
  };

  return {
    name: "ai-api",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
