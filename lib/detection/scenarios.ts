import type { ChatInfo } from "./chat";
import type { ScenarioHit, Severity, Signal, SignalCategory, Span } from "./types";

/**
 * Scenario detection.
 *
 * Single-phrase lexicons miss the most common modern scams because the
 * incriminating part is spread across the conversation: "transfer RM500",
 * "send me the code", "18% every week". Each rule below requires several
 * independent pieces of evidence at once, which keeps false positives low
 * while catching chat-style fraud that no single keyword would catch.
 */

interface Match {
  text: string;
  start: number;
  end: number;
}

interface OneOf {
  chat?: boolean;
  link?: boolean;
  pattern?: RegExp;
  category?: SignalCategory;
}

interface ScenarioDef {
  id: string;
  severity: Severity;
  weight: number;
  confidence?: ScenarioHit["confidence"];
  /** Every pattern must match. */
  all?: RegExp[];
  /** At least one pattern must match. */
  any?: RegExp[];
  /** Signals of these categories must already be present. */
  categories?: SignalCategory[];
  /** At least one of these conditions must hold. */
  oneOf?: OneOf[];
  /** Extra note used only for ordering in the UI. */
  priority?: number;
}

function firstMatch(re: RegExp, text: string): Match | null {
  const match = re.exec(text);
  if (!match) return null;
  const value = match[0];
  const start = match.index;
  return { text: value.trim(), start, end: start + value.length };
}

const AMOUNT = /\b(?:rm|myr)\s?\d[\d,]*(?:\.\d{2})?\b|\b\d{2,6}\s?(?:ringgit|myr)\b/i;
const ACCOUNT_NUMBER = /\b\d(?:[ -]?\d){7,16}\b/;

