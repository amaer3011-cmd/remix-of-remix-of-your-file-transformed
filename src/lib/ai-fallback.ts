/* ============================================================
   Thanawiyah🎯 — منطق سلسلة الاحتياط للذكاء الاصطناعي
   Gemini Key 1..5  →  Qwen3 235B → Qwen3 30B → DeepSeek V3
   → DeepSeek R1 → Nemotron 3.5 Lightning → MiniMax M3 → Laguna S 2.1
   ============================================================ */

export const OPENROUTER_MODELS = [
  "qwen/qwen3-235b-a22b",
  "qwen/qwen3-30b-a3b",
  "deepseek/deepseek-v3.2",
  "deepseek/deepseek-r1",
  "nvidia/nemotron-3.5-lightning",
  "minimax/minimax-m3",
  "poolside/laguna-s-2.1",
] as const;

export type ProviderResult =
  | { ok: true; text: string }
  | { ok: false; status: number; error: string };

export type FallbackOutcome =
  | { ok: true; text: string; provider: string; attempts: string[] }
  | { ok: false; status: number; attempts: string[] };

export type FallbackDeps = {
  geminiKeys: string[];
  openRouterKeys: string[];
  geminiModel: string;
  callGemini: (key: string, model: string) => Promise<ProviderResult>;
  callOpenRouter: (key: string, model: string) => Promise<ProviderResult>;
  onFailure?: (label: string, status: number, error: string) => void;
};

/** يجرّب كل مفتاح Gemini بالترتيب، ثم موديلات OpenRouter بالترتيب. */
export async function runFallbackChain(
  deps: FallbackDeps,
): Promise<FallbackOutcome> {
  const attempts: string[] = [];
  let lastStatus = 503;

  for (let i = 0; i < deps.geminiKeys.length; i++) {
    const label = `gemini#${i + 1}`;
    attempts.push(label);
    const r = await deps.callGemini(deps.geminiKeys[i]!, deps.geminiModel);
    if (r.ok) return { ok: true, text: r.text, provider: "gemini", attempts };
    lastStatus = r.status;
    deps.onFailure?.(label, r.status, r.error);
  }

  for (const model of OPENROUTER_MODELS) {
    for (let i = 0; i < deps.openRouterKeys.length; i++) {
      const label = `${model}#${i + 1}`;
      attempts.push(label);
      const r = await deps.callOpenRouter(deps.openRouterKeys[i]!, model);
      if (r.ok) return { ok: true, text: r.text, provider: model, attempts };
      lastStatus = r.status;
      deps.onFailure?.(label, r.status, r.error);
    }
  }

  return { ok: false, status: lastStatus, attempts };
}
