"use client";

import { useEffect, useState } from "react";
import { useLang } from "./Providers";
import type { HistoryEntry } from "@/lib/history";
import type { RiskLevel } from "@/lib/detection/types";

const LEVEL_DOT: Record<RiskLevel, string> = {
  low: "bg-safe",
  medium: "bg-warn",
  high: "bg-danger",
};

const LEVEL_TEXT: Record<RiskLevel, string> = {
  low: "text-safe",
  medium: "text-warn",
  high: "text-danger",
};

interface HistoryPanelProps {
  open: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ open, entries, onClose, onLoad, onDelete, onClear }: HistoryPanelProps) {
  const { t, lang } = useLang();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmId) return;
    const timer = window.setTimeout(() => setConfirmId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [confirmId]);

  useEffect(() => {
    if (!open) setConfirmId(null);
  }, [open]);

  const formatter = new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-void/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label={t.historyTitle}
        aria-hidden={!open}
        inert={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-abyss shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
          <div>
            <h2 className="flex items-center gap-2 text-[13px] font-semibold text-chalk">
              {t.historyTitle}
              {entries.length > 0 && (
                <span className="rounded-full bg-signal/15 px-1.5 py-0.5 font-mono text-[10px] text-signal">
                  {entries.length}
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-[10.5px] text-mist-2">{t.historyNote}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.historyClose}
            className="btn btn-ghost h-7 w-7 rounded-lg p-0 text-mist hover:text-chalk"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-2 py-10 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-panel text-base opacity-60">
                🦀
              </span>
              <p className="text-[12px] leading-5 text-mist-2">{t.historyEmpty}</p>
            </div>
          ) : (
            <ul className="stagger-children space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="card-hover rounded-xl border border-line bg-panel p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold ${LEVEL_TEXT[entry.level]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${LEVEL_DOT[entry.level]}`} />
                      {entry.score}/100
                    </span>
                    <span className="font-mono text-[10px] text-mist-2">
                      {formatter.format(new Date(entry.createdAt))}
                    </span>
                  </div>

                  <p className="mt-1.5 line-clamp-2 break-words text-[12px] leading-5 text-mist">
                    {entry.text}
                  </p>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onLoad(entry)}
                      className="btn btn-outline px-2 py-1 text-[11px] font-medium"
                    >
                      {t.historyLoad}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirmId === entry.id) {
                          onDelete(entry.id);
                          setConfirmId(null);
                        } else {
                          setConfirmId(entry.id);
                        }
                      }}
                      className={`btn border px-2 py-1 text-[11px] transition-colors ${
                        confirmId === entry.id
                          ? "border-danger/50 bg-danger/10 text-danger"
                          : "border-line text-mist-2 hover:border-danger/40 hover:text-danger"
                      }`}
                    >
                      {confirmId === entry.id ? t.historyConfirm : t.historyDelete}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-line p-3">
            <button
              type="button"
              onClick={onClear}
              className="btn btn-ghost btn-danger w-full px-3 py-2 text-[11.5px] font-medium text-mist"
            >
              {t.historyClear}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
