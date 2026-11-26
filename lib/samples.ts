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
    id: "safe",
    label: { en: "Normal message", ms: "Mesej biasa" },
    text: {
      en: "Hi, this is Aisyah from the IIUM library. Your reserved book is ready for pickup at counter 2 until Friday. No payment is needed, just bring your matric card.",
      ms: "Hai, ini Aisyah dari perpustakaan UIAM. Buku tempahan anda sedia untuk diambil di kaunter 2 sehingga Jumaat. Tiada bayaran diperlukan, bawa kad matrik sahaja.",
    },
  },
];