const SCENARIOS: ScenarioDef[] = [
  {
    id: "scenario.money_mule",
    severity: "critical",
    weight: 30,
    priority: 100,
    any: [
      /\b(?:use|gunakan|guna)\b[^\n]{0,30}\b(?:your|anda|awak)\b[^\n]{0,20}\b(?:account|akaun)\b[^\n]{0,50}\b(?:receive|terima|transfer|duit|money|bayaran|payment)\b/i,
      /\b(?:keldai akaun|money mule|akaun mule)\b/i,
      /\b(?:receive|terima)\b[^\n]{0,35}\b(?:money|duit|payment|bayaran)\b[^\n]{0,50}\b(?:transfer|pindah|send|hantar|forward)\b/i,
    ],
  },
  {
    id: "scenario.safe_account",
    severity: "critical",
    weight: 28,
    priority: 98,
    any: [
      /\b(?:safe account|akaun selamat|bank negara|bnm|pdrm|police|polis|officer|pegawai)\b[^\n]{0,90}\b(?:transfer|pindah|move|hantar)\b[^\n]{0,50}\b(?:money|duit|funds|wang|account|akaun)\b/i,
      /\b(?:money laundering|pengubahan wang haram|drug|dadah|arrest|tangkap|wanted|dikehendaki)\b[^\n]{0,110}\b(?:transfer|pindah|pay|bayar|settle|selesaikan|deposit)\b/i,
      /\b(?:your|anda)\b[^\n]{0,30}\b(?:account|akaun)\b[^\n]{0,30}\b(?:is|telah)?\s*(?:compromised|digodam|used for|digunakan untuk)\b[^\n]{0,60}\b(?:transfer|pindah|move)\b/i,
    ],
  },
  {
    id: "scenario.otp_theft",
    severity: "critical",
    weight: 28,
    priority: 95,
    all: [
      /\b(?:otp|tac|one[- ]time (?:password|code|pin)|kod (?:otp|tac|pengesahan)|verification code|security code)\b|\b(?:code|kod)\b[^\n]{0,40}\b(?:sms|receive|received|terima|diterima|whatsapp)\b/i,
    ],
    any: [
      /\b(?:send|share|give|forward|tell|bagi|hantar|kongsikan|beritahu|minta|sahkan)\b[^\n]{0,45}\b(?:otp|tac|code|kod|pin)\b/i,
      /\b(?:otp|tac|code|kod|pin)\b[^\n]{0,45}\b(?:send|share|give|forward|bagi|hantar|kongsikan|beritahu|minta)\b/i,
    ],
  },
  {
    id: "scenario.investment",
    severity: "high",
    weight: 22,
    priority: 80,
    any: [
      /\b(?:profit|return|untung|keuntungan|pulangan|interest|dividend|faedah|yield)\b[^\n]{0,30}\d{1,3}\s?%/i,
      /\d{1,3}\s?%[^\n]{0,30}\b(?:per|se)?\s*(?:day|week|month|daily|weekly|monthly|hari|minggu|bulan|dijamin|guaranteed)\b/i,
      /\b(?:guaranteed|dijamin|confirm(?:ed)?)\b[^\n]{0,40}\b(?:profit|return|untung|keuntungan|pulangan|income|pendapatan)\b/i,
      /\b(?:double|gandakan|triple)\b[^\n]{0,25}\b(?:money|duit|modal|investment|pelaburan|capital)\b/i,
      /\b(?:invest|investment|pelaburan|trading|forex|crypto|bitcoin|gold|emas)\b[^\n]{0,55}\b(?:profit|untung|return|pulangan|passive income|financial freedom)\b/i,
    ],
  },
  {
    id: "scenario.money_transfer",
    severity: "high",
    weight: 20,
    priority: 70,
    any: [
      /\b(?:transfer|bank[- ]?in|wire|pindah(?:kan)?|masukkan|hantar|send)\b[^\n]{0,50}(?:rm\s?\d|myr\s?\d|\bduit\b|\bwang\b|\bmoney\b|\bcash\b|\bbayaran\b|\bpayment\b|\b\d{2,6}\b)/i,
      /\b(?:pay|bayar|transfer|pindah|hantar|send)\b[^\n]{0,25}\b(?:rm|myr)\s?\d[\d,]*(?:\.\d{2})?\b[^\n]{0,35}\b(?:to|into|ke|kepada)\b[^\n]{0,25}\b(?:account|akaun|bank|duitnow|tng|ewallet|this|ini|saya|me)\b/i,
      /\b(?:pinjam|borrow|lend)\b[^\n]{0,30}\b(?:rm|myr|\d{2,6})\b/i,
      /\b(?:duitnow|maybank2u|cimb clicks|tng|touch n go|e-?wallet)\b[^\n]{0,45}\b(?:transfer|hantar|send|pindah|bayar|pay)\b/i,
    ],
    oneOf: [{ chat: true }, { pattern: ACCOUNT_NUMBER }, { link: true }],
  },
  {
    id: "scenario.overpayment",
    severity: "high",
    weight: 20,
    priority: 72,
    any: [
      /\b(?:sent|transferred|pindah|hantar|masuk)\b[^\n]{0,45}\b(?:by mistake|instead|accidentally|terlebih|tersalah|wrong|salah|too much)\b[^\n]{0,70}\b(?:return|refund|send back|pulangkan|bayar balik|hantar balik)\b/i,
      /\b(?:overpaid|terlebih bayar)\b[^\n]{0,70}\b(?:refund|return|pulangkan|bayar balik)\b/i,
      /\b(?:i|saya)\b[^\n]{0,25}\b(?:accidentally|tersilap|tersalah)\b[^\n]{0,55}\b(?:transfer(?:red)?|pindah|hantar)\b[^\n]{0,50}\b(?:back|balik|return|pulangkan)\b/i,
    ],
  },
  {
    id: "scenario.sextortion",
    severity: "high",
    weight: 22,
    priority: 68,
    any: [
      /\b(?:photos?|videos?|gambar|video)\b[^\n]{0,45}\b(?:share|leak|sebar|viral|expose|tunjuk)\b[^\n]{0,70}\b(?:pay|bayar|money|duit|bitcoin|crypto)\b/i,
      /\b(?:i have|saya ada)\b[^\n]{0,35}\b(?:your|anda)\b[^\n]{0,25}\b(?:photos?|videos?|gambar|video|recording|rakaman)\b[^\n]{0,70}\b(?:pay|bayar|money|duit|transfer|pindah)\b/i,
    ],
  },
  {
    id: "scenario.job_task",
    severity: "high",
    weight: 20,
    priority: 75,
    any: [
      /\b(?:like|subscribe|review|task|order|complete)\b[^\n]{0,50}\b(?:paid|payment|commission|earn|komisen|bayaran|upah|income|pendapatan)\b/i,
      /\b(?:top[- ]?up|deposit|reload|modal)\b[^\n]{0,50}\b(?:unlock|withdraw|task|order|commission|komisen|pengeluaran|withdrawal)\b/i,
      /\b(?:part[- ]?time|sambilan)\b[^\n]{0,60}\b(?:rm|myr|\d{2,4})\b[^\n]{0,25}\b(?:day|hari|daily)\b/i,
      /\b(?:training|material|registration|admin|processing)\s*(?:fee|bayaran|yuran)\b[^\n]{0,60}\b(?:job|kerja|position|post|interview|temuduga)\b/i,
    ],
  },
  {
    id: "scenario.romance",
    severity: "high",
    weight: 20,
    priority: 65,
    any: [
      /\b(?:my love|sayang|honey|darling|sweetheart)\b[^\n]{0,100}\b(?:money|duit|transfer|hospital|visa|flight|ticket|customs|surgery|emergency|pinjam)\b/i,
      /\b(?:fall(?:ing)? in love|love you|met you)\b[^\n]{0,140}\b(?:money|duit|transfer|hospital|visa|flight|ticket|customs|surgery|emergency)\b/i,
      /\b(?:i am|i'm|saya)\b[^\n]{0,30}\b(?:soldier|military|doctor|engineer|oil rig|tentera|pelabur)\b[^\n]{0,80}\b(?:money|duit|transfer|visa|hospital|ticket)\b/i,
    ],
  },
  {
    id: "scenario.loan_fee",
    severity: "high",
    weight: 18,
    priority: 60,
    all: [/\b(?:loan|pinjaman|pembiayaan)\b/i],
    any: [
      /\b(?:fast|quick|instant|approved|approval|segera|mudah|lulus|tanpa|no document|no collateral|blacklist|ctos)\b/i,
    ],
    oneOf: [{ category: "payment" }, { link: true }],
  },
  {
    id: "scenario.parcel_fee",
    severity: "high",
    weight: 16,
    priority: 55,
    all: [/\b(?:parcel|bungkusan|pos malaysia|poslaju|courier|kurier|j&t|dhl|fedex|ninjavan)\b/i],
    any: [
      /\b(?:fee|yuran|bayar|pay|customs|kastam|clearance|pelepasan|held|ditahan|stuck)\b/i,
      /\b(?:deliver(?:y|ed)?|reschedule|address|alamat|not delivered|could not be delivered)\b/i,
    ],
    oneOf: [{ category: "payment" }, { link: true }],
  },
  {
    id: "scenario.utility_bill",
    severity: "high",
    weight: 20,
    priority: 62,
    all: [
      /\b(?:TM|TNB|Telekom|Tenaga Nasional|Unifi|Air Selangor|Syabas|Indah Water|Astro|Maxis|Celcom|Digi|U Mobile)\b/i,
    ],
    any: [
      /\b(?:disk(?:aun)?|discount|rebate|rebat|potongan)\s?\d{1,2}\s?%/i,
      /\bjompay\b/i,
      /\b(?:lawatan|serah(?:kan)?)\b[^\n]{0,20}\bnotis\b/i,
      /\b(?:byr|bayar)\b[^\n]{0,25}\b(?:kod|code)\b/i,
    ],
    oneOf: [{ category: "payment" }],
  },
  {
    id: "scenario.account_takeover",
    severity: "high",
    weight: 18,
    priority: 58,
    any: [
      /\b(?:this is|ini)\b[^\n]{0,25}\b(?:my|saya(?: punya)?)\b[^\n]{0,15}\b(?:new|baru)\b[^\n]{0,15}\b(?:number|nombor|phone|telefon|hp)\b/i,
      /\b(?:lost|hilang)\b[^\n]{0,20}\b(?:phone|telefon|hp|handphone)\b/i,
      /\b(?:whatsapp|account|akaun)\b[^\n]{0,25}\b(?:hacked|kena hack|kena godam|digodam|stolen|hilang|kena curi)\b/i,
    ],
    categories: ["payment"],
  },
  {
    id: "scenario.tech_support",
    severity: "high",
    weight: 20,
    priority: 50,
    any: [
      /\b(?:windows|microsoft|apple|computer|device|phone|komputer|telefon)\b[^\n]{0,50}\b(?:virus|infected|hacked|compromised|technical support|remote access|anydesk|teamviewer|digodam)\b/i,
      /\b(?:virus|malware)\b[^\n]{0,40}\b(?:computer|device|phone|komputer|telefon)\b/i,
    ],
  },
  {
    id: "scenario.crypto_wallet",
    severity: "high",
    weight: 16,
    priority: 45,
    any: [/\b0x[a-fA-F0-9]{40}\b|\bbc1[a-zA-HJ-NP-Z0-9]{25,60}\b/],
  },
  {
    id: "scenario.advance_fee",
    severity: "high",
    weight: 14,
    priority: 40,
    all: [AMOUNT],
    any: [
      /\b(?:pay|bayar|transfer|hantar|send)\b[^\n]{0,40}\b(?:to (?:release|unlock|claim|receive)|untuk (?:melepaskan|membuka|menuntut|menerima))\b/i,
      /\b(?:processing|clearance|customs|admin|service|release)\s+fee\b|\b(?:yuran|fi)\s+(?:pemprosesan|pelepasan|kastam|pentadbiran)\b/i,
    ],
  },
];

function oneOfSatisfied(conditions: OneOf[], text: string, chat: ChatInfo, hasLink: boolean, categories: Set<SignalCategory>): boolean {
  if (conditions.length === 0) return true;
  return conditions.some((condition) => {
    if (condition.chat && chat.isTranscript && chat.messageCount >= 3) return true;
    if (condition.link && hasLink) return true;
    if (condition.category && categories.has(condition.category)) return true;
    if (condition.pattern && condition.pattern.test(text)) return true;
    return false;
  });
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

export function detectScenarios(
  text: string,
  signals: Signal[],
  hasLink: boolean,
  chat: ChatInfo,
): ScenarioHit[] {
  const categories = new Set(signals.map((signal) => signal.category));
  const hits: ScenarioHit[] = [];

  for (const def of SCENARIOS) {
    if (def.categories && !def.categories.every((category) => categories.has(category))) continue;

    const matches: Match[] = [];

    let allOk = true;
    for (const pattern of def.all ?? []) {
      const match = firstMatch(pattern, text);
      if (!match) {
        allOk = false;
        break;
      }
      matches.push(match);
    }
    if (!allOk) continue;

    const anyPatterns = def.any ?? [];
    if (anyPatterns.length > 0) {
      let anyOk = false;
      for (const pattern of anyPatterns) {
        const match = firstMatch(pattern, text);
        if (match) {
          matches.push(match);
          anyOk = true;
        }
      }
      if (!anyOk) continue;
    }

    if (matches.length === 0) continue;
    if (!oneOfSatisfied(def.oneOf ?? [], text, chat, hasLink, categories)) continue;

    const spans: Span[] = matches
      .slice(0, 3)
      .map((match) => ({ start: match.start, end: match.end }))
      .filter((span) => span.end > span.start);

    hits.push({
      id: def.id,
      severity: def.severity,
      weight: def.weight,
      confidence: def.confidence ?? "likely",
      evidence: dedupe(matches.map((match) => match.text.slice(0, 160))).slice(0, 3),
      spans,
    });
  }

  return hits.sort((a, b) => b.weight - a.weight);
}

export function scenarioSignals(hits: ScenarioHit[]): Signal[] {
  return hits.map((hit) => ({
    id: hit.id,
    category: "scenario",
    severity: hit.severity,
    weight: hit.weight,
    hits: hit.evidence,
    spans: hit.spans,
  }));
}
