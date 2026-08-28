import { describe, expect, it } from "vitest";
import { OPENROUTER_MODELS, runFallbackChain, type ProviderResult } from "./ai-fallback";

const fail = (status = 429): ProviderResult => ({ ok: false, status, error: "boom" });
const pass = (text: string): ProviderResult => ({ ok: true, text });

describe("سلسلة الاحتياط", () => {
  it("ينتقل للمفتاح التالي عند فشل مفتاح Gemini", async () => {
    const used: string[] = [];
    const out = await runFallbackChain({
      geminiKeys: ["k1", "k2", "k3"],
      openRouterKeys: ["o1"],
      geminiModel: "g",
      callGemini: async (key) => {
        used.push(key);
        return key === "k3" ? pass("ok") : fail();
      },
      callOpenRouter: async () => fail(),
    });
    expect(used).toEqual(["k1", "k2", "k3"]);
    expect(out).toMatchObject({ ok: true, provider: "gemini", text: "ok" });
  });

  it("ينتقل لـ OpenRouter بالترتيب المطلوب عند فشل كل مفاتيح Gemini", async () => {
    const models: string[] = [];
    const out = await runFallbackChain({
      geminiKeys: ["k1", "k2", "k3", "k4", "k5"],
      openRouterKeys: ["o1"],
      geminiModel: "g",
      callGemini: async () => fail(500),
      callOpenRouter: async (_key, model) => {
        models.push(model);
        return model === "poolside/laguna-s-2.1" ? pass("last") : fail();
      },
    });
    expect(models).toEqual([...OPENROUTER_MODELS]);
    expect(out).toMatchObject({ ok: true, provider: "poolside/laguna-s-2.1" });
  });

  it("يرجّع فشلًا بعد استنفاد كل المزودين", async () => {
    const out = await runFallbackChain({
      geminiKeys: ["k1"],
      openRouterKeys: ["o1", "o2"],
      geminiModel: "g",
      callGemini: async () => fail(429),
      callOpenRouter: async () => fail(429),
    });
    expect(out.ok).toBe(false);
    expect(out.attempts).toHaveLength(1 + OPENROUTER_MODELS.length * 2);
  });
});
