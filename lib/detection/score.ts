import type { AIAnalysis, RiskLevel, Signal } from "./types";

export interface ScoreResult {
  score: number;
  level: RiskLevel;
  confidence: number;
  critical: boolean;
  bonus: number;
  bonusReasons: string[];
}

export interface ScoreContext {
  hasLink: boolean;
  /** True when the paste looks like a multi-message conversation. */
  isChat?: boolean;
  messageCount?: number;
}

/**
 * Whole-conversation scam patterns carry their own minimum score: once the
 * evidence for "send me the OTP" or "transfer the money" is present, the result
 * should not be diluted back into "probably fine" just because the wording is
 * short or informal.
 */
const SCENARIO_FLOORS: Record<string, number> = {
  "scenario.money_mule": 88,
  "scenario.safe_account": 85,
  "scenario.otp_theft": 85,
  "scenario.investment": 70,
  "scenario.money_transfer": 68,
  "scenario.job_task": 70,
  "scenario.romance": 70,
  "scenario.loan_fee": 68,
  "scenario.parcel_fee": 68,
  "scenario.utility_bill": 72,
  "scenario.account_takeover": 68,
  "scenario.tech_support": 70,
  "scenario.overpayment": 68,
  "scenario.sextortion": 70,
  "scenario.advance_fee": 68,
};

export function levelFromScore(score: number): RiskLevel {
  if (score >= 65) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function scoreSignals(signals: Signal[], context: ScoreContext | boolean): ScoreResult {
  const hasLink = typeof context === "boolean" ? context : context.hasLink;
  const isChat = typeof context === "boolean" ? false : Boolean(context.isChat);
  const messageCount = typeof context === "boolean" ? 1 : context.messageCount ?? 1;

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

  // Chat-specific combinations. A conversation is where scam scripts unfold,
  // so the same words carry more weight than in a one-off formal SMS.
  if (isChat && hasId("scenario.money_transfer")) add(12, "chat+money_request");
  if (isChat && messageCount >= 4 && hasCategory("payment") && hasCategory("credential")) {
    add(12, "chat+payment+credential");
  }
  if (hasCategory("scenario") && hasCategory("secrecy")) add(8, "scenario+secrecy");
  if (hasId("too_good.investment") && hasCategory("payment")) add(8, "investment+payment");
  if (hasId("too_good.task_job") && hasCategory("payment")) add(10, "task_job+payment");
  if (hasId("too_good.loan") && hasCategory("payment")) add(10, "loan+payment");
  if (hasId("scenario.romance") && hasCategory("payment")) add(10, "romance+payment");
  if (hasId("scenario.account_takeover") && hasCategory("payment")) add(10, "takeover+payment");

  const critical = signals.some((signal) => signal.severity === "critical");
  let score = Math.min(100, base + bonus);

  for (const [id, floor] of Object.entries(SCENARIO_FLOORS)) {
    if (hasId(id)) score = Math.max(score, floor);
  }
  if (critical) score = Math.max(score, 68);

  const scenarioCount = signals.filter((signal) => signal.category === "scenario").length;
  const confidence = Math.min(
    0.97,
    0.5 +
      Math.min(signals.length, 8) * 0.05 +
      Math.min(scenarioCount, 2) * 0.06 +
      (critical ? 0.1 : 0),
  );

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
