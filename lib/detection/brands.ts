export interface Brand {
  key: string;
  /** Names and aliases as they might appear in a message. */
  names: string[];
  /** Official registrable domains. Subdomains of these are accepted. */
  domains: string[];
  /** Lowercase, letters-only tokens used for host lookalike matching. */
  tokens: string[];
}

/**
 * Organisations most commonly impersonated in Malaysian scam messages, plus a
 * few global brands. `domains` is the allowlist: any *other* domain that claims
 * to be one of these is a strong impersonation signal.
 */
export const BRANDS: Brand[] = [
  {
    key: "maybank",
    names: ["Maybank", "Maybank2u", "M2U", "Malayan Banking"],
    domains: ["maybank.com.my", "maybank2u.com.my", "maybank.com", "maybank2u.com"],
    tokens: ["maybank", "maybank2u"],
  },
  {
    key: "cimb",
    names: ["CIMB", "CIMB Clicks", "CIMBClicks"],
    domains: ["cimb.com.my", "cimbclicks.com.my", "cimb.com"],
    tokens: ["cimb", "cimbclicks"],
  },
  {
    key: "rhb",
    names: ["RHB", "RHB Bank", "RHB Now"],
    domains: ["rhbgroup.com", "rhb.com.my", "rhbgroup.com.my"],
    tokens: ["rhb"],
  },
  {
    key: "publicbank",
    names: ["Public Bank", "PublicBank", "PBeBank"],
    domains: ["publicbank.com.my", "pbebank.com"],
    tokens: ["publicbank", "pbebank"],
  },
  {
    key: "bankislam",
    names: ["Bank Islam", "BankIslam"],
    domains: ["bankislam.com.my", "bankislam.com"],
    tokens: ["bankislam"],
  },
  {
    key: "bsn",
    names: ["BSN", "Bank Simpanan Nasional"],
    domains: ["bsn.com.my"],
    tokens: ["bsn"],
  },
  {
    key: "hongleong",
    names: ["Hong Leong", "Hong Leong Bank", "HLB"],
    domains: ["hlb.com.my", "hongleong.com.my"],
    tokens: ["hongleong", "hlb"],
  },
  {
    key: "ambank",
    names: ["AmBank", "AmOnline"],
    domains: ["ambank.com.my"],
    tokens: ["ambank"],
  },
  {
    key: "affin",
    names: ["Affin Bank", "Affin"],
    domains: ["affinbank.com.my", "affin.com.my"],
    tokens: ["affinbank", "affin"],
  },
  {
    key: "bankrakyat",
    names: ["Bank Rakyat"],
    domains: ["bankrakyat.com.my"],
    tokens: ["bankrakyat"],
  },
  {
    key: "tng",
    names: ["Touch 'n Go", "Touch n Go", "TNG", "TnG eWallet", "Touch n Go eWallet"],
    domains: ["tngdigital.com.my", "touchngo.com.my", "tng.com.my"],
    tokens: ["tngdigital", "touchngo", "tng"],
  },
  {
    key: "maxis",
    names: ["Maxis", "Hotlink"],
    domains: ["maxis.com.my", "hotlink.com.my"],
    tokens: ["maxis", "hotlink"],
  },
  {
    key: "celcom",
    names: ["Celcom", "CelcomDigi"],
    domains: ["celcom.com.my", "celcomdigi.com"],
    tokens: ["celcom", "celcomdigi"],
  },
  {
    key: "umobile",
    names: ["U Mobile", "UMobile"],
    domains: ["u.com.my", "umobile.com.my"],
    tokens: ["umobile"],
  },
  {
    key: "tnb",
    names: ["TNB", "Tenaga Nasional"],
    domains: ["tnb.com.my", "mytnb.com.my"],
    tokens: ["tnb", "tenaga"],
  },
  {
    key: "astro",
    names: ["Astro"],
    domains: ["astro.com.my"],
    tokens: ["astro"],
  },
  {
    key: "unifi",
    names: ["Unifi", "Telekom Malaysia"],
    domains: ["unifi.com.my", "tm.com.my"],
    tokens: ["unifi", "telekom"],
  },
  {
    key: "jpj",
    names: ["JPJ", "Jabatan Pengangkutan Jalan"],
    domains: ["jpj.gov.my"],
    tokens: ["jpj"],
  },
  {
    key: "myeg",
    names: ["MyEG"],
    domains: ["myeg.com.my"],
    tokens: ["myeg"],
  },
  {
    key: "imigresen",
    names: ["Imigresen", "Immigration Department"],
    domains: ["imi.gov.my"],
    tokens: ["imigresen"],
  },
  {
    key: "grab",
    names: ["Grab", "GrabPay"],
    domains: ["grab.com", "grabpay.com"],
    tokens: ["grab", "grabpay"],
  },
  {
    key: "shopee",
    names: ["Shopee", "ShopeePay"],
    domains: ["shopee.com.my", "shopee.com", "shopeepay.com.my"],
    tokens: ["shopee"],
  },
  {
    key: "lazada",
    names: ["Lazada"],
    domains: ["lazada.com.my", "lazada.com"],
    tokens: ["lazada"],
  },
  {
    key: "pos",
    names: ["Pos Malaysia", "PosLaju"],
    domains: ["pos.com.my", "poslaju.com.my"],
    tokens: ["posmalaysia", "poslaju"],
  },
  {
    key: "dhl",
    names: ["DHL"],
    domains: ["dhl.com", "dhl.com.my"],
    tokens: ["dhl"],
  },
  {
    key: "fedex",
    names: ["FedEx"],
    domains: ["fedex.com"],
    tokens: ["fedex"],
  },
  {
    key: "jnt",
    names: ["J&T", "J&T Express", "JNT"],
    domains: ["jtexpress.my", "jnt.com.my"],
    tokens: ["jtexpress", "jnt"],
  },
  {
    key: "lhdn",
    names: ["LHDN", "Lembaga Hasil Dalam Negeri", "HASiL", "MyTax"],
    domains: ["lhdn.gov.my", "hasil.gov.my"],
    tokens: ["lhdn", "hasil", "mytax"],
  },
  {
    key: "ptptn",
    names: ["PTPTN"],
    domains: ["ptptn.gov.my"],
    tokens: ["ptptn"],
  },
  {
    key: "kwsp",
    names: ["KWSP", "EPF", "i-Akaun"],
    domains: ["kwsp.gov.my", "epf.gov.my"],
    tokens: ["kwsp", "epf"],
  },
  {
    key: "perkeso",
    names: ["PERKESO", "SOCSO"],
    domains: ["perkeso.gov.my"],
    tokens: ["perkeso", "socso"],
  },
  {
    key: "mysejahtera",
    names: ["MySejahtera"],
    domains: ["mysejahtera.malaysia.gov.my"],
    tokens: ["mysejahtera"],
  },
  {
    key: "bnm",
    names: ["Bank Negara", "BNM"],
    domains: ["bnm.gov.my"],
    tokens: ["bnm"],
  },
  {
    key: "pdrm",
    names: ["PDRM", "Polis Diraja Malaysia", "Royal Malaysia Police"],
    domains: ["rmp.gov.my", "pdrm.gov.my"],
    tokens: ["pdrm", "rmp"],
  },
  {
    key: "mcmc",
    names: ["MCMC", "Suruhanjaya Komunikasi dan Multimedia"],
    domains: ["mcmc.gov.my"],
    tokens: ["mcmc"],
  },
  {
    key: "apple",
    names: ["Apple", "iCloud", "Apple ID"],
    domains: ["apple.com", "icloud.com"],
    tokens: ["apple", "icloud"],
  },
  {
    key: "microsoft",
    names: ["Microsoft", "Outlook", "Office 365"],
    domains: ["microsoft.com", "live.com", "outlook.com", "office.com"],
    tokens: ["microsoft", "outlook", "office365"],
  },
  {
    key: "google",
    names: ["Google", "Gmail"],
    domains: ["google.com", "gmail.com"],
    tokens: ["google", "gmail"],
  },
  {
    key: "netflix",
    names: ["Netflix"],
    domains: ["netflix.com"],
    tokens: ["netflix"],
  },
  {
    key: "paypal",
    names: ["PayPal"],
    domains: ["paypal.com", "paypal.me"],
    tokens: ["paypal"],
  },
  {
    key: "amazon",
    names: ["Amazon"],
    domains: ["amazon.com", "amazon.com.my"],
    tokens: ["amazon"],
  },
  {
    key: "whatsapp",
    names: ["WhatsApp"],
    domains: ["whatsapp.com", "wa.me"],
    tokens: ["whatsapp"],
  },
  {
    key: "meta",
    names: ["Facebook", "Meta", "Instagram"],
    domains: ["facebook.com", "meta.com", "instagram.com"],
    tokens: ["facebook", "instagram"],
  },
  {
    key: "tiktok",
    names: ["TikTok"],
    domains: ["tiktok.com"],
    tokens: ["tiktok"],
  },
];

const NAME_LOOKUP = BRANDS.flatMap((brand) =>
  brand.names.map((name) => ({ brand, pattern: new RegExp(`(?<![\\p{L}\\d])${escapeRegex(name)}(?![\\p{L}\\d])`, "iu") })),
);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Brands whose name or alias appears in the text. */
export function findBrands(text: string): Brand[] {
  const found = new Map<string, Brand>();
  for (const { brand, pattern } of NAME_LOOKUP) {
    if (found.has(brand.key)) continue;
    if (pattern.test(text)) found.set(brand.key, brand);
  }
  return [...found.values()];
}

export function isOfficialDomain(host: string, domains: string[]): boolean {
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

const FREE_MAIL = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.com.my",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "aol.com",
  "protonmail.com",
  "mail.com",
  "yandex.com",
  "icloud.com",
]);

export function isFreeMailDomain(host: string): boolean {
  return FREE_MAIL.has(host);
}
