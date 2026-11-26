# 🦀 Crab Catcher

An AI phishing and scam message detector. Paste a suspicious SMS, WhatsApp message or email and get an explainable risk verdict: **Low**, **Medium** or **High**, with the exact phrases and links that triggered it.

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
  → rules engine  ──►  0-100 score + evidence spans
  → LLM (optional) ──►  structured JSON verdict
  → merge (45% rules / 55% AI, high from either side wins)
  → explainable report
```

### 1. Rules engine (`lib/detection/`)

Deterministic, unit-tested, no network. Works with no API key.

| Layer | What it catches |
| --- | --- |
| **Lexicons** | urgency, threats, credential requests, payment demands, too-good-to-be-true offers, secrecy, channel switching, dangerous attachments, foreign numbers |
| **URL analysis** | raw IP hosts, `user@host` tricks, punycode, cheap TLDs, shorteners, lookalike domains (Levenshtein + leetspeak), brand mismatches, bait words, excessive subdomains, hyphens, odd ports, missing HTTPS |
| **Brand impersonation** | 30+ banks, e-wallets, couriers and agencies commonly spoofed in Malaysia, each with an allowlist of official domains |
| **Composite** | `urgency + link`, `credential request + link`, `brand claim + credential request`, generic "your bank" wording |
| **Text tricks** | Cyrillic/Greek homoglyphs, invisible characters, ALL CAPS, `!!!` |

Every signal carries verbatim evidence and character offsets, so the UI highlights the exact phrase in the original message.

### 2. AI layer (`lib/ai/analyze.ts`)

Optional. Calls the OpenAI chat completions API with `response_format: json_object`, validates the reply with Zod, and is given the rules-engine findings as hints to confirm or reject. If the key is missing, the request fails or the JSON is invalid, the app silently falls back to rules-only mode.

### 3. Scoring

Weights sum to a 0-100 score with combination bonuses. `0-29` low, `30-64` medium, `65+` high. Any `critical` signal (fake bank domain, IP login page, userinfo trick) floors the score at 68, and a "high" verdict from either engine is never diluted below the high band.

---

## Features

- Risk rating with an animated gauge and confidence estimate
- **In-place highlighting** of suspicious phrases and links, colour-coded by severity
- Link breakdown: real host, risk level and the reasons it was flagged
- Plain-language explanations for every red flag
- Safe verification checklist plus "if you already replied or paid" guidance
- Detected links are **never clickable** — you cannot accidentally open a phishing page from the app
- **English + Bahasa Melayu** UI, lexicons and reports
- Local scan history (browser `localStorage` only, capped at 15 entries)
- Copy the full report to the clipboard
- Graceful rules-only mode when no API key is configured
- Rate limiting on the API route

---

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Optional: enable the AI explanations

```bash
cp .env.example .env.local
```

```ini
OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1
```

Restart the dev server. The badge in the result panel switches from *Rules-only mode* to *AI explanation on*.

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
/?sample=job
```

Sample ids: `bank`, `parcel`, `job`, `tax`, `safe`.

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
    urls.ts                extraction + host heuristics
    brands.ts              impersonation allowlist
    rules.ts               lexicon runner + composite signals
    score.ts               weighting, thresholds, AI merge
    advice.ts              verification steps
    normalize.ts           homoglyph-safe preprocessing
    types.ts               shared types
    analyze.test.ts        13 detection tests
  ai/analyze.ts            OpenAI call + Zod schema
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

---

## Roadmap

- [ ] Screenshot / OCR input
- [ ] Threat-intelligence lookup (Google Safe Browsing, PhishTank)
- [ ] PDF report export
- [ ] Labelled evaluation set with precision/recall reporting
- [ ] Supabase-backed aggregate statistics dashboard
