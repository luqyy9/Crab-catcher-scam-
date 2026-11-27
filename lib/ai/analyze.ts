import { z } from "zod";
import type { ChatInfo } from "@/lib/detection/chat";
import { aiRiskToScore, mergeScores, type ScoreResult } from "@/lib/detection/score";
import type {
  AIAnalysis,
  AnalysisResult,
  Lang,
  ScenarioHit,
  Signal,
  UrlReport,
} from "@/lib/detection/types";

const flagSchema = z.object({
  title: z.string().min(1).max(140),
  explanation: z.string().min(1).max(700),
  severity: z.enum(["info", "low", "medium", "high", "critical"]).catch("medium"),
  quote: z.string().max(300).optional(),
});

const aiSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]).catch("medium"),
  confidence: z.number().min(0).max(1).catch(0.6),
  summary: z.string().min(1).max(900),
  flags: z.array(flagSchema).max(8).catch([]),
  verificationSteps: z.array(z.string().min(1).max(320)).max(6).catch([]),
  ifScammed: z.array(z.string().min(1).max(320)).max(6).catch([]),
});

export type AIResult = { ok: true; analysis: AIAnalysis } | { ok: false; reason: string };

export interface AIProvider {
  id: string;
  label: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
}

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * Resolve the first configured provider. Any OpenAI-compatible endpoint works,
 * so a local Ollama model, Groq's free tier, Gemini, OpenRouter or DeepSeek can
 * all power the AI review without changing the app.
 */
export function resolveProvider(): AIProvider | null {
  const explicit = env("AI_PROVIDER")?.toLowerCase();

  const candidates: AIProvider[] = [
    {
      id: "openai",
      label: "OpenAI",
      baseUrl: env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
      model: env("OPENAI_MODEL") ?? "gpt-4o-mini",
      apiKey: env("OPENAI_API_KEY"),
    },
    {
      id: "groq",
      label: "Groq",
      baseUrl: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
      apiKey: env("GROQ_API_KEY"),
    },
    {
      id: "gemini",
      label: "Google Gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-2.0-flash",
      apiKey: env("GEMINI_API_KEY") ?? env("GOOGLE_API_KEY") ?? env("GOOGLE_GENERATIVE_AI_API_KEY"),
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      baseUrl: "https://openrouter.ai/api/v1",
      model: "openai/gpt-4o-mini",
      apiKey: env("OPENROUTER_API_KEY"),
    },
    {
      id: "deepseek",
      label: "DeepSeek",
      baseUrl: "https://api.deepseek.com/v1",
      model: "deepseek-chat",
      apiKey: env("DEEPSEEK_API_KEY"),
    },
    {
      id: "mistral",
      label: "Mistral",
      baseUrl: "https://api.mistral.ai/v1",
      model: "mistral-small-latest",
      apiKey: env("MISTRAL_API_KEY"),
    },
    {
      id: "together",
      label: "Together AI",
      baseUrl: "https://api.together.xyz/v1",
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      apiKey: env("TOGETHER_API_KEY"),
    },
    {
      id: "custom",
      label: "Custom endpoint",
      baseUrl: env("AI_BASE_URL") ?? "https://api.openai.com/v1",
      model: env("AI_MODEL") ?? "gpt-4o-mini",
      apiKey: env("AI_API_KEY"),
    },
    {
      // Only used when explicitly configured: otherwise every request would
      // stall waiting for a local server that may not be running.
      id: "ollama",
      label: "Local Ollama",
      baseUrl: env("OLLAMA_BASE_URL") ?? "http://localhost:11434/v1",
      model: env("OLLAMA_MODEL") ?? "llama3.1",
      apiKey: env("OLLAMA_BASE_URL") ? "ollama" : undefined,
    },
  ];

  const withOverrides = (provider: AIProvider): AIProvider => ({
    ...provider,
    baseUrl: (env("AI_BASE_URL") ?? provider.baseUrl).replace(/\/$/, ""),
    model: env("AI_MODEL") ?? provider.model,
  });

  if (explicit) {
    const chosen = candidates.find((provider) => provider.id === explicit);
    if (chosen) return withOverrides(chosen);
    return null;
  }

  const configured = candidates.find((provider) => provider.apiKey);
  return configured ? withOverrides(configured) : null;
}

export function hasAIProvider(): boolean {
  return resolveProvider() !== null;
}

export function activeProviderLabel(): string | null {
  return resolveProvider()?.label ?? null;
}

const SYSTEM_PROMPT = [
  "You are a senior fraud analyst for a public safety tool used in Malaysia.",
  "You review SMS, WhatsApp, email, social-media DMs and pasted chat conversations for phishing and fraud.",
  "Be precise and conservative: only report something that is visibly present in the message, and quote the exact words.",
  "Never invent URLs, senders, names or facts that are not in the text.",
  "The rules-engine pre-scan can contain false positives; confirm it or ignore it.",
  "Absence of a link does NOT make a message safe. Most modern scams happen entirely inside a chat.",
  "A message is high risk when it asks for money, an OTP/TAC/verification code, a password, card details or crypto;",
  "promises guaranteed investment returns; offers a paid-task job that requires a top-up; impersonates a person or organisation;",
  "or combines urgency/threat with any request to act.",
  "Reply with a single JSON object and nothing else.",
].join(" ");

