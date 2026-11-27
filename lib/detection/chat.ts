import type { Signal } from "./types";

/**
 * Chat transcripts are the most common way people share a scam: a WhatsApp
 * conversation with timestamps, sender labels and many short messages.
 *
 * This module does not rewrite the text (that would break the character offsets
 * the UI highlights). It only measures the shape of the paste so the scorer can
 * tell "one formal SMS" apart from "a conversation with a stranger".
 */
export interface ChatInfo {
  isTranscript: boolean;
  messageCount: number;
  speakers: string[];
  hasTimestamps: boolean;
  hasSenderLabels: boolean;
  forwarded: boolean;
  /** True for exported chats ("[27/11/2026, 10:31 PM] Ali: ..."). */
  isExported: boolean;
}

const EXPORT_TIMESTAMP =
  /\[\s*\d{1,4}[/.-]\d{1,2}[/.-]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap]\.?M\.?)?\s*\]/;
const BRACKET_TIME =
  /\[\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s?[APap]\.?M\.?)?\s*\]/;
const DASH_TIME =
  /(?:^|\s)\d{1,2}:\d{2}(?:\s?[APap]\.?M\.?)?\s+[-–—]\s+/m;
const TELEGRAM_TIME =
  /,\s*\[\s*\d{1,2}[./]\d{1,2}[./]\d{2,4}\s+\d{1,2}:\d{2}\s*\]/;
const EMAIL_HEADER = /^\s*(?:from|to|sent|date|subject)\s*:\s/im;

/** A short speaker label at the start of a line: `Ali: ...`, `+60 12-345 6789: ...`. */
const SENDER_LABEL = /^[ \t]*([+\d][\d\s()-]{6,22}|[\p{L}][\p{L}0-9 .'’_-]{0,38})[ \t]*:[ \t]/gmu;

const FORWARDED = /\bforwarded(?:\s+many\s+times)?\b|\bditeruskan\b|\bpesanan diteruskan\b/i;

function looksLikeName(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  // Reject lines that are obviously part of the message, e.g. "URGENT: ...".
  if (/[.!?]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  if (words.length > 4) return false;
  return /[\p{L}]/u.test(trimmed);
}

export function describeChat(text: string): ChatInfo {
  const hasTimestamps =
    EXPORT_TIMESTAMP.test(text) ||
    BRACKET_TIME.test(text) ||
    DASH_TIME.test(text) ||
    TELEGRAM_TIME.test(text);
  const isExported = EXPORT_TIMESTAMP.test(text) || TELEGRAM_TIME.test(text);

  const speakers: string[] = [];
  let senderMatches = 0;
  for (const match of text.matchAll(SENDER_LABEL)) {
    const label = (match[1] ?? "").trim();
    if (!looksLikeName(label)) continue;
    senderMatches += 1;
    const key = label.toLowerCase();
    if (!speakers.some((name) => name.toLowerCase() === key)) {
      speakers.push(label);
    }
  }

  const hasSenderLabels = senderMatches > 0;
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const messageCount = Math.max(1, lines.length);

  const isTranscript =
    isExported ||
    (hasTimestamps && messageCount >= 2) ||
    (hasSenderLabels && (speakers.length >= 2 || messageCount >= 2)) ||
    (EMAIL_HEADER.test(text) && messageCount >= 4);

  return {
    isTranscript,
    messageCount,
    speakers: speakers.slice(0, 6),
    hasTimestamps,
    hasSenderLabels,
    forwarded: FORWARDED.test(text),
    isExported,
  };
}

/** Signals that come from the shape of the message rather than its wording. */
export function chatSignals(chat: ChatInfo): Signal[] {
  const signals: Signal[] = [];

  if (chat.forwarded) {
    signals.push({
      id: "chat.forwarded",
      category: "channel",
      severity: "low",
      weight: 6,
      hits: [],
      spans: [],
    });
  }

  return signals;
}
