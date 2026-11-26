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

export function Analyzer() {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResponse["result"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const analyze = useCallback(async () => {
    const trimmed = text.trim();
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

  const reset = useCallback(() => {
    setResult(null);
    setText("");
    setError(null);
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
          <section className="pb-8 pt-10 sm:pt-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-mist">
              <span className="h-1.5 w-1.5 rounded-full bg-signal pulse-dot" />
              {t.badge}
            </span>
            <h1 className="mt-5 max-w-3xl text-balance text-3xl font-semibold leading-tight tracking-tight text-chalk sm:text-[2.6rem] sm:leading-[1.1]">
              {t.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-6 text-mist">{t.heroSubtitle}</p>
          </section>
        )}

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line/70 px-4 py-3 sm:px-5">
            <label htmlFor="message" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-2">
              {t.inputLabel}
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-[11px] font-medium text-mist transition-colors hover:text-chalk"
              >
                {t.historyOpen}
                {history.length > 0 && <span className="ml-1.5 font-mono text-[10px] text-signal">{history.length}</span>}
              </button>
              <span className={`font-mono text-[10.5px] ${tooLong ? "text-danger" : "text-mist-2"}`}>
                {text.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <textarea
              id="message"
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
              className="w-full resize-y rounded-xl border border-line bg-abyss/70 px-3.5 py-3 text-[13.5px] leading-6 text-chalk placeholder:text-mist-2/70 focus:border-line-2 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-mist-2">{t.samplesLabel}</span>
              {SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => {
                    setText(sample.text[lang]);
                    setResult(null);
                    setError(null);
                  }}
                  className="rounded-full border border-line bg-panel-2 px-2.5 py-1 text-[11px] text-mist transition-colors hover:border-line-2 hover:text-chalk"
                >
                  {sample.label[lang]}
                </button>
              ))}
            </div>

            {errorMessage && (
              <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
                {errorMessage}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[11px] leading-5 text-mist-2">{t.emptyHint}</p>

              <div className="flex items-center gap-2">
                {text.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setError(null);
                    }}
                    className="rounded-lg border border-line px-3 py-2 text-[12px] text-mist transition-colors hover:text-chalk"
                  >
                    {t.clear}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void analyze()}
                  disabled={!canAnalyze}
                  className="inline-flex items-center gap-2 rounded-lg bg-signal px-4 py-2 text-[12.5px] font-semibold text-void transition-all hover:bg-signal/90 disabled:cursor-not-allowed disabled:bg-line disabled:text-mist-2"
                >
                  {loading && (
                    <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-void/30 border-t-void" />
                  )}
                  {loading ? t.analyzing : t.analyze}
                </button>
              </div>
            </div>
          </div>
        </section>

        {result && result.lang !== lang && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal/25 bg-signal/5 px-4 py-3">
            <p className="text-[12px] text-signal/90">{t.reanalyze}</p>
            <button
              type="button"
              onClick={() => void analyze()}
              disabled={loading}
              className="rounded-lg border border-signal/30 bg-signal/10 px-3 py-1.5 text-[11.5px] font-semibold text-signal"
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

        <footer className="mt-12 border-t border-line/70 pt-6">
          <p className="max-w-3xl text-[11px] leading-5 text-mist-2">{t.footerNote}</p>
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
        }}
        onDelete={(id) => setHistory(removeHistoryEntry(id))}
        onClear={() => setHistory(clearHistory())}
      />
    </>
  );
}
