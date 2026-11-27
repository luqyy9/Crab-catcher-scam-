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
  "payment.transfer_request": {
    en: {
      title: "Asks you to transfer money",
      why: "A request to transfer, bank in or top up money is the core of most chat scams. Once you send it, the money is gone and the sender usually disappears.",
    },
    ms: {
      title: "Meminta anda memindahkan wang",
      why: "Permintaan untuk transfer, bank in atau top up ialah teras kebanyakan penipuan chat. Selepas dihantar, wang itu hilang dan pengirim biasanya terus lenyap.",
    },
  },
  "payment.account_number": {
    en: {
      title: "Bank account number in a payment request",
      why: "A local account number paired with a payment request is how the money is collected. Verify the recipient through a channel you trust, never from the message alone.",
    },
    ms: {
      title: "Nombor akaun bank dalam permintaan bayaran",
      why: "Nombor akaun tempatan bersama permintaan bayaran ialah cara wang dikutip. Sahkan penerima melalui saluran yang anda percaya, bukan hanya daripada mesej.",
    },
  },
  "credential.otp_share": {
    en: {
      title: "Asks for your OTP or verification code",
      why: "An OTP is the key that authorises a transaction. No bank, e-wallet or courier will ever ask you to forward it. Sharing it hands your account to the scammer.",
    },
    ms: {
      title: "Meminta OTP atau kod pengesahan anda",
      why: "OTP ialah kunci yang membenarkan transaksi. Tiada bank, e-dompet atau kurier akan meminta anda memajukannya. Berkongsi kod bermakna menyerahkan akaun anda kepada penipu.",
    },
  },
  "credential.login_request": {
    en: {
      title: "Pushes you to log in to an account",
      why: "Unexpected login prompts are usually a copy of a real bank page. Open the official app yourself instead of following the message.",
    },
    ms: {
      title: "Mendesak anda log masuk ke akaun",
      why: "Gesaan log masuk yang tidak dijangka biasanya salinan halaman bank sebenar. Buka aplikasi rasmi sendiri dan jangan ikut pautan dalam mesej.",
    },
  },
  "too_good.investment": {
    en: {
      title: "Promises guaranteed investment profit",
      why: "Guaranteed or percentage-per-week returns do not exist in real investing. These offers fund a Ponzi scheme where early payouts come from later victims.",
    },
    ms: {
      title: "Menjanjikan keuntungan pelaburan yang dijamin",
      why: "Pulangan yang dijamin atau peratus setiap minggu tidak wujud dalam pelaburan sebenar. Tawaran ini menyara skim Ponzi yang membayar mangsa awal dengan wang mangsa kemudian.",
    },
  },
  "too_good.task_job": {
    en: {
      title: "Paid-task or commission job offer",
      why: "Jobs that pay you to like, review or complete orders are bait. The 'top up to unlock your earnings' step is where the victim's money is taken.",
    },
    ms: {
      title: "Tawaran kerja tugasan atau komisen",
      why: "Kerja yang membayar anda untuk like, review atau melengkapkan pesanan ialah umpan. Langkah 'top up untuk keluarkan pendapatan' ialah tempat wang mangsa diambil.",
    },
  },
  "too_good.loan": {
    en: {
      title: "Instant loan offer",
      why: "Loans advertised as fast, guaranteed or without documents are usually advance-fee scams that ask for a deposit before any money is lent.",
    },
    ms: {
      title: "Tawaran pinjaman segera",
      why: "Pinjaman yang diiklankan sebagai segera, dijamin atau tanpa dokumen biasanya penipuan yuran pendahuluan yang meminta deposit sebelum wang dipinjamkan.",
    },
  },
  "impersonation.claim": {
    en: {
      title: "Claims to be an official representative",
      why: "Anyone can type 'this is the bank'. Real staff will not open a conversation on WhatsApp and ask for codes or transfers.",
    },
    ms: {
      title: "Mendakwa sebagai wakil rasmi",
      why: "Sesiapa sahaja boleh menaip 'ini pihak bank'. Kakitangan sebenar tidak akan membuka perbualan di WhatsApp dan meminta kod atau pemindahan wang.",
    },
  },
  "link.qr_prompt": {
    en: {
      title: "Asks you to scan a QR code",
      why: "A QR code can hide a payment request or a phishing address. Check the name shown by your banking app before confirming anything.",
    },
    ms: {
      title: "Meminta anda mengimbas kod QR",
      why: "Kod QR boleh menyembunyikan permintaan bayaran atau alamat pancingan data. Semak nama yang dipaparkan aplikasi bank anda sebelum mengesahkan apa-apa.",
    },
  },
  "grammar.greeting": {
    en: {
      title: "Generic mass-message greeting",
      why: "Real organisations address you by name. 'Dear customer' is used because the same text is sent to thousands of people.",
    },
    ms: {
      title: "Sapaan generik untuk mesej pukal",
      why: "Organisasi sebenar menyapa anda dengan nama. 'Pelanggan yang dihormati' digunakan kerana teks yang sama dihantar kepada ribuan orang.",
    },
  },
  "chat.forwarded": {
    en: {
      title: "Forwarded message",
      why: "Forwarded messages lose their original sender. Treat claims inside them as unverified, even when they come from a friend.",
    },
    ms: {
      title: "Mesej yang dimajukan",
      why: "Mesej yang dimajukan kehilangan pengirim asalnya. Anggap dakwaan di dalamnya belum disahkan, walaupun ia datang daripada rakan.",
    },
  },
  "scenario.money_mule": {
    en: {
      title: "Money-mule account request",
      why: "Letting someone move stolen money through your bank account is a crime in Malaysia, even if you were tricked. Never lend your account or receive money for a stranger.",
    },
    ms: {
      title: "Permintaan akaun keldai",
      why: "Membenarkan orang lain memindahkan wang curi melalui akaun bank anda ialah jenayah di Malaysia, walaupun anda ditipu. Jangan pinjamkan akaun atau terima wang untuk orang asing.",
    },
  },
  "scenario.safe_account": {
    en: {
      title: "Fake 'safe account' / police impersonation",
      why: "No police officer or Bank Negara official will ask you to move your money to a 'safe account' to protect it. This script is used to drain savings.",
    },
    ms: {
      title: "Penyamaran polis / 'akaun selamat' palsu",
      why: "Tiada pegawai polis atau Bank Negara akan meminta anda memindahkan wang ke 'akaun selamat' untuk melindunginya. Skrip ini digunakan untuk menguras simpanan.",
    },
  },
  "scenario.overpayment": {
    en: {
      title: "'I sent you too much by mistake' refund scam",
      why: "The original transfer is often reversed or never existed. Returning the 'extra' money leaves you out of pocket when the bank reverses the credit.",
    },
    ms: {
      title: "Penipuan bayaran balik 'terlebih hantar'",
      why: "Pemindahan asal sering dibatalkan atau tidak pernah wujud. Memulangkan wang 'terlebih' menyebabkan anda kerugian apabila bank membatalkan kredit itu.",
    },
  },
  "scenario.sextortion": {
    en: {
      title: "Sextortion threat",
      why: "Threatening to leak photos or videos to force a payment is blackmail. Paying does not stop it; report the account and keep the evidence.",
    },
    ms: {
      title: "Ancaman pemerasan seksual",
      why: "Mengancam untuk menyebarkan gambar atau video bagi memaksa bayaran ialah pemerasan. Membayar tidak menghentikannya; laporkan akaun itu dan simpan bukti.",
    },
  },
  "scenario.otp_theft": {
    en: {
      title: "OTP / verification-code theft",
      why: "The conversation is steering you into reading out a one-time code. That code approves a transfer or login, so the request is the theft itself.",
    },
    ms: {
      title: "Kecurian OTP / kod pengesahan",
      why: "Perbualan ini membawa anda supaya memberitahu kod sekali guna. Kod itu meluluskan pemindahan atau log masuk, jadi permintaan itu sendiri ialah kecurian.",
    },
  },
  "scenario.investment": {
    en: {
      title: "Investment fraud pattern",
      why: "A percentage return, a 'guaranteed profit' and a push to join a group form the standard investment-scam script. There is no real trading behind it.",
    },
    ms: {
      title: "Corak penipuan pelaburan",
      why: "Pulangan berperatus, 'untung dijamin' dan desakan menyertai kumpulan membentuk skrip penipuan pelaburan biasa. Tiada perdagangan sebenar di sebaliknya.",
    },
  },
  "scenario.money_transfer": {
    en: {
      title: "Money-transfer request in a conversation",
      why: "Someone is asking you to send money inside a chat. Verify the person and the account independently before any transfer.",
    },
    ms: {
      title: "Permintaan pemindahan wang dalam perbualan",
      why: "Seseorang meminta anda menghantar wang dalam chat. Sahkan orang dan akaun itu secara berasingan sebelum sebarang pemindahan.",
    },
  },
  "scenario.job_task": {
    en: {
      title: "Paid-task job scam pattern",
      why: "Small early payouts are used to earn trust, then you are asked to deposit more to 'unlock' bigger earnings. The deposits are never returned.",
    },
    ms: {
      title: "Corak penipuan kerja tugasan",
      why: "Bayaran kecil awal digunakan untuk membina kepercayaan, kemudian anda diminta mendeposit lebih untuk 'membuka' pendapatan lebih besar. Deposit itu tidak dipulangkan.",
    },
  },
  "scenario.romance": {
    en: {
      title: "Romance or emotional manipulation",
      why: "Affection is used to lower your guard before a request for money, a visa fee or an emergency payment. Real partners do not need your bank transfer.",
    },
    ms: {
      title: "Penipuan cinta atau manipulasi emosi",
      why: "Kasih sayang digunakan untuk melemahkan pertahanan anda sebelum meminta wang, yuran visa atau bayaran kecemasan. Pasangan sebenar tidak memerlukan pemindahan bank anda.",
    },
  },
  "scenario.loan_fee": {
    en: {
      title: "Loan with an upfront fee",
      why: "A lender that asks you to pay a deposit, processing fee or stamp duty before releasing the loan is collecting money, not lending it.",
    },
    ms: {
      title: "Pinjaman dengan yuran pendahuluan",
      why: "Pemberi pinjaman yang meminta deposit, yuran pemprosesan atau duti setem sebelum melepaskan pinjaman sedang mengutip wang, bukan meminjamkan.",
    },
  },
  "scenario.parcel_fee": {
    en: {
      title: "Parcel or customs fee pattern",
      why: "Couriers do not demand payment by chat to release a parcel. Check the tracking number on the courier's official site first.",
    },
    ms: {
      title: "Corak yuran bungkusan atau kastam",
      why: "Kurier tidak meminta bayaran melalui chat untuk melepaskan bungkusan. Semak nombor penjejakan di laman rasmi kurier dahulu.",
    },
  },
  "scenario.account_takeover": {
    en: {
      title: "Account-takeover story",
      why: "A 'new number' or 'my account was hacked' story is used to impersonate someone you trust and ask for money. Call the person on their old number.",
    },
    ms: {
      title: "Cerita akaun diambil alih",
      why: "Cerita 'nombor baru' atau 'akaun saya digodam' digunakan untuk menyamar sebagai orang yang anda percaya dan meminta wang. Hubungi orang itu di nombor lamanya.",
    },
  },
  "scenario.tech_support": {
    en: {
      title: "Fake tech-support pattern",
      why: "Warnings that your device is infected are used to get remote access or payment. Real vendors do not call or message you about a virus.",
    },
    ms: {
      title: "Corak sokongan teknikal palsu",
      why: "Amaran bahawa peranti anda dijangkiti digunakan untuk mendapatkan akses jauh atau bayaran. Vendor sebenar tidak menghubungi anda tentang virus.",
    },
  },
  "scenario.crypto_wallet": {
    en: {
      title: "Crypto wallet address",
      why: "Crypto transfers cannot be reversed. A wallet address in a message is a one-way payment to an anonymous recipient.",
    },
    ms: {
      title: "Alamat dompet kripto",
      why: "Pemindahan kripto tidak boleh dibatalkan. Alamat dompet dalam mesej ialah bayaran sehala kepada penerima tanpa nama.",
    },
  },
  "scenario.advance_fee": {
    en: {
      title: "Advance-fee request",
      why: "Paying a fee to release a larger sum is the oldest scam pattern there is. The larger sum never arrives.",
    },
    ms: {
      title: "Permintaan yuran pendahuluan",
      why: "Membayar yuran untuk melepaskan jumlah yang lebih besar ialah corak penipuan paling lama. Jumlah besar itu tidak pernah tiba.",
    },
  },
};

export const CATEGORY_COPY: Record<string, Record<Lang, string>> = {
  scenario: { en: "Scam pattern", ms: "Corak penipuan" },
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
