"use client";

import { useEffect, useMemo, useState } from "react";
import { HighlightedMessage, type Highlight, type HighlightTone } from "./HighlightedMessage";
import { RiskGauge } from "./RiskGauge";
import { useLang } from "./Providers";
import { signalCopy } from "@/lib/signal-copy";
import type { AnalysisResult, RiskLevel, Severity } from "@/lib/detection/types";

const TONE_BY_SEVERITY: Record<Severity, HighlightTone> = {
  critical: "danger",
  high: "danger",
  medium: "warn",
  low: "neutral",
  info: "neutral",
};

const DOT_BY_SEVERITY: Record<Severity, string> = {
  critical: "bg-danger",
  high: "bg-danger",
  medium: "bg-warn",
  low: "bg-mist-2",
  info: "bg-mist-2",
};

const BADGE_BY_LEVEL = {
  low: "border-safe/30 bg-safe/10 text-safe",
  medium: "border-warn/30 bg-warn/10 text-warn",
  high: "border-danger/30 bg-danger/10 text-danger",
} as const;

const BAR_BY_LEVEL: Record<RiskLevel, string> = {
  low: "bg-gradient-to-r from-safe via-safe/50 to-transparent",
  medium: "bg-gradient-to-r from-warn via-warn/50 to-transparent",
  high: "bg-gradient-to-r from-danger via-danger/50 to-transparent",
};

const GLOW_BY_LEVEL: Record<RiskLevel, string> = {
  low: "shadow-[0_0_80px_-34px_rgba(53,211,153,0.6)]",
  medium: "shadow-[0_0_80px_-34px_rgba(255,176,32,0.6)]",
  high: "shadow-[0_0_80px_-30px_rgba(255,93,108,0.65)]",
};

const URL_RISK_CLASS = {
  low: "border-safe/30 bg-safe/10 text-safe",
  medium: "border-warn/30 bg-warn/10 text-warn",
  high: "border-danger/30 bg-danger/10 text-danger",
} as const;

interface ResultPanelProps {
  text: string;
  result: AnalysisResult;
  onReset: () => void;
  /** Why the AI review did not run, when it did not. */
  aiNote?: string | null;
  /** Which provider produced the AI review, if any. */
  aiProvider?: string | null;
}

