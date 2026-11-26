"use client";

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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-line bg-abyss shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <div>
            <h2 className="text-[13px] font-semibold text-chalk">{t.historyTitle}</h2>
            <p className="mt-0.5 text-[10.5px] text-mist-2">{t.historyNote}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-line px-2 py-1 text-[11px] text-mist transition-colors hover:text-chalk"
          >
            {t.historyClose}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="px-2 py-8 text-center text-[12px] leading-5 text-mist-2">{t.historyEmpty}</p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-line bg-panel p-3">
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
                      className="rounded-md border border-signal/30 bg-signal/10 px-2 py-1 text-[11px] font-medium text-signal"
                    >
                      {t.historyLoad}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(entry.id)}
                      className="rounded-md border border-line px-2 py-1 text-[11px] text-mist-2 transition-colors hover:text-danger"
                    >
                      {t.historyDelete}
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
              className="w-full rounded-lg border border-line px-3 py-2 text-[11.5px] font-medium text-mist transition-colors hover:border-danger/40 hover:text-danger"
            >
              {t.historyClear}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
