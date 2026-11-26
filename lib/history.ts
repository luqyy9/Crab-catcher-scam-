import type { Lang, RiskLevel } from "./detection/types";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  text: string;
  level: RiskLevel;
  score: number;
  lang: Lang;
}

const KEY = "crabcatcher.history.v1";
const LIMIT = 15;
const MAX_STORED_CHARS = 2000;

function safeParse(value: string | null): HistoryEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is HistoryEntry =>
        Boolean(entry) &&
        typeof entry.id === "string" &&
        typeof entry.text === "string" &&
        typeof entry.createdAt === "number" &&
        typeof entry.score === "number" &&
        (entry.level === "low" || entry.level === "medium" || entry.level === "high"),
    );
  } catch {
    return [];
  }
}

export function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(window.localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): HistoryEntry[] {
  if (typeof window === "undefined") return entries;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, LIMIT)));
  } catch {
    // Quota or private mode; history is a convenience, not a requirement.
  }
  return entries.slice(0, LIMIT);
}

export function addHistory(input: {
  text: string;
  level: RiskLevel;
  score: number;
  lang: Lang;
}): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    text: input.text.slice(0, MAX_STORED_CHARS),
    level: input.level,
    score: input.score,
    lang: input.lang,
  };

  const existing = readHistory().filter((item) => item.text.trim() !== entry.text.trim());
  return writeHistory([entry, ...existing]);
}

export function removeHistoryEntry(id: string): HistoryEntry[] {
  return writeHistory(readHistory().filter((entry) => entry.id !== id));
}

export function clearHistory(): HistoryEntry[] {
  return writeHistory([]);
}
