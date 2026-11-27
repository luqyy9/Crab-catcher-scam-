# 🦀 Crab Catcher

An AI phishing and scam message detector. Paste a suspicious SMS, WhatsApp chat, email or DM and get an explainable risk verdict: **Low**, **Medium** or **High**, with the exact phrases and links that triggered it.

Built with **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4**.

> "Your bank account will be suspended within 2 hours. Click here to verify your account."
>
> → **High risk (88/100)** · urgency and fear-based language · requests account verification · possible bank impersonation

---

## How it works

Two independent checks run on every message, and their scores are blended.

```
message
  → normalise (homoglyphs, zero-width chars)
  → extract links / emails / phones (de-obfuscates hxxp, [.] and " dot ")
  → detect chat transcript shape (timestamps, sender labels, message count)
  → rules engine   ──►  phrase signals + URL/brand forensics
  → scenario pass  ──►  whole-script patterns (OTP theft, money transfer, investment fraud, ...)
  → score           ──►  0-100 score + evidence spans
  → LLM (optional)  ──►  structured JSON verdict
  → merge (45% rules / 55% AI, high from either side wins)
  → explainable report
```

### 1. Rules engine (`lib/detection/`)

Deterministic, unit-tested, no network. Works with no API key.

| Layer | What it catches |
| --- | --- |
| **Lexicons** | urgency, threats, credential/OTP requests, money transfers, payment demands, investment and task-job offers, loan fees, secrecy, channel switching, dangerous attachments, foreign numbers |
| **URL analysis** | raw IP hosts, `user@host` tricks, punycode, cheap TLDs, shorteners, lookalike domains (Levenshtein + leetspeak), brand mismatches, bait words, excessive subdomains, hyphens, odd ports, missing HTTPS |
| **Brand impersonation** | 30+ banks, e-wallets, couriers and agencies commonly spoofed in Malaysia, each with an allowlist of official domains |
| **Chat awareness** | exported WhatsApp/Telegram transcripts, timestamps, sender labels, forwarded messages and message counts |
| **Scenarios** | OTP theft, money-mule accounts, money-transfer requests, investment fraud, paid-task job scams, romance scams, loan fees, parcel/customs fees, account takeover, fake tech support, crypto wallets, advance fees |
| **Composite** | `urgency + link`, `credential request + link`, `brand claim + credential request`, `chat + money request`, `scenario + secrecy`, generic "your bank" wording |
| **Text tricks** | Cyrillic/Greek homoglyphs, invisible characters, ALL CAPS, `!!!` |

Every signal carries verbatim evidence and character offsets, so the UI highlights the exact phrase in the original message.

### 2. AI layer (`lib/ai/analyze.ts`)

Optional but recommended. Any OpenAI-compatible provider works: **OpenAI, Groq, Google Gemini, OpenRouter, DeepSeek, Mistral, Together AI, a local Ollama model, or a custom endpoint**. The first configured key is used automatically.

The model receives the rules-engine signals, the detected scam scenarios, the conversation shape and the links, then returns a validated JSON verdict (risk level, confidence, flags with exact quotes, verification steps, post-fraud advice). If the key is missing, the request fails or the JSON is invalid, the app falls back to the enhanced offline engine and tells you why.

### 3. Scoring

Weights sum to a 0-100 score with combination bonuses. `0-29` low, `30-64` medium, `65+` high. Any `critical` signal (fake bank domain, IP login page, userinfo trick, OTP request) floors the score at 68, and each recognised scam scenario carries its own minimum (OTP theft 85, money mule 88, investment/job/romance 70). A "high" verdict from either engine is never diluted below the high band.

---

## Features

- Risk rating with an animated gauge and confidence estimate
- **Chat transcript support** — paste a whole WhatsApp/Telegram conversation, with timestamps and sender labels
- **Scam-pattern detection** — OTP theft, money-mule accounts, money transfers, investment fraud, paid-task jobs, romance scams, loan/parcel fees and more, even with no link
- **In-place highlighting** of suspicious phrases and links, colour-coded by severity
- Link breakdown: real host, risk level and the reasons it was flagged
- Plain-language explanations for every red flag
- Safe verification checklist plus "if you already replied or paid" guidance
- Detected links are **never clickable** — you cannot accidentally open a phishing page from the app
- **English + Bahasa Melayu** UI, lexicons and reports
- Local scan history (browser `localStorage` only, capped at 15 entries)
- Copy the full report to the clipboard
- Multi-provider AI review with a graceful offline fallback
- Rate limiting on the API route

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Optional: enable the AI review

The offline engine works without any key. To add a model, copy the example file and fill in **one** provider:

```bash
cp .env.example .env.local
```

