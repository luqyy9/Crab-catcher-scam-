import { findBrands, isFreeMailDomain, isOfficialDomain, type Brand } from "./brands";
import { dehomoglyphText } from "./normalize";
import type { Signal, UrlReport } from "./types";

interface Candidate {
  start: number;
  end: number;
  raw: string;
}

interface Parsed {
  raw: string;
  display: string;
  host: string;
  protocol: string | null;
  port: string;
  username: string;
}

const HIGH_RISK_TLDS = new Set([
  "top",
  "xyz",
  "click",
  "icu",
  "buzz",
  "rest",
  "cyou",
  "monster",
  "quest",
  "sbs",
  "cfd",
  "lat",
  "loan",
  "work",
  "gq",
  "tk",
  "ml",
  "ga",
  "cf",
  "zip",
  "mov",
  "cam",
  "surf",
  "bar",
  "lol",
  "best",
  "support",
  "help",
  "live",
]);

const MEDIUM_RISK_TLDS = new Set(["info", "biz", "site", "online", "shop", "store", "link", "pro", "app"]);

const SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "rebrand.ly",
  "s.id",
  "bit.do",
  "shorturl.at",
  "rb.gy",
  "t.ly",
  "tiny.cc",
  "linktr.ee",
  "bitly.com",
  "short.gy",
]);

const BAIT_WORDS =
  /(?:secure|security|verify|verification|login|signin|sign-in|account|update|confirm|wallet|payment|billing|refund|recovery|unlock|support|helpdesk|customs|parcel|delivery|claim|tax|gov)/i;

