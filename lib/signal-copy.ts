import type { Lang } from "./detection/types";

export interface Copy {
  title: string;
  why: string;
}

type Entry = Record<Lang, Copy>;

/**
 * Human-readable explanation for every signal id the engine can emit.
 * Kept next to the rules so a new rule cannot ship without an explanation.
 */
export const SIGNAL_COPY: Record<string, Entry> = {
  "urgency.language": {
    en: {
      title: "Urgency and pressure",
      why: "Countdowns and phrases like 'within 2 hours' exist to stop you from pausing and checking whether the sender is real. Genuine organisations rarely impose a deadline measured in hours.",
    },
    ms: {
      title: "Desakan masa dan tekanan",
      why: "Had masa seperti 'dalam 2 jam' digunakan supaya anda tidak sempat berhenti dan menyemak sama ada pengirim itu sahih. Organisasi sebenar jarang menetapkan had masa dalam beberapa jam.",
    },
  },
  "threat.consequence": {
    en: {
      title: "Threat of loss or punishment",
      why: "Threatening to suspend, block, fine or take legal action is a fear tactic. It pushes you to act before you think, which is exactly what the scammer wants.",
    },
    ms: {
      title: "Ancaman kehilangan atau hukuman",
      why: "Ancaman untuk menggantung, menyekat, mendenda atau mengambil tindakan undang-undang ialah taktik menakutkan. Ia mendesak anda bertindak sebelum berfikir, iaitu tepat apa yang penipu mahu.",
    },
  },
  "credential.request": {
    en: {
      title: "Asks for account or identity verification",
      why: "Banks, e-wallets and government agencies never ask you to confirm a password, PIN, OTP/TAC, card number or IC number through a link or chat message.",
    },
    ms: {
      title: "Meminta pengesahan akaun atau identiti",
      why: "Bank, e-dompet dan agensi kerajaan tidak pernah meminta anda mengesahkan kata laluan, PIN, OTP/TAC, nombor kad atau nombor IC melalui pautan atau mesej chat.",
    },
  },
  "payment.request": {
    en: {
      title: "Requests payment or financial details",
      why: "Fees to release a parcel, claim a prize or unlock a refund are a classic advance-fee scam. Gift cards and crypto are requested because they cannot be reversed.",
    },
    ms: {
      title: "Meminta bayaran atau maklumat kewangan",
      why: "Bayaran untuk melepaskan bungkusan, menuntut hadiah atau membuka bayaran balik ialah penipuan yuran pendahuluan. Kad hadiah dan kripto diminta kerana transaksinya tidak boleh dibatalkan.",
    },
  },
  "too_good.offer": {
    en: {
      title: "Too-good-to-be-true offer",
      why: "Prizes you never entered for, refunds you never applied for, and jobs paying large daily rates for no experience are bait. If it were real, it would not arrive as an unsolicited message.",
    },
    ms: {
      title: "Tawaran yang terlalu baik untuk dipercayai",
      why: "Hadiah yang anda tidak sertai, bayaran balik yang anda tidak mohon, dan kerja bergaji besar tanpa pengalaman ialah umpan. Jika benar, ia tidak akan datang sebagai mesej tanpa diminta.",
    },
  },
  "secrecy.request": {
    en: {
      title: "Asks you to keep it secret",
      why: "Legitimate staff never ask you to hide a transaction from family or bank officers. Secrecy isolates you from the people who would spot the scam.",
    },
    ms: {
      title: "Meminta anda merahsiakannya",
      why: "Kakitangan sah tidak pernah meminta anda menyembunyikan transaksi daripada keluarga atau pegawai bank. Kerahsiaan mengasingkan anda daripada orang yang boleh mengesan penipuan.",
    },
  },
  "channel.switch": {
    en: {
      title: "Pushes you to another chat app",
      why: "Moving the conversation to WhatsApp or Telegram takes it away from the platform's fraud detection and leaves no trace you can report.",
    },
    ms: {
      title: "Mendesak anda bertukar aplikasi chat",
      why: "Memindahkan perbualan ke WhatsApp atau Telegram menjauhkannya daripada pengesanan penipuan platform dan meninggalkan kesan yang sukar dilaporkan.",
    },
  },
  "attachment.mention": {
    en: {
      title: "Mentions an attachment",
      why: "Unexpected invoices, receipts and documents are a common way to deliver malware or a fake login form.",
    },
    ms: {
      title: "Menyebut lampiran",
      why: "Invois, resit dan dokumen yang tidak dijangka sering digunakan untuk menyebarkan perisian hasad atau borang log masuk palsu.",
    },
  },
  "attachment.dangerous_ext": {
    en: {
      title: "Executable or archive file",
      why: "Files ending in .exe, .apk, .js or .zip can install software on your device. Never open one from an unexpected message.",
    },
    ms: {
      title: "Fail boleh laku atau arkib",
      why: "Fail berakhir dengan .exe, .apk, .js atau .zip boleh memasang perisian pada peranti anda. Jangan buka fail daripada mesej yang tidak dijangka.",
    },
  },
  "contact.foreign_number": {
    en: {
      title: "Foreign contact number",
      why: "A foreign number claiming to be a local bank or agency is unusual. Official support lines use local numbers you can verify on the organisation's website.",
    },
    ms: {
      title: "Nombor telefon luar negara",
      why: "Nombor luar negara yang mendakwa sebagai bank atau agensi tempatan adalah luar biasa. Talian sokongan rasmi menggunakan nombor tempatan yang boleh anda sahkan di laman web organisasi.",
    },
  },
  "link.click_prompt": {
    en: {
      title: "Tells you to click a link",
      why: "The message wants you to leave the conversation and land on a page the sender controls. That page is usually a copy of a real login screen.",
    },
    ms: {
      title: "Menyuruh anda klik pautan",
      why: "Mesej itu mahu anda meninggalkan perbualan dan membuka halaman yang dikawal pengirim. Halaman itu biasanya salinan skrin log masuk sebenar.",
    },
  },
  "link.brand_mismatch": {
    en: {
      title: "Link is not the organisation's official domain",
      why: "The message names a well-known organisation but the address belongs to someone else. Real banks and agencies only use their own registered domains.",
    },
    ms: {
      title: "Pautan bukan domain rasmi organisasi",
      why: "Mesej menyebut organisasi terkenal tetapi alamat itu milik pihak lain. Bank dan agensi sebenar hanya menggunakan domain berdaftar mereka sendiri.",
    },
  },
  "link.lookalike": {
    en: {
      title: "Link imitates a well-known domain",
      why: "The address is one or two characters away from a real brand domain. Swapping a letter or a digit is enough to fool a quick glance.",
    },
    ms: {
      title: "Pautan meniru domain terkenal",
      why: "Alamat itu hanya berbeza satu atau dua aksara daripada domain jenama sebenar. Menukar satu huruf atau angka sudah cukup untuk memperdaya pandangan sepintas lalu.",
    },
  },
  "link.suspicious_host_words": {
    en: {
      title: "Bait words in the address",
      why: "Words like 'secure', 'verify', 'login' or 'refund' inside the address are chosen to look reassuring. They are not proof of anything.",
    },
    ms: {
      title: "Kata umpan dalam alamat",
      why: "Perkataan seperti 'secure', 'verify', 'login' atau 'refund' dalam alamat dipilih supaya kelihatan meyakinkan. Ia bukan bukti apa-apa.",
    },
  },
  "link.shortener": {
    en: {
      title: "Shortened link hides its destination",
      why: "A link shortener means you cannot see where you will actually land until it is too late.",
    },
    ms: {
      title: "Pautan pendek menyembunyikan destinasinya",
      why: "Pemendek pautan bermaksud anda tidak dapat melihat ke mana anda akan dibawa sehingga terlambat.",
    },
  },
  "link.ip_host": {
    en: {
      title: "Link points to a raw IP address",
      why: "No bank or government service asks you to log in at a numbered address like 203.0.113.5. This is a strong sign of a throwaway server.",
    },
    ms: {
      title: "Pautan menuju ke alamat IP mentah",
      why: "Tiada bank atau perkhidmatan kerajaan meminta anda log masuk di alamat bernombor seperti 203.0.113.5. Ini tanda kuat pelayan sementara.",
    },
  },
  "link.userinfo": {
    en: {
      title: "Link disguises its real destination",
      why: "Everything before the '@' is ignored by browsers. A link like maybank.com@evil.xyz actually goes to evil.xyz.",
    },
    ms: {
      title: "Pautan menyembunyikan destinasi sebenar",
      why: "Semua yang sebelum '@' diabaikan oleh pelayar. Pautan seperti maybank.com@evil.xyz sebenarnya menuju ke evil.xyz.",
    },
  },
  "link.punycode": {
    en: {
      title: "Link uses lookalike characters",
      why: "The address contains encoded characters that can render as a different letter. 'xn--' in a domain is a common way to fake a brand name.",
    },
    ms: {
      title: "Pautan menggunakan aksara yang menyerupai",
      why: "Alamat itu mengandungi aksara berkod yang boleh dipaparkan sebagai huruf lain. 'xn--' dalam domain ialah cara biasa untuk memalsukan nama jenama.",
    },
  },
  "link.suspicious_tld": {
    en: {
      title: "Unusual or cheap domain ending",
      why: "Scams disproportionately use cheap or free endings such as .top, .xyz, .click and .icu. A real bank would not move its login page there.",
    },
    ms: {
      title: "Akhiran domain luar biasa atau murah",
      why: "Penipuan kerap menggunakan akhiran murah atau percuma seperti .top, .xyz, .click dan .icu. Bank sebenar tidak akan memindahkan halaman log masuknya ke sana.",
    },
  },
  "link.medium_tld": {
    en: {
      title: "Generic domain ending",
      why: "Generic endings are not proof of fraud, but combined with other signals they suggest a disposable domain.",
    },
    ms: {
      title: "Akhiran domain generik",
      why: "Akhiran generik bukan bukti penipuan, tetapi digabungkan dengan petunjuk lain ia mencadangkan domain sekali guna.",
    },
  },
  "link.no_https": {
    en: {
      title: "Link is not encrypted",
      why: "The address uses plain http. Anything you type on that page can be read in transit.",
    },
    ms: {
      title: "Pautan tidak disulitkan",
      why: "Alamat itu menggunakan http biasa. Apa sahaja yang anda taip di halaman itu boleh dibaca semasa dalam perjalanan.",
    },
  },
  "link.excessive_subdomains": {
    en: {
      title: "Real domain is buried in subdomains",
      why: "Padding the front of an address makes the fake part look like the important part.",
    },
    ms: {
      title: "Domain sebenar ditimbus dalam subdomain",
      why: "Menambah bahagian di hadapan alamat membuat bahagian palsu kelihatan seperti bahagian penting.",
    },
  },
  "link.hyphens": {
    en: {
      title: "Unusual number of hyphens",
      why: "Official domains rarely stack hyphens. Combinations like 'secure-login-verify' are built to read like a process.",
    },
    ms: {
      title: "Tanda sempang yang luar biasa",
      why: "Domain rasmi jarang menggunakan banyak sempang. Gabungan seperti 'secure-login-verify' dibina supaya kelihatan seperti satu proses.",
    },
  },
  "link.port": {
    en: {
      title: "Non-standard network port",
      why: "Public websites use ports 80 and 443. A numbered port usually means a temporary server set up for the campaign.",
    },
    ms: {
      title: "Port rangkaian bukan standard",
      why: "Laman web awam menggunakan port 80 dan 443. Port bernombor biasanya bermaksud pelayan sementara yang disediakan untuk kempen itu.",
    },
  },
  "link.long": {
    en: {
      title: "Unusually long address",
      why: "Long addresses make it hard to notice the real domain, especially on a phone screen.",
    },
    ms: {
      title: "Alamat luar biasa panjang",
      why: "Alamat panjang menyukarkan anda melihat domain sebenar, terutamanya pada skrin telefon.",
    },
  },
  "link.free_mail": {
    en: {
      title: "Brand name sent from a free mailbox",
      why: "A bank or agency writing from gmail.com, yahoo.com or outlook.com is almost certainly not that organisation.",
    },
    ms: {
      title: "Nama jenama dihantar dari mel percuma",
      why: "Bank atau agensi yang menulis dari gmail.com, yahoo.com atau outlook.com hampir pasti bukan organisasi itu.",
    },
  },
  "text.homoglyph": {
    en: {
      title: "Hidden or lookalike characters",
      why: "The message mixes alphabets or contains invisible characters. This is used to slip fake domains past filters and human eyes.",
    },
    ms: {
      title: "Aksara tersembunyi atau menyerupai",
      why: "Mesej mencampurkan abjad atau mengandungi aksara halimunan. Ini digunakan untuk melepaskan domain palsu melepasi penapis dan mata manusia.",
    },
  },
  "grammar.caps": {
    en: {
      title: "Written in capitals",
      why: "Shouting capitals are used to create alarm. Real service notices are written calmly.",
    },
    ms: {
      title: "Ditulis dengan huruf besar",
      why: "Huruf besar digunakan untuk menimbulkan panik. Notis perkhidmatan sebenar ditulis dengan tenang.",
    },
  },
  "grammar.punctuation": {
    en: {
      title: "Excessive punctuation",
      why: "Runs of exclamation marks are a marketing and scam habit, not how a bank writes to a customer.",
    },
    ms: {
      title: "Tanda baca berlebihan",
      why: "Tanda seru yang berturut-turut ialah tabiat pemasaran dan penipu, bukan cara bank menulis kepada pelanggan.",
    },
  },
  "impersonation.brand_no_link": {
    en: {
      title: "Claims to be a known organisation",
      why: "The message names a real organisation and asks for verification, but gives no verifiable official channel. Contact them using details you look up yourself.",
    },
    ms: {
      title: "Mendakwa sebagai organisasi terkenal",
      why: "Mesej menyebut organisasi sebenar dan meminta pengesahan, tetapi tidak memberikan saluran rasmi yang boleh disahkan. Hubungi mereka menggunakan butiran yang anda cari sendiri.",
    },
  },
  "impersonation.generic_bank": {
    en: {
      title: "Vague reference to 'your bank'",
      why: "Your real bank knows its own name and usually addresses you by name. Generic wording lets the same message be sent to thousands of people.",
    },
    ms: {
      title: "Rujukan kabur kepada 'bank anda'",
      why: "Bank sebenar anda tahu namanya sendiri dan biasanya menyapa anda dengan nama. Wording generik membolehkan mesej sama dihantar kepada ribuan orang.",
    },
  },
  "impersonation.brand_claim": {
    en: {
      title: "Uses a brand name to build trust",
      why: "Naming a trusted organisation is the cheapest way to borrow its credibility. Trust the domain, not the logo in the text.",
    },
    ms: {
      title: "Menggunakan nama jenama untuk membina kepercayaan",
      why: "Menyebut organisasi yang dipercayai ialah cara termurah meminjam kredibilitinya. Percaya pada domain, bukan logo dalam teks.",
    },
  },
};

export const CATEGORY_COPY: Record<string, Record<Lang, string>> = {
  link: { en: "Links", ms: "Pautan" },
  impersonation: { en: "Impersonation", ms: "Penyamaran" },
  credential: { en: "Credentials", ms: "Kelayakan akaun" },
  threat: { en: "Threats", ms: "Ancaman" },
  urgency: { en: "Urgency", ms: "Desakan masa" },
  payment: { en: "Payment", ms: "Bayaran" },
  too_good: { en: "Too good to be true", ms: "Terlalu baik" },
  secrecy: { en: "Secrecy", ms: "Kerahsiaan" },
  attachment: { en: "Attachments", ms: "Lampiran" },
  channel: { en: "Channel switching", ms: "Pertukaran saluran" },
  contact: { en: "Contact details", ms: "Butiran hubungan" },
  grammar: { en: "Writing style", ms: "Gaya penulisan" },
  text: { en: "Text tricks", ms: "Tipu teks" },
};

export function signalCopy(id: string, lang: Lang): Copy {
  const entry = SIGNAL_COPY[id];
  if (entry) return entry[lang];
  return { title: id, why: "" };
}

export function categoryLabel(category: string, lang: Lang): string {
  return CATEGORY_COPY[category]?.[lang] ?? category;
}