```ini
# Option A — OpenAI
OPENAI_API_KEY=sk-...

# Option B — Groq (free tier)
# GROQ_API_KEY=gsk_...

# Option C — Google Gemini
# GEMINI_API_KEY=...

# Option D — local Ollama, no key, fully private
# OLLAMA_BASE_URL=http://localhost:11434/v1
# OLLAMA_MODEL=llama3.1
```

Restart the dev server. The badge in the result panel switches from **Offline engine** to **AI review on**. If the key is present but the provider is unreachable, the report still renders and tells you the AI review failed.

Supported provider ids for `AI_PROVIDER`: `openai`, `groq`, `gemini`, `openrouter`, `deepseek`, `mistral`, `together`, `ollama`, `custom`. Any other OpenAI-compatible endpoint can be used with `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Run the detection test suite (Vitest) |
| `npm run typecheck` | `tsc --noEmit` |

On Windows you can also double-click **`start-app.cmd`**, which installs dependencies on first run, starts the server and opens the browser.

### Demo links

Any sample can be preloaded and analysed from the URL, which is handy for sharing a specific example:

```
/?sample=bank&run=1
/?sample=parcel&run=1
/?sample=chat&run=1
/?sample=invest&run=1
/?sample=job
```

Sample ids: `bank`, `parcel`, `job`, `tax`, `chat`, `invest`, `safe`.

### Design notes

- Every control has hover, press (`scale(0.96)`) and disabled states via the `.btn` utilities in `globals.css`.
- The risk gauge counts up with `requestAnimationFrame`; the confidence bar animates in.
- Cards and list rows lift or tint on hover; result sections stagger in.
- Analysing shows a scan sweep overlay with a minimum 650 ms so the feedback is legible.
- The whole UI respects `prefers-reduced-motion`.
- Detected links are never rendered as anchors.


---

## Project structure

```
app/
  page.tsx                 analyzer screen
  about/page.tsx           how it works, limitations, privacy
  api/analyze/route.ts     POST endpoint: validation, rate limit, AI merge
components/
  Analyzer.tsx             input, samples, request lifecycle
  ResultPanel.tsx          verdict, flags, links, advice
  HighlightedMessage.tsx   span merging + rendering
  RiskGauge.tsx            SVG risk meter
  HistoryPanel.tsx         local scan history drawer
  Providers.tsx            language context (EN/BM)
lib/
  detection/
    analyze.ts             orchestrator
    lexicons.ts            bilingual phrase rules
    scenarios.ts           whole-script scam pattern detection
    chat.ts                chat transcript awareness
    urls.ts                extraction + host heuristics
    brands.ts              impersonation allowlist
    rules.ts               lexicon runner + composite signals
    score.ts               weighting, thresholds, scenario floors, AI merge
    advice.ts              verification steps
    normalize.ts           homoglyph-safe preprocessing
    types.ts               shared types
    analyze.test.ts        20 detection tests
  ai/analyze.ts            multi-provider AI call + Zod schema
  i18n.ts                  UI strings
  signal-copy.ts           per-flag explanations (EN/BM)
  history.ts               localStorage history
  samples.ts               demo messages
```

---

## Privacy

- Messages are posted to this app's own `/api/analyze` route and are **not stored on the server**.
- Scan history lives in your browser's `localStorage` and is never uploaded.
- If an API key is configured, the message text is forwarded to the model provider for that single request.
- The app never fetches or renders the links it finds.

## Limitations

- It cannot see email headers, the real sender address, or what is behind a link.
- A low score is not proof that a message is genuine.
- Only text is analysed — no screenshots, images or voice notes yet.
- Scam phrasing outside English and Bahasa Melayu is only partially covered.

Crab Catcher is an educational project, not a replacement for advice from your bank or the authorities.

---

## Troubleshooting

**`Port 3000 is already in use`** — an earlier server is still running. Close that terminal, or use `npm run dev -- -p 3001`.

**Build fails with `ENOENT` / `EINVAL` / `PageNotFoundError` inside `.next`** — a dev server is still running and rewriting the same folder. Stop every `next dev` process, delete `.next`, then rebuild:

```powershell
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -match 'next' }
Stop-Process -Id <pid> -Force
Remove-Item -Recurse -Force .next
npm run build
```

**`npm.ps1 cannot be loaded because running scripts is disabled`** — run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

**Changes to `.env.local` are ignored** — environment variables are read at startup; restart the server.

**The badge says "Offline engine" even though I added a key** — check that the file is named `.env.local` in the project root (not `.env`), that the key line has no quotes or trailing spaces, and restart the server. `AI_PROVIDER` can force a specific provider; otherwise the first configured key wins. If the key is valid but the provider is unreachable, the report still renders and the note under the advice panel says why the AI review failed.

---

## Roadmap

- [ ] Screenshot / OCR input
- [ ] Threat-intelligence lookup (Google Safe Browsing, PhishTank)
- [ ] PDF report export
- [ ] Labelled evaluation set with precision/recall reporting
- [ ] Supabase-backed aggregate statistics dashboard
