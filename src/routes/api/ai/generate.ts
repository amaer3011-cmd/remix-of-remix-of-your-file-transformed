import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/* ============================================================
   Thanawiyah🎯 — بوابة الذكاء الاصطناعي (backend فقط)
   المفاتيح كلها هنا على الخادم، ومش بتوصل للمتصفح أبدًا.
   سلسلة الاحتياط:
     Gemini Key 1..5  →  Qwen3 235B → Qwen3 30B → DeepSeek V3
     → DeepSeek R1 → Nemotron 3.5 Lightning → MiniMax M3 → Laguna S 2.1
   ============================================================ */

const GEMINI_MODEL = "gemini-3.6-flash";

type GeminiPart = {
  text?: string;
  inline_data?: { mime_type: string; data: string };
  inlineData?: { mimeType: string; data: string };
};
type GeminiBody = {
  contents?: Array<{ role?: string; parts?: GeminiPart[] }>;
  generationConfig?: { responseMimeType?: string; responseSchema?: unknown };
};

function geminiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  const single = process.env["GEMINI_API_KEY"];
  if (single && single.trim()) keys.push(single.trim());
  return keys;
}

function openRouterKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const k = process.env[`OPENROUTER_API_KEY_${i}`];
    if (k && k.trim()) keys.push(k.trim());
  }
  const single = process.env["OPENROUTER_API_KEY"];
  if (single && single.trim()) keys.push(single.trim());
  return keys;
}

/* تحويل جسم Gemini إلى رسائل متوافقة مع OpenAI/OpenRouter */
function toOpenAIMessages(body: GeminiBody) {
  const messages: Array<{ role: string; content: unknown }> = [];
  for (const c of body.contents ?? []) {
    const content: Array<Record<string, unknown>> = [];
    for (const p of c.parts ?? []) {
      if (p.text) content.push({ type: "text", text: p.text });
      const inline = p.inline_data ?? null;
      const inline2 = p.inlineData ?? null;
      const mime = inline?.mime_type ?? inline2?.mimeType;
      const data = inline?.data ?? inline2?.data;
      if (mime && data) {
        content.push({
          type: "image_url",
          image_url: { url: `data:${mime};base64,${data}` },
        });
      }
    }
    messages.push({
      role: c.role === "model" ? "assistant" : "user",
      content: content.length === 1 && content[0]?.["type"] === "text"
        ? (content[0]["text"] as string)
        : content,
    });
  }
  return messages;
}

async function callGemini(key: string, body: GeminiBody, model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    return { ok: false as const, status: res.status, error: await res.text().catch(() => "") };
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) return { ok: false as const, status: 502, error: "empty" };
  return { ok: true as const, text };
}

async function callOpenRouter(key: string, model: string, body: GeminiBody) {
  const wantsJson =
    body.generationConfig?.responseMimeType === "application/json";
  const messages = toOpenAIMessages(body);
  if (wantsJson) {
    messages.unshift({
      role: "system",
      content:
        "أعد الإجابة بصيغة JSON صالحة فقط بدون أي شرح أو علامات تنسيق (code fences).",
    });
  }
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(wantsJson ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    return { ok: false as const, status: res.status, error: await res.text().catch(() => "") };
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) return { ok: false as const, status: 502, error: "empty" };
  return { ok: true as const, text };
}

export const Route = createFileRoute("/api/ai/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: GeminiBody;
        try {
          body = (await request.json()) as GeminiBody;
        } catch {
          return Response.json({ error: "طلب غير صالح." }, { status: 400 });
        }
        if (!body || !Array.isArray(body.contents) || !body.contents.length) {
          return Response.json({ error: "طلب غير صالح." }, { status: 400 });
        }

        const gKeys = geminiKeys();
        const oKeys = openRouterKeys();
        const model = process.env["GEMINI_MODEL"] || GEMINI_MODEL;

        if (!gKeys.length && !oKeys.length) {
          return Response.json(
            { error: "خدمة الذكاء الاصطناعي غير مهيأة حاليًا. جرّب بعد شوية." },
            { status: 503 },
          );
        }

        let lastStatus = 503;

        for (const key of gKeys) {
          const r = await callGemini(key, body, model);
          if (r.ok) return Response.json({ text: r.text, provider: "gemini" });
          lastStatus = r.status;
          console.error("gemini failed", r.status, r.error.slice(0, 300));
        }

        for (const orModel of OPENROUTER_MODELS) {
          for (const key of oKeys) {
            const r = await callOpenRouter(key, orModel, body);
            if (r.ok)
              return Response.json({ text: r.text, provider: orModel });
            lastStatus = r.status;
            console.error("openrouter failed", orModel, r.status, r.error.slice(0, 300));
          }
        }

        return Response.json(
          {
            error:
              lastStatus === 429
                ? "الخدمة مزدحمة حاليًا، حاول تاني بعد شوية."
                : "تعذّر توليد المحتوى حاليًا. حاول مرة تانية.",
          },
          { status: 503 },
        );
      },
    },
  },
});
