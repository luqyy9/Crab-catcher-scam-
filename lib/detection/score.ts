import type { AIAnalysis, RiskLevel, Signal } from "./types";

export interface ScoreResult {
  score: number;
  level: RiskLevel;
  confidence: number;
  critical: boolean;
  bonus: number;
  bonusReasons: string[];
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 65) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function scoreSignals(signals: Signal[], hasLink: boolean): ScoreResult {
  const base = signals.reduce((total, signal) => total + signal.weight, 0);
  const hasCategory = (category: string) => signals.some((signal) => signal.category === category);
  const hasId = (id: string) => signals.some((signal) => signal.id === id);

  const linkPrompt = hasLink || hasId("link.click_prompt");
  const bonusReasons: string[] = [];
  let bonus = 0;

  const add = (amount: number, reason: string) => {
    bonus += amount;
    bonusReasons.push(reason);
  };

  if (linkPrompt && hasCategory("urgency")) add(8, "urgency+link");
  if (linkPrompt && hasCategory("credential")) add(12, "credential+link");
  if (linkPrompt && hasCategory("threat")) add(8, "threat+link");
  if (linkPrompt && hasCategory("payment")) add(6, "payment+link");
  if (
    (hasId("impersonation.brand_claim") || hasId("impersonation.brand_no_link")) &&
    hasCategory("credential")
  ) {
    add(10, "impersonation+credential");
  }
  if (hasCategory("too_good") && hasCategory("payment")) add(8, "too_good+payment");

  const critical = signals.some((signal) => signal.severity === "critical");
  let score = Math.min(100, base + bonus);
  if (critical) score = Math.max(score, 68);

  const confidence = Math.min(0.97, 0.5 + Math.min(signals.length, 8) * 0.05 + (critical ? 0.1 : 0));

  return {
    score,
    level: levelFromScore(score),
    confidence: Number(confidence.toFixed(2)),
    critical,
    bonus,
    bonusReasons,
  };
}

export function aiRiskToScore(risk: RiskLevel): number {
  switch (risk) {
    case "high":
      return 88;
    case "medium":
      return 55;
    default:
      return 22;
  }
}

export interface MergeResult {
  score: number;
  level: RiskLevel;
  confidence: number;
}

/**
 * Blends the deterministic score with the model's judgement.
 *
 * A "high" verdict from either side is never diluted below the high band: for a
 * security tool, a missed scam costs the user far more than a cautious warning.
 */
export function mergeScores(rule: ScoreResult, ai: AIAnalysis | null): MergeResult {
  if (!ai) {
    return { score: rule.score, level: rule.level, confidence: rule.confidence };
  }

  const aiScore = Math.round(ai.score);
  const weighted = Math.round(rule.score * 0.45 + aiScore * 0.55);

  let score = weighted;
  if (rule.score >= 65 || aiScore >= 65) score = Math.max(score, 68);
  if (rule.critical) score = Math.max(score, 68);
  score = Math.min(100, Math.max(0, score));

  const confidence = Math.min(0.98, Number(((rule.confidence + ai.confidence) / 2 + 0.05).toFixed(2)));

  return { score, level: levelFromScore(score), confidence };
}
