import { z } from "zod";
import type { AIAnalysis, AnalysisResult, Lang, Signal, UrlReport } from "@/lib/detection/types";

const flagSchema = z.object({
  title: z.string().min(1).max(140),
  explanation: z.string().min(1).max(700),
  severity: z.enum(["info", "low", "medium", "high", "critical"]).catch("medium"),
  quote: z.string().max(300).optional(),
});

const aiSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  confidence: z.number().min(0).max(1).catch(0.6),
  summary: z.string().min(1).max(900),
  flags: z.array(flagSchema).max(8).catch([]),
  verificationSteps: z.array(z.string().min(1).max(320)).max(6).catch([]),
  ifScammed: z.array(z.string().min(1).max(320)).max(6).catch([]),
});

export type AIResult = { ok: true; analysis: AIAnalysis } | { ok: false; reason: string };

const SYSTEM_PROMPT = [
  "You are a scam-message analyst for a public safety tool used in Malaysia.",
  "You review SMS, WhatsApp, email and social media messages for phishing and fraud.",
  "Be precise and conservative: only report something that is visibly present in the message.",
  "Never invent URLs, senders, names or facts that are not in the text.",
  "The rules-engine pre-scan can contain false positives; confirm it or ignore it.",
  "Reply with a single JSON object and nothing else.",
].join(" ");

function buildUserPrompt(
  text: string,
  lang: Lang,
  signals: Signal[],
  urls: UrlReport[],
  ruleScore: number,
): string {
  const signalLines = signals
    .slice(0, 10)
    .map((signal) => {
      const evidence = signal.hits.length > 0 ? ` (${signal.hits.join(" | ")})` : "";
      return `- ${signal.id}: ${signal.severity}${evidence}`;
    })
    .join("\n");

  const urlLines = urls.map((url) => `- ${url.display} [${url.risk}]`).join("\n");

  const language = lang === "ms" ? "Bahasa Melayu" : "English";

  return [
    "Analyse the message below for phishing or scam risk.",
    "",
    `Rules-engine pre-scan: ${ruleScore}/100`,
    signalLines || "- none",
    urlLines ? `\nLinks found:\n${urlLines}` : "",
    "",
    "Message:",
    '"""',
    text,
    '"""',
    "",
    `Respond in ${language}.`,
    "",
    "JSON shape:",
    "{",
    '  "riskLevel": "low" | "medium" | "high",',
    '  "confidence": 0.0-1.0,',
    '  "summary": "2-3 plain-language sentences explaining the verdict",',
    '  "flags": [{ "title": "short label", "explanation": "why it matters", "severity": "low|medium|high|critical", "quote": "exact excerpt from the message" }],',
    '  "verificationSteps": ["concrete action that does not involve clicking the link"],',
    '  "ifScammed": ["what to do if the user already acted on it"]',
    "}",
    "",
    "Guidance:",
    "- high: clear credential harvesting, a payment demand, or brand impersonation with a fake link.",
    "- medium: manipulation tactics but no clearly malicious link.",
    "- low: ordinary transactional or personal message.",
    "- Do not repeat the same point twice. At most 5 flags.",
    "- verificationSteps: 2 to 4 short actions.",
    "- If the message is in a different language than requested, still answer in the requested language.",
  ]
    .filter(Boolean)
    .join("\n");
}

function scoreFromRisk(risk: AIAnalysis["riskLevel"]): number {
  if (risk === "high") return 88;
  if (risk === "medium") return 55;
  return 22;
}

export async function analyzeWithAI(
  text: string,
  lang: Lang,
  signals: Signal[],
  urls: UrlReport[],
  ruleScore: number,
): Promise<AIResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, reason: "no-key" };
  }

  const baseUrl = (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(text, lang, signals, urls, ruleScore) },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return { ok: false, reason: `http-${response.status}` };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return { ok: false, reason: "empty-response" };
    }

    const parsed = aiSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      return { ok: false, reason: "invalid-json" };
    }

    const data = parsed.data;

    return {
      ok: true,
      analysis: {
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        score: scoreFromRisk(data.riskLevel),
        summary: data.summary,
        flags: data.flags,
        verificationSteps: data.verificationSteps,
        ifScammed: data.ifScammed,
      },
    };
  } catch (error) {
    const reason = error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network";
    return { ok: false, reason };
  }
}

/** Folds the model's verdict into the deterministic result. */
export function applyAI(base: AnalysisResult, ai: AIAnalysis): AnalysisResult {
  const mergedScore = mergeScore(base, ai);
  const steps = [...base.verificationSteps];
  for (const step of ai.verificationSteps) {
    if (!steps.some((existing) => existing.toLowerCase() === step.toLowerCase())) {
      steps.push(step);
    }
  }

  return {
    ...base,
    score: mergedScore.score,
    level: mergedScore.level,
    confidence: mergedScore.confidence,
    aiScore: Math.round(ai.score),
    aiUsed: true,
    aiFlags: ai.flags,
    summary: ai.summary.trim() || base.summary,
    verificationSteps: steps.slice(0, 7),
    ifScammed: ai.ifScammed.length > 0 ? ai.ifScammed.slice(0, 6) : base.ifScammed,
  };
}

function mergeScore(base: AnalysisResult, ai: AIAnalysis): { score: number; level: AIAnalysis["riskLevel"]; confidence: number } {
  const aiScore = Math.round(ai.score);
  let score = Math.round(base.ruleScore * 0.45 + aiScore * 0.55);

  if (base.ruleScore >= 65 || aiScore >= 65) score = Math.max(score, 68);
  if (base.signals.some((signal) => signal.severity === "critical")) score = Math.max(score, 68);

  score = Math.min(100, Math.max(0, score));

  const level = score >= 65 ? "high" : score >= 30 ? "medium" : "low";
  const confidence = Math.min(0.98, Number(((base.confidence + ai.confidence) / 2 + 0.05).toFixed(2)));

  return { score, level, confidence };
}
