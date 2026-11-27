export type Lang = "en" | "ms";

export type RiskLevel = "low" | "medium" | "high";

export type Severity = "info" | "low" | "medium" | "high" | "critical";

export type SignalCategory =
  | "scenario"
  | "urgency"
  | "threat"
  | "credential"
  | "payment"
  | "too_good"
  | "secrecy"
  | "channel"
  | "link"
  | "grammar"
  | "attachment"
  | "impersonation"
  | "contact"
  | "text";

export interface Span {
  start: number;
  end: number;
}

export interface Signal {
  /** Stable id, also the i18n key for the explanation shown to the user. */
  id: string;
  category: SignalCategory;
  severity: Severity;
  weight: number;
  /** Up to a few verbatim excerpts from the original message. */
  hits: string[];
  spans: Span[];
}

export interface UrlReport {
  /** Exactly as it appeared in the message. */
  raw: string;
  /** De-obfuscated version used for analysis (never rendered as a link). */
  display: string;
  host: string;
  start: number;
  end: number;
  risk: RiskLevel;
  score: number;
  /** Signal ids explaining why this specific address is suspicious. */
  reasons: string[];
}

export interface AIFlag {
  title: string;
  explanation: string;
  severity: Severity;
  quote?: string;
}

/**
 * A whole-conversation scam pattern (e.g. OTP theft, investment fraud) built
 * from a combination of evidence rather than a single phrase. These are what
 * let the offline engine recognise a scam chat even when no link is present.
 */
export interface ScenarioHit {
  /** Stable id, also the i18n key for the title shown to the user. */
  id: string;
  severity: Severity;
  weight: number;
  confidence: "possible" | "likely";
  evidence: string[];
  spans: Span[];
}

export interface AIAnalysis {
  riskLevel: RiskLevel;
  confidence: number;
  score: number;
  summary: string;
  flags: AIFlag[];
  verificationSteps: string[];
  ifScammed: string[];
}

export interface AnalysisResult {
  lang: Lang;
  /** Final blended score, 0-100. */
  score: number;
  ruleScore: number;
  aiScore: number | null;
  level: RiskLevel;
  confidence: number;
  signals: Signal[];
  /** Whole-message scam patterns detected by the offline engine. */
  scenarios: ScenarioHit[];
  urls: UrlReport[];
  summary: string;
  verificationSteps: string[];
  ifScammed: string[];
  aiUsed: boolean;
  aiFlags: AIFlag[];
  durationMs: number;
}

export interface AnalyzeResponse {
  result: AnalysisResult;
  meta: {
    ai: boolean;
    reason?: string;
    provider?: string;
  };
}
