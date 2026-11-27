import { LEXICONS } from "./lexicons";
import { squish } from "./normalize";
import type { Brand } from "./brands";
import type { Signal, Span } from "./types";

function mergeSpans(spans: Span[]): Span[] {
  if (spans.length < 2) return spans;
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: Span[] = [sorted[0]];
  for (const span of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (span.start < last.end) {
      last.end = Math.max(last.end, span.end);
    } else {
      merged.push(span);
    }
  }
  return merged;
}

/** Runs the phrase lexicons and returns one signal per matched rule. */
export function runLexicons(canonical: string): Signal[] {
  const signals: Signal[] = [];

  for (const rule of LEXICONS) {
    const hits: string[] = [];
    const spans: Span[] = [];
    const seen = new Set<string>();

    for (const source of rule.patterns) {
      const re = new RegExp(source, "giu");
      for (const match of canonical.matchAll(re)) {
        const text = match[0];
        if (!text.trim()) continue;
        const start = match.index ?? 0;
        spans.push({ start, end: start + text.length });

        const key = squish(text).toLowerCase();
        if (!seen.has(key) && hits.length < (rule.maxHits ?? 3)) {
          seen.add(key);
          hits.push(squish(text));
        }
      }
    }

    if (spans.length === 0) continue;

    signals.push({
      id: rule.id,
      category: rule.category,
      severity: rule.severity,
      weight: rule.weight,
      hits,
      spans: mergeSpans(spans).slice(0, 12),
    });
  }

  return signals;
}

export function homoglyphSignal(original: string, canonical: string): Signal | null {
  if (original === canonical) return null;
  const spans: Span[] = [];
  for (let index = 0; index < original.length; index += 1) {
    if (original[index] !== canonical[index]) {
      spans.push({ start: index, end: index + 1 });
      if (spans.length >= 6) break;
    }
  }
  return {
    id: "text.homoglyph",
    category: "text",
    severity: "high",
    weight: 18,
    hits: [],
    spans,
  };
}

export function capsSignal(original: string): Signal | null {
  const letters = original.match(/\p{L}/gu) ?? [];
  if (letters.length < 24) return null;
  const upper = original.match(/\p{Lu}/gu) ?? [];
  const ratio = upper.length / letters.length;
  if (ratio < 0.5) return null;

  const spans: Span[] = [];
  const re = /\b[A-Z]{4,}\b/g;
  for (const match of original.matchAll(re)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
    if (spans.length >= 4) break;
  }

  return {
    id: "grammar.caps",
    category: "grammar",
    severity: "low",
    weight: 5,
    hits: [],
    spans,
  };
}

export function punctuationSignal(canonical: string): Signal | null {
  const re = /[!?]{3,}/g;
  const spans: Span[] = [];
  for (const match of canonical.matchAll(re)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
    if (spans.length >= 3) break;
  }
  if (spans.length === 0) return null;

  return {
    id: "grammar.punctuation",
    category: "grammar",
    severity: "low",
    weight: 4,
    hits: [],
    spans,
  };
}

interface ContextInput {
  canonical: string;
  brands: Brand[];
  signals: Signal[];
  hasLink: boolean;
}

/** Signals that only make sense once the whole message is understood. */
export function contextSignals({ canonical, brands, signals, hasLink }: ContextInput): Signal[] {
  const out: Signal[] = [];
  const hasCategory = (category: string) => signals.some((signal) => signal.category === category);

  const genericBank = /\b(?:your|the)\s+bank(?:\s+account)?\b|\bakaun bank anda\b|\bakaun anda\b/iu.exec(canonical);
  if (genericBank) {
    const start = genericBank.index ?? 0;
    out.push({
      id: "impersonation.generic_bank",
      category: "impersonation",
      severity: "medium",
      weight: 8,
      hits: [squish(genericBank[0])],
      spans: [{ start, end: start + genericBank[0].length }],
    });
  }

  if (brands.length > 0 && (hasCategory("credential") || hasCategory("payment"))) {
    const names = brands.map((brand) => brand.names[0]).join(", ");
    out.push({
      id: "impersonation.brand_claim",
      category: "impersonation",
      severity: "medium",
      weight: 10,
      hits: [names],
      spans: [],
    });
  }

  if (brands.length > 0 && !hasLink && hasCategory("credential")) {
    out.push({
      id: "impersonation.brand_no_link",
      category: "impersonation",
      severity: "high",
      weight: 14,
      hits: brands.map((brand) => brand.names[0]),
      spans: [],
    });
  }

  // A locally formatted bank account number next to a payment request is how
  // most chat scams collect the money. Leading-zero strings are phone numbers,
  // so they are excluded to avoid flagging ordinary contact details.
  const paymentish = signals.some((signal) => signal.category === "payment");
  const account = /\b[1-9]\d(?:[ -]?\d){8,15}\b/.exec(canonical);
  if (paymentish && account) {
    const start = account.index ?? 0;
    out.push({
      id: "payment.account_number",
      category: "payment",
      severity: "medium",
      weight: 10,
      hits: [squish(account[0])],
      spans: [{ start, end: start + account[0].length }],
    });
  }

  return out;
}