function buildUserPrompt(
  text: string,
  lang: Lang,
  signals: Signal[],
  urls: UrlReport[],
  ruleScore: number,
  scenarios: ScenarioHit[],
  chat?: ChatInfo,
): string {
  const signalLines = signals
    .filter((signal) => signal.category !== "scenario")
    .slice(0, 12)
    .map((signal) => {
      const evidence = signal.hits.length > 0 ? ` (${signal.hits.join(" | ")})` : "";
      return `- ${signal.id}: ${signal.severity}${evidence}`;
    })
    .join("\n");

  const scenarioLines = scenarios
    .map((scenario) => {
      const evidence = scenario.evidence.length > 0 ? ` (${scenario.evidence.join(" | ")})` : "";
      return `- ${scenario.id}: ${scenario.confidence}${evidence}`;
    })
    .join("\n");

  const urlLines = urls.map((url) => `- ${url.display} [${url.risk}]`).join("\n");

  const language = lang === "ms" ? "Bahasa Melayu" : "English";

  const chatLine = chat?.isTranscript
    ? `Conversation shape: transcript with about ${chat.messageCount} messages${
        chat.speakers.length > 0 ? `, speakers: ${chat.speakers.slice(0, 5).join(", ")}` : ""
      }. Treat the whole thread as one incident.`
    : "Conversation shape: single message.";

  return [
    "Analyse the message below for phishing or scam risk.",
    "",
    `Rules-engine pre-scan: ${ruleScore}/100`,
    signalLines || "- no phrase signals",
    scenarioLines ? `\nScenario hypotheses:\n${scenarioLines}` : "",
    urlLines ? `\nLinks found:\n${urlLines}` : "",
    "",
    chatLine,
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
    "- high: asks for money/transfer, OTP/TAC/code, password or card details; guaranteed returns; fake job with top-up; brand or person impersonation; or a fake link.",
    "- medium: manipulation tactics (urgency, secrecy, emotional pressure) but no direct request to send money or credentials.",
    "- low: ordinary transactional or personal message with no request that could cost the user money or access.",
    "- Scam types to consider: phishing, OTP theft, money mule, investment fraud, job/task scam, loan fee, parcel fee, romance, tech support, account takeover, prize/advance fee.",
    "- If the message asks the user to send an OTP, that is always high risk, even if it looks friendly.",
    "- Do not repeat the same point twice. At most 5 flags.",
    "- verificationSteps: 2 to 4 short actions.",
    "- If the message is in a different language than requested, still answer in the requested language.",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractJson(content: string): string {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? content).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start >= 0 && end > start) return body.slice(start, end + 1);
  return body;
}

interface CallOptions {
  provider: AIProvider;
  text: string;
  lang: Lang;
  signals: Signal[];
  urls: UrlReport[];
  ruleScore: number;
  scenarios: ScenarioHit[];
  chat?: ChatInfo;
  jsonMode: boolean;
}

async function callProvider(options: CallOptions): Promise<Response> {
  const { provider, jsonMode } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider.apiKey) headers.Authorization = `Bearer ${provider.apiKey}`;
  if (provider.id === "openrouter") {
    headers["HTTP-Referer"] = env("APP_URL") ?? "http://localhost:3000";
    headers["X-Title"] = "Crab Catcher";
  }

  const payload: Record<string, unknown> = {
    model: provider.model,
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: buildUserPrompt(
          options.text,
          options.lang,
          options.signals,
          options.urls,
          options.ruleScore,
          options.scenarios,
          options.chat,
        ),
      },
    ],
  };
  if (jsonMode) payload.response_format = { type: "json_object" };

  return fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30_000),
  });
}

export async function analyzeWithAI(
  text: string,
  lang: Lang,
  signals: Signal[],
  urls: UrlReport[],
  ruleScore: number,
  scenarios: ScenarioHit[] = [],
  chat?: ChatInfo,
): Promise<AIResult> {
  const provider = resolveProvider();
  if (!provider) {
    return { ok: false, reason: "no-key" };
  }

  try {
    // JSON mode is not supported by every OpenAI-compatible endpoint, so a
    // rejected request is retried once without it.
    let response = await callProvider({ provider, text, lang, signals, urls, ruleScore, scenarios, chat, jsonMode: true });
    if (!response.ok && response.status === 400) {
      response = await callProvider({ provider, text, lang, signals, urls, ruleScore, scenarios, chat, jsonMode: false });
    }

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

    let raw: unknown;
    try {
      raw = JSON.parse(extractJson(content));
    } catch {
      return { ok: false, reason: "invalid-json" };
    }

    const parsed = aiSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, reason: "invalid-json" };
    }

    const data = parsed.data;

    return {
      ok: true,
      analysis: {
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        score: aiRiskToScore(data.riskLevel),
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
  const rule: ScoreResult = {
    score: base.ruleScore,
    level: base.level,
    confidence: base.confidence,
    critical: base.signals.some((signal) => signal.severity === "critical"),
    bonus: 0,
    bonusReasons: [],
  };
  const merged = mergeScores(rule, ai);

  const steps = [...base.verificationSteps];
  for (const step of ai.verificationSteps) {
    if (!steps.some((existing) => existing.toLowerCase() === step.toLowerCase())) {
      steps.push(step);
    }
  }

  return {
    ...base,
    score: merged.score,
    level: merged.level,
    confidence: merged.confidence,
    aiScore: Math.round(ai.score),
    aiUsed: true,
    aiFlags: ai.flags,
    summary: ai.summary.trim() || base.summary,
    verificationSteps: steps.slice(0, 7),
    ifScammed: ai.ifScammed.length > 0 ? ai.ifScammed.slice(0, 6) : base.ifScammed,
  };
}