const PATTERNS: Array<{ re: RegExp; kind: "url" | "domain" | "ip" }> = [
  { re: /\b(?:https?:\/\/|hxxps?:\/\/)[^\s<>"'`]+/gi, kind: "url" },
  { re: /\bwww\.[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>"'`]*)?/gi, kind: "url" },
  {
    re: /(?<![\p{L}\d@.-])[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\[\.\]|\(\.\)|\{\.\}|\.)[a-z]{2,24}(?:\/[^\s<>"'`]*)?/giu,
    kind: "domain",
  },
  { re: /\b[a-z0-9-]+(?:\s+dot\s+)[a-z]{2,10}\b/gi, kind: "domain" },
  { re: /\b\d{1,3}(?:\.\d{1,3}){3}(?::\d{2,5})?(?:\/[^\s<>"'`]*)?\b/g, kind: "ip" },
];

const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}\b/gi;

const TRAILING = /[.,;:!?)\]}>'"\u2026]+$/;

function trimTrailing(value: string): string {
  return value.replace(TRAILING, "");
}

/** Pull every URL-ish token out of the message, dropping nested/overlapping matches. */
export function extractLinks(text: string): Candidate[] {
  const found: Candidate[] = [];

  for (const { re } of PATTERNS) {
    re.lastIndex = 0;
    for (const match of text.matchAll(re)) {
      const raw = trimTrailing(match[0]);
      if (raw.length < 4) continue;
      found.push({ start: match.index ?? 0, end: (match.index ?? 0) + raw.length, raw });
    }
  }

  found.sort((a, b) => a.start - b.start || b.end - a.end);

  const accepted: Candidate[] = [];
  for (const candidate of found) {
    const overlaps = accepted.some((other) => candidate.start < other.end && candidate.end > other.start);
    if (!overlaps) accepted.push(candidate);
  }

  return accepted;
}

function parseCandidate(raw: string): Parsed | null {
  const deobfuscated = trimTrailing(
    raw
      .replace(/^hxxps?/i, (match) => (match.toLowerCase().endsWith("s") ? "https" : "http"))
      .replace(/\[\.\]|\(\.\)|\{\.\}/g, ".")
      .replace(/\s+dot\s+/gi, "."),
  );

  const hasScheme = /^https?:\/\//i.test(deobfuscated);
  const withScheme = hasScheme ? deobfuscated : `http://${deobfuscated}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!host || !host.includes(".")) return null;

  return {
    raw: trimTrailing(raw),
    display: deobfuscated,
    host,
    protocol: hasScheme ? url.protocol.replace(":", "").toLowerCase() : null,
    port: url.port,
    username: url.username,
  };
}

function isIpLiteral(host: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}

function tldOf(host: string): string {
  const parts = host.split(".");
  return parts[parts.length - 1] ?? "";
}

function lettersOnly(value: string): string {
  return value.replace(/[^a-z]/g, "");
}

function leetVariants(value: string): string[] {
  const map: Record<string, string> = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "@": "a",
    $: "s",
    "!": "i",
    "|": "l",
  };
  const first = value.replace(/[013457@$!|]/g, (char) => map[char] ?? char);
  const second = value.replace(/1/g, "i").replace(/[03457@$!|]/g, (char) => map[char] ?? char);
  return first === second ? [first] : [first, second];
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  let current = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    const swap = previous;
    previous = current;
    current = swap;
  }

  return previous[b.length];
}

function isLookalike(host: string, brand: Brand): boolean {
  const labels = host.split(".");
  const candidates: Array<{ letters: string; variants: string[] }> = [];
  for (const label of labels) {
    const letters = lettersOnly(label);
    candidates.push({ letters, variants: leetVariants(letters) });
  }
  const whole = lettersOnly(host);
  candidates.push({ letters: whole, variants: leetVariants(whole) });

  for (const token of brand.tokens) {
    if (token.length < 4) continue;
    for (const { letters, variants } of candidates) {
      for (const variant of variants) {
        if (variant === token) {
          // Exact after de-leetspeak, e.g. "paypa1" -> "paypal".
          if (letters !== token) return true;
          continue;
        }
        if (Math.abs(variant.length - token.length) > 2) continue;
        const distance = levenshtein(variant, token);
        const threshold = token.length >= 8 ? 2 : 1;
        if (distance > 0 && distance <= threshold) return true;
      }
    }
  }

  return false;
}

interface LinkSignal {
  id: string;
  severity: Signal["severity"];
  weight: number;
  detail: string;
}

function inspectHost(parsed: Parsed, brands: Brand[]): LinkSignal[] {
  const { host } = parsed;
  const canonicalHost = dehomoglyphText(host);
  const signals: LinkSignal[] = [];
  const add = (id: string, severity: Signal["severity"], weight: number, detail: string) => {
    signals.push({ id, severity, weight, detail });
  };

  if (parsed.username) {
    add("link.userinfo", "critical", 26, parsed.raw);
  }

  if (isIpLiteral(host)) {
    add("link.ip_host", "critical", 26, parsed.raw);
  }

  if (host.includes("xn--")) {
    add("link.punycode", "high", 20, parsed.raw);
  }

  const tld = tldOf(host);
  if (HIGH_RISK_TLDS.has(tld)) {
    add("link.suspicious_tld", "medium", 12, parsed.raw);
  } else if (MEDIUM_RISK_TLDS.has(tld)) {
    add("link.medium_tld", "low", 6, parsed.raw);
  }

  if (SHORTENERS.has(canonicalHost)) {
    add("link.shortener", "medium", 12, parsed.raw);
  }

  let official = false;
  let claimedBrand: Brand | null = null;
  for (const brand of brands) {
    if (isOfficialDomain(canonicalHost, brand.domains)) {
      official = true;
      break;
    }
    if (brand.tokens.some((token) => canonicalHost.includes(token))) {
      claimedBrand = claimedBrand ?? brand;
    }
  }

  if (!official && claimedBrand) {
    add("link.brand_mismatch", "critical", 30, parsed.raw);
  } else if (!official) {
    const lookalike = brands.find((brand) => isLookalike(canonicalHost, brand));
    if (lookalike) add("link.lookalike", "critical", 30, parsed.raw);
  }

  if (!official && BAIT_WORDS.test(canonicalHost)) {
    add("link.suspicious_host_words", "medium", 10, parsed.raw);
  }

  if (canonicalHost.split(".").length >= 5) {
    add("link.excessive_subdomains", "low", 8, parsed.raw);
  }

  if ((canonicalHost.match(/-/g) ?? []).length >= 2) {
    add("link.hyphens", "low", 6, parsed.raw);
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    add("link.port", "medium", 8, parsed.raw);
  }

  if (canonicalHost.length > 40) {
    add("link.long", "low", 4, parsed.raw);
  }

  if (parsed.protocol === "http") {
    add("link.no_https", "low", 6, parsed.raw);
  }

  return signals;
}

function riskFromScore(score: number): UrlReport["risk"] {
  if (score >= 30) return "high";
  if (score >= 12) return "medium";
  return "low";
}

export interface LinkAnalysis {
  urls: UrlReport[];
  signals: Signal[];
  hasLink: boolean;
}

export function analyzeLinks(original: string, canonical: string, brands?: Brand[]): LinkAnalysis {
  const mentionedBrands = brands ?? findBrands(original);
  const candidates = extractLinks(canonical);

  const urls: UrlReport[] = [];
  const aggregated = new Map<string, LinkSignal & { hits: string[]; spans: Array<{ start: number; end: number }> }>();

  const record = (signal: LinkSignal, start: number, end: number) => {
    const existing = aggregated.get(signal.id);
    if (existing) {
      if (existing.hits.length < 3) {
        existing.hits.push(signal.detail);
        existing.spans.push({ start, end });
      }
      return;
    }
    aggregated.set(signal.id, { ...signal, hits: [signal.detail], spans: [{ start, end }] });
  };

  for (const candidate of candidates) {
    const parsed = parseCandidate(candidate.raw);
    if (!parsed) continue;

    const found = inspectHost(parsed, mentionedBrands);
    const score = found.reduce((total, signal) => total + signal.weight, 0);

    for (const signal of found) record(signal, candidate.start, candidate.end);

    urls.push({
      raw: candidate.raw,
      display: parsed.display,
      host: parsed.host,
      start: candidate.start,
      end: candidate.end,
      risk: riskFromScore(score),
      score,
      reasons: found.map((signal) => signal.id),
    });
  }

  // Email addresses: a brand name at a free mailbox is a classic lure.
  const emailRe = new RegExp(EMAIL_RE.source, "gi");
  for (const match of canonical.matchAll(emailRe)) {
    const email = match[0];
    const at = email.lastIndexOf("@");
    if (at < 0) continue;
    const domain = email.slice(at + 1).toLowerCase();
    const start = match.index ?? 0;
    const end = start + email.length;

    if (mentionedBrands.length > 0 && isFreeMailDomain(domain)) {
      record(
        { id: "link.free_mail", severity: "high", weight: 18, detail: email },
        start,
        end,
      );
    }

    for (const brand of mentionedBrands) {
      if (isOfficialDomain(domain, brand.domains)) continue;
      if (brand.tokens.some((token) => domain.includes(token))) {
        record(
          { id: "link.brand_mismatch", severity: "critical", weight: 30, detail: email },
          start,
          end,
        );
        break;
      }
    }
  }

  const signals: Signal[] = [...aggregated.values()].map((entry) => ({
    id: entry.id,
    category: "link",
    severity: entry.severity,
    weight: entry.weight,
    hits: entry.hits,
    spans: entry.spans,
  }));

  return { urls, signals, hasLink: urls.length > 0 };
}
