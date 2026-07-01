export type AiProvider = "openai" | "anthropic";

const PROVIDER_KEY = "mufg.ai.provider";
const MODEL_KEY = "mufg.ai.model";

export const AI_MODELS: Record<AiProvider, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
};

export function getAiProvider(): AiProvider {
  const stored = localStorage.getItem(PROVIDER_KEY);
  if (stored === "anthropic" || stored === "openai") return stored;
  return "openai";
}

export function getAiModel(): string {
  const stored = localStorage.getItem(MODEL_KEY);
  if (stored) return stored;
  return AI_MODELS[getAiProvider()];
}

export function setAiProvider(provider: AiProvider): void {
  localStorage.setItem(PROVIDER_KEY, provider);
  localStorage.setItem(MODEL_KEY, AI_MODELS[provider]);
}
