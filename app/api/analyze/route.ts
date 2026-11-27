import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeWithAI, applyAI, resolveProvider } from "@/lib/ai/analyze";
import { describeChat } from "@/lib/detection/chat";
import { analyzeText } from "@/lib/detection/analyze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  text: z.string().trim().min(5).max(12000),
  lang: z.enum(["en", "ms"]).default("en"),
});

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

function allowRequest(key: string): boolean {
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= LIMIT) return false;

  bucket.count += 1;
  return true;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return ip;
}

export async function POST(request: Request) {
  if (!allowRequest(clientKey(request))) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid-body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-input" }, { status: 400 });
  }

  const { text, lang } = parsed.data;
  const base = analyzeText(text, lang);
  const provider = resolveProvider();

  let result = base;
  let meta: { ai: boolean; reason?: string; provider?: string } = {
    ai: false,
    reason: provider ? undefined : "no-key",
    provider: provider?.label,
  };

  if (provider) {
    const ai = await analyzeWithAI(
      text,
      lang,
      base.signals,
      base.urls,
      base.ruleScore,
      base.scenarios,
      describeChat(text),
    );
    if (ai.ok) {
      result = applyAI(base, ai.analysis);
      meta = { ai: true, provider: provider.label };
    } else {
      meta = { ai: false, reason: ai.reason, provider: provider.label };
    }
  }

  return NextResponse.json(
    { result, meta },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export function GET() {
  return NextResponse.json({ error: "method-not-allowed" }, { status: 405 });
}
