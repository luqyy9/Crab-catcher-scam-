import { categoryLabel, signalCopy } from "../signal-copy";
import type { Lang, RiskLevel, Signal, UrlReport } from "./types";

const OPENERS: Record<Lang, Record<RiskLevel, string>> = {
  en: {
    high: "This message has the hallmarks of a phishing scam. Do not reply, do not click anything, and do not send money or codes.",
    medium: "Parts of this message look suspicious. Treat it as unverified until you confirm it through an official channel.",
    low: "No strong scam indicators were found. That is not a guarantee of safety, so stay careful with anything unexpected.",
  },
  ms: {
    high: "Mesej ini mempunyai ciri-ciri penipuan pancingan data. Jangan balas, jangan klik apa-apa, dan jangan hantar wang atau kod.",
    medium: "Sebahagian mesej ini kelihatan mencurigakan. Anggap ia belum disahkan sehingga anda menyemaknya melalui saluran rasmi.",
    low: "Tiada petunjuk penipuan yang kuat ditemui. Ini bukan jaminan keselamatan, jadi berhati-hati dengan apa-apa yang tidak dijangka.",
  },
};

export function buildSummary(
  lang: Lang,
  level: RiskLevel,
  signals: Signal[],
  urls: UrlReport[],
): string {
  const opener = OPENERS[lang][level];
  const all = [...new Set(signals.map((signal) => signal.category))].filter(
    (category) => category !== "text" && category !== "grammar" && category !== "scenario",
  );
  // Only talk about links when a real address was found, not when the message
  // merely says "click here".
  const meaningful = all.filter((category) => category !== "link" || urls.length > 0);

  // Name the actual scam pattern when one was recognised: "OTP theft" is far
  // more useful than the generic "scam pattern" category label.
  const scenarioTitles = signals
    .filter((signal) => signal.category === "scenario")
    .map((signal) => signalCopy(signal.id, lang).title);

  const categories =
    scenarioTitles.length > 0
      ? scenarioTitles.slice(0, 3)
      : (meaningful.length > 0 ? meaningful : all)
          .slice(0, 3)
          .map((category) => categoryLabel(category, lang).toLowerCase());

  if (categories.length === 0) {
    return opener;
  }

  const joiner = lang === "en" ? ", " : ", ";
  const label = lang === "en" ? "Main concerns" : "Kebimbangan utama";
  const suffix = urls.length > 0
    ? lang === "en"
      ? ` ${urls.length} link${urls.length > 1 ? "s" : ""} found in the message.`
      : ` ${urls.length} pautan ditemui dalam mesej.`
    : "";

  return `${opener} ${label}: ${categories.join(joiner)}.${suffix}`;
}

const STEPS: Record<Lang, Record<string, string>> = {
  en: {
    official: "Open the organisation's official app, or type its address yourself in the browser. Never use the link in the message.",
    call: "Look up the organisation's official phone number on its website and call it to confirm the message is real.",
    neverShare: "Never share a password, OTP/TAC or card number. No bank or agency will ever ask for them by message.",
    neverTransfer: "Do not transfer money to someone you only know through a message. Call them on a number you already have for them and confirm in person.",
    noFee: "Do not pay any fee to receive a prize, refund or parcel. Genuine refunds never require an upfront payment.",
    previewLink: "Long-press or hover over the link to preview the real address, then compare it character by character with the official domain.",
    verifyClaim: "Check the claim independently: search the organisation's official site or call them about the offer or prize.",
    report: "Report the message to the organisation and, in Malaysia, to the NSRC at 997.",
  },
  ms: {
    official: "Buka aplikasi rasmi organisasi, atau taip alamatnya sendiri dalam pelayar. Jangan sekali-kali guna pautan dalam mesej.",
    call: "Cari nombor telefon rasmi organisasi di laman webnya dan hubungi untuk mengesahkan mesej itu benar.",
    neverShare: "Jangan kongsi kata laluan, OTP/TAC atau nombor kad. Tiada bank atau agensi akan memintanya melalui mesej.",
    neverTransfer: "Jangan pindahkan wang kepada seseorang yang anda kenali hanya melalui mesej. Hubungi mereka di nombor yang anda sudah ada dan sahkan secara terus.",
    noFee: "Jangan bayar apa-apa yuran untuk menerima hadiah, bayaran balik atau bungkusan. Bayaran balik sebenar tidak memerlukan bayaran pendahuluan.",
    previewLink: "Tekan lama atau halakan kursor pada pautan untuk melihat alamat sebenar, kemudian bandingkan aksara demi aksara dengan domain rasmi.",
    verifyClaim: "Semak dakwaan itu secara bebas: cari di laman rasmi organisasi atau hubungi mereka tentang tawaran atau hadiah itu.",
    report: "Laporkan mesej itu kepada organisasi dan, di Malaysia, kepada NSRC di 997.",
  },
};

export function buildVerificationSteps(lang: Lang, signals: Signal[], urls: UrlReport[]): string[] {
  const steps = new Set<string>();
  const table = STEPS[lang];
  const hasCategory = (category: string) => signals.some((signal) => signal.category === category);

  steps.add(table.official);
  if (urls.length > 0) steps.add(table.previewLink);
  if (hasCategory("credential")) steps.add(table.neverShare);
  if (hasCategory("payment") || signals.some((signal) => signal.id === "scenario.money_transfer")) {
    steps.add(table.neverTransfer);
  }
  if (hasCategory("payment")) steps.add(table.noFee);
  if (hasCategory("too_good")) steps.add(table.verifyClaim);
  if (hasCategory("impersonation") || hasCategory("threat")) steps.add(table.call);
  steps.add(table.report);

  return [...steps].slice(0, 6);
}

export function buildIfScammed(lang: Lang, signals: Signal[] = []): string[] {
  const hasCategory = (category: string) => signals.some((signal) => signal.category === category);
  const extra: string[] = [];

  if (hasCategory("credential") || signals.some((signal) => signal.id === "scenario.otp_theft")) {
    extra.push(
      lang === "ms"
        ? "Jika anda telah berkongsi OTP, TAC atau kata laluan, hubungi bank anda SEKARANG dan minta akaun dalam talian dibekukan."
        : "If you shared an OTP, TAC or password, call your bank NOW and ask them to freeze your online banking.",
    );
  }
  if (hasCategory("payment")) {
    extra.push(
      lang === "ms"
        ? "Laporkan pemindahan itu kepada bank anda dengan segera; laporan pantas mungkin membolehkan wang ditarik balik."
        : "Report the transfer to your bank immediately; a fast report may allow the payment to be recalled.",
    );
  }

  const base =
    lang === "ms"
      ? [
          "Hubungi bank anda dengan segera untuk menyekat kad atau akaun.",
          "Laporkan kepada Pusat Tindak Balas Penipuan Kebangsaan (NSRC) di 997.",
          "Tukar kata laluan anda dan aktifkan pengesahan dua faktor.",
          "Simpan mesej dan tangkapan skrin sebagai bukti untuk laporan polis.",
        ]
      : [
          "Call your bank immediately to freeze the card or account.",
          "Report to the National Scam Response Centre (NSRC) at 997.",
          "Change your passwords and turn on two-factor authentication.",
          "Keep the message and screenshots as evidence for a police report.",
        ];

  return [...extra, ...base].slice(0, 5);
}
