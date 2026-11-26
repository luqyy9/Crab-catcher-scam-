"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { HistoryPanel } from "./HistoryPanel";
import { ResultPanel } from "./ResultPanel";
import { useLang } from "./Providers";
import { SAMPLES } from "@/lib/samples";
import {
  addHistory,
  clearHistory,
  readHistory,
  removeHistoryEntry,
  type HistoryEntry,
} from "@/lib/history";
import type { AnalyzeResponse } from "@/lib/detection/types";

type ErrorCode = "short" | "long" | "rate" | "network" | "generic";

const MAX_CHARS = 5000;
const MIN_LOADING_MS = 650;

export function Analyzer() {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResponse["result"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bootstrapped = useRef(false);
  const skipScroll = useRef(false);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    if (result && !skipScroll.current) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    skipScroll.current = false;
  }, [result]);

  const analyze = useCallback(async (override?: string) => {
    const trimmed = (override ?? text).trim();
    if (trimmed.length < 5) {
      setError("short");
      return;
    }
    if (trimmed.length > MAX_CHARS) {
      setError("long");
      return;
    }

    setLoading(true);
    setError(null);
    const started = Date.now();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, lang }),
      });

      if (!response.ok) {
        if (response.status === 429) setError("rate");
        else if (response.status === 400) setError(trimmed.length > MAX_CHARS ? "long" : "short");
        else setError("generic");
        return;
      }

      const data = (await response.json()) as AnalyzeResponse;

      // Give the scanning animation room to breathe; the rules engine itself
      // answers in a few milliseconds.
      const elapsed = Date.now() - started;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_LOADING_MS - elapsed));
      }

      setResult(data.result);
      setHistory(
        addHistory({
          text: trimmed,
          level: data.result.level,
          score: data.result.score,
          lang: data.result.lang,
        }),
      );
    } catch {
      setError("network");
    } finally {
      setLoading(false);
    }
  }, [text, lang]);

  // Shareable demo links: /?sample=bank&run=1 preloads and analyzes a sample.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const params = new URLSearchParams(window.location.search);
    const sampleId = params.get("sample");
    if (!sampleId) return;

    const sample = SAMPLES.find((item) => item.id === sampleId);
    if (!sample) return;

    setText(sample.text[lang]);
    if (params.get("run") === "1") {
      skipScroll.current = true;
      void analyze(sample.text[lang]);
    }
  }, [analyze, lang]);

  const reset = useCallback(() => {
    setResult(null);
    setText("");
    setError(null);
    textareaRef.current?.focus();
  }, []);

  const errorMessage =
    error === "short"
      ? t.errShort
      : error === "long"
        ? t.errLong
        : error === "rate"
          ? t.errRate
          : error === "network"
            ? t.errNetwork
            : error === "generic"
              ? t.errGeneric
              : null;

  const tooLong = text.length > MAX_CHARS;
  const canAnalyze = text.trim().length >= 5 && !tooLong && !loading;

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        {!result && (
          <section className="relative pb-9 pt-11 sm:pt-16">
            <div className="aurora -top-24 left-0 h-64 w-64 bg-signal/25" />
            <div
              className="aurora right-0 top-4 h-72 w-72 bg-danger/15"
              style={{ animationDelay: "-7s" }}
            />

            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-mist backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-signal pulse-dot" />
              {t.badge}
            </span>

            <h1 className="gradient-text mt-5 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-[2.7rem] sm:leading-[1.08]">
              {t.heroTitle}
            </h1>

            <p className="mt-4 max-w-2xl text-[14px] leading-6 text-mist">{t.heroSubtitle}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {t.chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel/60 px-2.5 py-1 text-[10.5px] text-mist-2 backdrop-blur transition-colors hover:border-line-2 hover:text-mist"
                >
                  <span className="h-1 w-1 rounded-full bg-signal/70" />
                  {chip}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="panel relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
            <label
              htmlFor="message"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2"
            >
              {t.inputLabel}
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="btn btn-ghost px-2.5 py-1.5 text-[11px] font-medium text-mist hover:text-chalk"
              >
                {t.historyOpen}
                {history.length > 0 && (
                  <span className="rounded-full bg-signal/15 px-1.5 py-0.5 font-mono text-[10px] text-signal">
                    {history.length}
                  </span>
                )}
              </button>
              <span className={`font-mono text-[10.5px] ${tooLong ? "text-danger" : "text-mist-2"}`}>
                {text.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <textarea
              id="message"
              ref={textareaRef}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && canAnalyze) {
                  event.preventDefault();
                  void analyze();
                }
              }}
              rows={7}
              spellCheck={false}
              placeholder={t.placeholder}
              className="w-full resize-y rounded-xl border border-line bg-abyss/70 px-3.5 py-3 text-[13.5px] leading-6 text-chalk transition-colors placeholder:text-mist-2/70 focus:border-signal/40 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-mist-2">{t.samplesLabel}</span>
              {SAMPLES.map((sample) => {
                const selected = text === sample.text[lang];
                return (
                  <button
                    key={sample.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setText(sample.text[lang]);
                      setResult(null);
                      setError(null);
                      textareaRef.current?.focus();
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-all duration-200 active:scale-95 ${
                      selected
                        ? "border-signal/50 bg-signal/10 text-signal shadow-[0_0_18px_-6px_rgba(246,183,60,0.6)]"
                        : "border-line bg-panel-2 text-mist hover:-translate-y-0.5 hover:border-line-2 hover:text-chalk"
                    }`}
                  >
                    {sample.label[lang]}
                  </button>
                );
              })}
            </div>

            {errorMessage && (
              <p className="pop mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
                {errorMessage}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] leading-5 text-mist-2">{t.emptyHint}</p>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setError(null);
                      textareaRef.current?.focus();
                    }}
                    className="btn btn-ghost btn-danger px-3 py-2 text-[12px] text-mist"
                  >
                    {t.clear}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void analyze()}
                  disabled={loading || tooLong}
                  className="btn btn-primary btn-shine flex-1 px-4 py-2.5 sm:flex-none"
                >
                  {loading ? (
                    <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-void/30 border-t-void" />
                  ) : (
                    <SearchIcon />
                  )}
                  {loading ? t.analyzing : t.analyze}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 z-30 grid place-items-center overflow-hidden bg-void/70 backdrop-blur-[2px]">
              <div className="scan-sweep" />
              <div className="flex flex-col items-center gap-3">
                <span className="h-7 w-7 animate-spin rounded-full border-2 border-signal/20 border-t-signal" />
                <span className="text-[12px] font-medium text-signal">{t.analyzing}</span>
              </div>
            </div>
          )}
        </section>

        {!result && (
          <section className="stagger-children mt-4 grid gap-3 sm:grid-cols-3">
            {t.features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-hover panel flex items-start gap-3 p-4"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-signal/25 bg-signal/10 font-mono text-[11px] font-semibold text-signal">
                  {index + 1}
                </span>
                <div>
                  <h2 className="text-[12.5px] font-semibold text-chalk">{feature.title}</h2>
                  <p className="mt-1 text-[11.5px] leading-5 text-mist">{feature.body}</p>
                </div>
              </div>
            ))}
          </section>
        )}

        {result && result.lang !== lang && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal/25 bg-signal/5 px-4 py-3">
            <p className="text-[12px] text-signal/90">{t.reanalyze}</p>
            <button
              type="button"
              onClick={() => void analyze()}
              disabled={loading}
              className="btn btn-outline px-3 py-1.5 text-[11.5px]"
            >
              {loading ? t.analyzing : t.analyze}
            </button>
          </div>
        )}

        {result && (
          <div ref={resultRef} className="mt-4 scroll-mt-24">
            <ResultPanel text={text} result={result} onReset={reset} />
          </div>
        )}

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line/70 pt-6">
          <p className="max-w-2xl text-[11px] leading-5 text-mist-2">{t.footerNote}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn btn-ghost px-3 py-1.5 text-[11px] text-mist"
          >
            <ArrowUpIcon />
            {t.backToTop}
          </button>
        </footer>
      </main>

      <HistoryPanel
        open={historyOpen}
        entries={history}
        onClose={() => setHistoryOpen(false)}
        onLoad={(entry) => {
          setText(entry.text);
          setResult(null);
          setError(null);
          setHistoryOpen(false);
          textareaRef.current?.focus();
        }}
        onDelete={(id) => setHistory(removeHistoryEntry(id))}
        onClear={() => setHistory(clearHistory())}
      />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}
