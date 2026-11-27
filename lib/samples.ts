import type { Lang } from "./detection/types";

export interface Sample {
  id: string;
  label: Record<Lang, string>;
  text: Record<Lang, string>;
}

export const SAMPLES: Sample[] = [
  {
    id: "bank",
    label: { en: "Bank suspension", ms: "Akaun bank digantung" },
    text: {
      en: "URGENT: Your Maybank account will be suspended within 2 hours. Click here to verify your account: http://maybank-secure-verify.xyz/login",
      ms: "SEGERA: Akaun Maybank anda akan digantung dalam masa 2 jam. Klik di sini untuk mengesahkan akaun anda: http://maybank-secure-verify.xyz/login",
    },
  },
  {
    id: "parcel",
    label: { en: "Parcel fee", ms: "Yuran bungkusan" },
    text: {
      en: "Pos Malaysia: Your parcel is held at customs. Pay the RM4.50 clearance fee within 24 hours at https://posmy-parcel.top/pay or the item will be returned to sender.",
      ms: "Pos Malaysia: Bungkusan anda ditahan di kastam. Bayar yuran pelepasan RM4.50 dalam masa 24 jam di https://posmy-parcel.top/pay atau barang akan dipulangkan kepada pengirim.",
    },
  },
  {
    id: "job",
    label: { en: "Job offer", ms: "Tawaran kerja" },
    text: {
      en: "Congratulations! You have been selected for a part-time job earning RM300 per day. No experience needed. Contact our HR on WhatsApp +60123456789 for details. Do not tell anyone yet.",
      ms: "Tahniah! Anda telah dipilih untuk kerja sambilan dengan pendapatan RM300 sehari. Tiada pengalaman diperlukan. Hubungi HR kami di WhatsApp +60123456789 untuk maklumat lanjut. Jangan beritahu sesiapa lagi.",
    },
  },
  {
    id: "tax",
    label: { en: "Tax refund", ms: "Bayaran balik cukai" },
    text: {
      en: "LHDN: You have an unpaid tax refund of RM2,480. Claim it at http://lhdn-refund.my-claim.click/verify by entering your IC number and bank account details before 30 November.",
      ms: "LHDN: Anda mempunyai bayaran balik cukai RM2,480 yang belum dituntut. Tuntut di http://lhdn-refund.my-claim.click/verify dengan memasukkan nombor kad pengenalan dan butiran akaun bank sebelum 30 November.",
    },
  },
  {
    id: "chat",
    label: { en: "Scam chat", ms: "Chat penipuan" },
    text: {
      en: [
        "[27/11/2026, 10:31 PM] Sarah Lim (+60 11-2233 4455): Hi dear, I'm from Shopee customer service. Your parcel is stuck at customs and needs a clearance fee.",
        "[27/11/2026, 10:32 PM] Sarah Lim: Please transfer RM85 to Maybank 512345678901 (Tan Mei Ling) and send me the receipt.",
        "[27/11/2026, 10:34 PM] Sarah Lim: After that I will send the refund. Don't tell anyone about this yet, our system is under audit.",
        "[27/11/2026, 10:35 PM] Sarah Lim: Also send me the 6-digit code you receive by SMS so I can verify your account.",
      ].join("\n"),
      ms: [
        "[27/11/2026, 10:31 PTG] Sarah Lim (+60 11-2233 4455): Hai sayang, saya dari khidmat pelanggan Shopee. Bungkusan anda tersangkut di kastam dan perlu bayar yuran pelepasan.",
        "[27/11/2026, 10:32 PTG] Sarah Lim: Sila pindahkan RM85 ke Maybank 512345678901 (Tan Mei Ling) dan hantar resit kepada saya.",
        "[27/11/2026, 10:34 PTG] Sarah Lim: Selepas itu saya akan hantar bayaran balik. Jangan beritahu sesiapa lagi, sistem kami sedang diaudit.",
        "[27/11/2026, 10:35 PTG] Sarah Lim: Hantar juga kod 6 digit yang anda terima melalui SMS supaya saya boleh sahkan akaun anda.",
      ].join("\n"),
    },
  },
  {
    id: "invest",
    label: { en: "Investment offer", ms: "Tawaran pelaburan" },
    text: {
      en: "Hi, I'm Aina from the VIP trading group. Our members make a guaranteed 18% profit every week with zero risk. Minimum capital is only RM500. Top up today and I will add you to our Telegram group where our mentor shares signals. Send to DuitNow 0123456789. Slots are limited.",
      ms: "Hai, saya Aina dari kumpulan trading VIP. Ahli kami mendapat keuntungan 18% dijamin setiap minggu tanpa risiko. Modal minimum hanya RM500. Top up hari ini dan saya akan masukkan anda ke kumpulan Telegram kami. Hantar ke DuitNow 0123456789. Tempat terhad.",
    },
  },
  {
    id: "safe",
    label: { en: "Normal message", ms: "Mesej biasa" },
    text: {
      en: "Hi, this is Aisyah from the IIUM library. Your reserved book is ready for pickup at counter 2 until Friday. No payment is needed, just bring your matric card.",
      ms: "Hai, ini Aisyah dari perpustakaan UIAM. Buku tempahan anda sedia untuk diambil di kaunter 2 sehingga Jumaat. Tiada bayaran diperlukan, bawa kad matrik sahaja.",
    },
  },
];