export function ResultPanel({ text, result, onReset, aiNote, aiProvider }: ResultPanelProps) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const levelLabel =
    result.level === "high" ? t.riskHigh : result.level === "medium" ? t.riskMedium : t.riskLow;
  const levelHint =
    result.level === "high"
      ? t.riskHighHint
      : result.level === "medium"
        ? t.riskMediumHint
        : t.riskLowHint;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setBarWidth(Math.round(result.confidence * 100)));
    return () => cancelAnimationFrame(frame);
  }, [result.confidence]);

  const highlights = useMemo<Highlight[]>(() => {
    const items: Highlight[] = [];
    for (const signal of result.signals) {
      const tone = TONE_BY_SEVERITY[signal.severity];
      const label = signalCopy(signal.id, lang).title;
      for (const span of signal.spans) {
        items.push({ start: span.start, end: span.end, tone, label });
      }
    }
    return items;
  }, [result.signals, lang]);

  const copyReport = async () => {
    const lines: string[] = [
      `Crab Catcher — ${levelLabel} (${result.score}/100)`,
      "",
      result.summary,
      ...(result.scenarios.length > 0
        ? [
            "",
            `${t.scamTypeLabel}: ${result.scenarios
              .slice(0, 3)
              .map((scenario) => signalCopy(scenario.id, lang).title)
              .join(", ")}`,
          ]
        : []),
      "",
      `${t.signalsTitle}:`,
      ...result.signals.map((signal) => {
        const copy = signalCopy(signal.id, lang);
        const evidence = signal.hits.length > 0 ? ` — "${signal.hits[0]}"` : "";
        return `- ${copy.title}${evidence}`;
      }),
      ...(result.urls.length > 0
        ? ["", `${t.linksTitle}:`, ...result.urls.map((url) => `- ${url.display} (${url.risk})`)]
        : []),
      "",
      `${t.verifyTitle}:`,
      ...result.verificationSteps.map((step, index) => `${index + 1}. ${step}`),
    ];

    const report = lines.join("\n");

    const legacyCopy = () => {
      const area = document.createElement("textarea");
      area.value = report;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(area);
      return ok;
    };

    let ok = false;
    try {
      await navigator.clipboard.writeText(report);
      ok = true;
    } catch {
      ok = legacyCopy();
    }

    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <section className={`panel relative overflow-hidden p-5 sm:p-6 ${GLOW_BY_LEVEL[result.level]}`}>
        <div aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${BAR_BY_LEVEL[result.level]}`} />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="shrink-0 sm:w-[230px]">
            <RiskGauge
              score={result.score}
              level={result.level}
              label={levelLabel}
              hint={levelHint}
              scoreLabel={t.scoreLabel}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${BADGE_BY_LEVEL[result.level]}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full pulse-dot ${
                    DOT_BY_SEVERITY[result.level === "high" ? "high" : result.level === "medium" ? "medium" : "low"]
                  }`}
                />
                {levelLabel}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-mist">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${result.aiUsed ? "bg-signal" : "bg-mist-2"}`}
                />
                {result.aiUsed ? (aiProvider ? `AI: ${aiProvider}` : t.aiOn) : t.aiOff}
              </span>

              <span className="rounded-full border border-line bg-panel-2 px-2.5 py-1 font-mono text-[10px] text-mist-2">
                {result.aiScore !== null
                  ? `signals ${result.ruleScore} · ai ${result.aiScore}`
                  : `signals ${result.ruleScore}`}
              </span>
            </div>

            <p className="mt-3 text-[14px] leading-6 text-chalk/85">{result.summary}</p>

            {result.scenarios.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mist-2">
                  {t.scamTypeLabel}
                </span>
                {result.scenarios.slice(0, 3).map((scenario) => (
                  <span
                    key={scenario.id}
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${
                      scenario.severity === "critical" || scenario.severity === "high"
                        ? "border-danger/30 bg-danger/10 text-danger"
                        : "border-warn/30 bg-warn/10 text-warn"
                    }`}
                  >
                    {signalCopy(scenario.id, lang).title}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 text-[11px] text-mist-2">
              <span>{t.confidence}</span>
              <span className="h-1 w-24 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-signal/70 to-signal transition-[width] duration-1000 ease-out"
                  style={{ width: `${barWidth}%` }}
                />
              </span>
              <span className="font-mono text-chalk/70">{Math.round(result.confidence * 100)}%</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyReport}
                className={`btn btn-ghost px-3 py-1.5 ${copied ? "border-safe/40 text-safe" : ""}`}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                <span className={copied ? "pop" : ""}>{copied ? t.copied : t.copy}</span>
              </button>
              <button type="button" onClick={onReset} className="btn btn-outline px-3 py-1.5">
                <RefreshIcon />
                {t.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="stagger-children space-y-4">
          <section className="panel p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
              {t.highlightTitle}
            </h2>
            <HighlightedMessage text={text} highlights={highlights} />
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
              <span>{t.linksTitle}</span>
              <span className="rounded-full border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] tracking-normal text-mist-2">
                {result.urls.length}
              </span>
            </h2>

            {result.urls.length === 0 ? (
              <p className="text-[13px] text-mist">{t.linksEmpty}</p>
            ) : (
              <ul className="space-y-3">
                {result.urls.map((url) => (
                  <li
                    key={`${url.start}-${url.raw}`}
                    className="rounded-xl border border-line bg-abyss/60 p-3 transition-colors duration-200 hover:border-line-2 hover:bg-panel-2/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <code className="break-all font-mono text-[12px] text-chalk/90">{url.display}</code>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${URL_RISK_CLASS[url.risk]}`}
                      >
                        {url.risk}
                      </span>
                    </div>
                    {url.reasons.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {url.reasons.slice(0, 4).map((reason) => (
                          <li key={reason} className="flex gap-1.5 text-[12px] leading-5 text-mist">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-danger/70" />
                            {signalCopy(reason, lang).title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-[11px] leading-5 text-mist-2">{t.linksNote}</p>
          </section>

          <section className="panel p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
              {t.whyTitle}
            </h2>

            {result.signals.length === 0 ? (
              <p className="text-[13px] text-mist">{t.signalsEmpty}</p>
            ) : (
              <ul className="divide-y divide-line/70">
                {result.signals.map((signal) => {
                  const copy = signalCopy(signal.id, lang);
                  return (
                    <li
                      key={signal.id}
                      className="-mx-2 flex gap-3 rounded-lg px-2 py-3 transition-colors duration-200 first:pt-2 last:pb-2 hover:bg-white/[0.025]"
                    >
                      <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${DOT_BY_SEVERITY[signal.severity]}`} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13px] font-semibold text-chalk">{copy.title}</h3>
                          <span className="rounded border border-line bg-panel-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-mist-2">
                            {t.severity[signal.severity]}
                          </span>
                        </div>
                        <p className="mt-1 text-[12px] leading-5 text-mist">{copy.why}</p>
                        {signal.hits.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {signal.hits.slice(0, 3).map((hit) => (
                              <span
                                key={hit}
                                className="max-w-full truncate rounded border border-line bg-abyss px-1.5 py-0.5 font-mono text-[10px] text-mist-2 transition-colors hover:border-line-2 hover:text-mist"
                                title={hit}
                              >
                                {hit}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {result.aiFlags.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-line/70 pt-4">
                {result.aiFlags.map((flag, index) => (
                  <div
                    key={`${flag.title}-${index}`}
                    className="rounded-xl border border-line bg-abyss/60 p-3 transition-colors duration-200 hover:border-signal/25"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-signal">
                        AI
                      </span>
                      <h3 className="text-[13px] font-semibold text-chalk">{flag.title}</h3>
                    </div>
                    <p className="mt-1 text-[12px] leading-5 text-mist">{flag.explanation}</p>
                    {flag.quote && (
                      <p className="mt-1.5 border-l-2 border-line-2 pl-2 font-mono text-[10px] text-mist-2">
                        “{flag.quote}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stagger-children space-y-4">
          <section className="panel p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
              {t.verifyTitle}
            </h2>
            <ol className="space-y-3">
              {result.verificationSteps.map((step, index) => (
                <li key={step} className="group flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-safe/30 bg-safe/10 font-mono text-[10px] text-safe transition-all duration-200 group-hover:scale-110 group-hover:border-safe/60 group-hover:bg-safe/20">
                    {index + 1}
                  </span>
                  <p className="text-[12.5px] leading-5 text-chalk/85">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel border-danger/20 p-5">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-danger/80">
              {t.ifScammedTitle}
            </h2>
            <ul className="space-y-2">
              {result.ifScammed.map((step) => (
                <li key={step} className="flex gap-2 text-[12.5px] leading-5 text-chalk/85">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-danger/70" />
                  {step}
                </li>
              ))}
            </ul>
          </section>

          {!result.aiUsed && (
            <p className="px-1 text-[11px] leading-5 text-mist-2">{aiNote ?? t.aiOffHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
