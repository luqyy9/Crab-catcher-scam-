import { buildIfScammed, buildSummary, buildVerificationSteps } from "./advice";
import { findBrands } from "./brands";
import { CATEGORY_ORDER } from "./lexicons";
import { prepare } from "./normalize";
import {
  capsSignal,
  contextSignals,
  homoglyphSignal,
  punctuationSignal,
  runLexicons,
} from "./rules";
import { scoreSignals } from "./score";
import type { AnalysisResult, Lang, Signal } from "./types";
import { analyzeLinks } from "./urls";

function sortSignals(signals: Signal[]): Signal[] {
  return [...signals].sort((a, b) => {
    const orderA = CATEGORY_ORDER.indexOf(a.category);
    const orderB = CATEGORY_ORDER.indexOf(b.category);
    if (orderA !== orderB) return orderA - orderB;
    return b.weight - a.weight;
  });
}

/**
 * Deterministic analysis. Runs in milliseconds and needs no network, so the
 * app is fully usable with no API key configured.
 */
export function analyzeText(text: string, lang: Lang): AnalysisResult {
  const started = Date.now();
  const { original, canonical } = prepare(text);
  const brands = findBrands(canonical);

  const links = analyzeLinks(original, canonical, brands);
  const lexical = runLexicons(canonical);

  const signals: Signal[] = [
    ...lexical,
    ...links.signals,
    ...contextSignals({
      canonical,
      brands,
      signals: [...lexical, ...links.signals],
      hasLink: links.hasLink,
    }),
  ];

  const homoglyph = homoglyphSignal(original, canonical);
  if (homoglyph) signals.push(homoglyph);

  const caps = capsSignal(original);
  if (caps) signals.push(caps);

  const punctuation = punctuationSignal(canonical);
  if (punctuation) signals.push(punctuation);

  const sorted = sortSignals(signals);
  const scored = scoreSignals(sorted, links.hasLink);

  return {
    lang,
    score: scored.score,
    ruleScore: scored.score,
    aiScore: null,
    level: scored.level,
    confidence: scored.confidence,
    signals: sorted,
    urls: links.urls,
    summary: buildSummary(lang, scored.level, sorted, links.urls),
    verificationSteps: buildVerificationSteps(lang, sorted, links.urls),
    ifScammed: buildIfScammed(lang),
    aiUsed: false,
    aiFlags: [],
    durationMs: Date.now() - started,
  };
}
