export type HighlightTone = "danger" | "warn" | "neutral";

export interface Highlight {
  start: number;
  end: number;
  tone: HighlightTone;
  label?: string;
}

const TONE_RANK: Record<HighlightTone, number> = { danger: 3, warn: 2, neutral: 1 };

const TONE_CLASS: Record<HighlightTone, string> = {
  danger: "hl hl-danger",
  warn: "hl hl-warn",
  neutral: "hl hl-neutral",
};

export function mergeHighlights(highlights: Highlight[]): Highlight[] {
  const valid = highlights.filter((item) => item.end > item.start);
  valid.sort((a, b) => a.start - b.start || TONE_RANK[b.tone] - TONE_RANK[a.tone]);

  const merged: Highlight[] = [];
  for (const item of valid) {
    const last = merged[merged.length - 1];
    if (last && item.start < last.end) {
      if (TONE_RANK[item.tone] > TONE_RANK[last.tone]) {
        last.tone = item.tone;
        last.label = item.label ?? last.label;
      }
      last.end = Math.max(last.end, item.end);
      continue;
    }
    merged.push({ ...item });
  }
  return merged;
}

interface HighlightedMessageProps {
  text: string;
  highlights: Highlight[];
}

export function HighlightedMessage({ text, highlights }: HighlightedMessageProps) {
  const merged = mergeHighlights(highlights);

  if (merged.length === 0) {
    return (
      <p className="whitespace-pre-wrap break-words text-[14px] leading-7 text-chalk/90">{text}</p>
    );
  }

  const parts: Array<{ value: string; highlight?: Highlight }> = [];
  let cursor = 0;

  for (const highlight of merged) {
    const start = Math.max(0, Math.min(highlight.start, text.length));
    const end = Math.max(start, Math.min(highlight.end, text.length));
    if (start > cursor) parts.push({ value: text.slice(cursor, start) });
    if (end > start) parts.push({ value: text.slice(start, end), highlight: { ...highlight, start, end } });
    cursor = end;
  }

  if (cursor < text.length) parts.push({ value: text.slice(cursor) });

  return (
    <p className="whitespace-pre-wrap break-words text-[14px] leading-7 text-chalk/90">
      {parts.map((part, index) =>
        part.highlight ? (
          <mark
            key={index}
            className={TONE_CLASS[part.highlight.tone]}
            title={part.highlight.label}
          >
            {part.value}
          </mark>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </p>
  );
}
