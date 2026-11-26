/**
 * Text preparation for matching.
 *
 * Every transform here is 1:1 on characters so that a match index in the
 * canonical string is still a valid index in the original message. That lets
 * the UI highlight the exact text the user pasted, even when the scammer used
 * Cyrillic lookalikes or zero-width spaces.
 */

const HOMOGLYPHS: Record<string, string> = {
  // Cyrillic
  "\u0430": "a",
  "\u0432": "b",
  "\u0435": "e",
  "\u043A": "k",
  "\u043C": "m",
  "\u043D": "h",
  "\u043E": "o",
  "\u0440": "p",
  "\u0441": "c",
  "\u0442": "t",
  "\u0443": "y",
  "\u0445": "x",
  "\u0455": "s",
  "\u0456": "i",
  "\u0458": "j",
  "\u0501": "d",
  "\u04BB": "h",
  // Greek
  "\u03B1": "a",
  "\u03B5": "e",
  "\u03B9": "i",
  "\u03BA": "k",
  "\u03BD": "v",
  "\u03BF": "o",
  "\u03C1": "p",
  "\u03C4": "t",
  "\u03C5": "u",
  "\u03C7": "x",
};

const INVISIBLE = /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF\u00AD]/g;

export interface Prepared {
  original: string;
  canonical: string;
  /** True when the message mixes lookalike scripts with Latin letters. */
  hasHomoglyphs: boolean;
}

/** Maps lookalike Cyrillic/Greek characters to Latin, preserving length. */
export function dehomoglyphText(text: string): string {
  let output = "";
  for (const char of text) {
    output += HOMOGLYPHS[char] ?? char;
  }
  return output;
}

export function prepare(text: string): Prepared {
  const original = text.replace(/\r\n/g, "\n");
  const canonical = dehomoglyphText(original).replace(INVISIBLE, " ");
  const hasHomoglyphs = [...original].some((char) => char in HOMOGLYPHS);

  return { original, canonical, hasHomoglyphs };
}

/** Collapses whitespace for display and comparison. */
export function squish(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}\u2026`;
}
