<div align="center">

# 🥷 StealthHumanizer v2

**A comprehensive free & open-source AI text humanizer.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-22c55e?style=for-the-badge&logo=vercel)](https://stealthhumanizer.vercel.app/)
[![GitHub Pages](https://img.shields.io/badge/📄_GitHub_Pages-Demo-1f6feb?style=for-the-badge&logo=github)](https://rudra496.github.io/StealthHumanizer/)
[![Deploy](https://img.shields.io/badge/🚀_Deploy-Vercel-000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/rudra496/StealthHumanizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-22c55e?style=for-the-badge)](CONTRIBUTING.md)

[![Stars](https://img.shields.io/github/stars/rudra496/StealthHumanizer?style=social)](https://github.com/rudra496/StealthHumanizer/stargazers)
[![Forks](https://img.shields.io/github/forks/rudra496/StealthHumanizer?style=social)](https://github.com/rudra496/StealthHumanizer/network/members)
[![Issues](https://img.shields.io/github/issues/rudra496/StealthHumanizer)](https://github.com/rudra496/StealthHumanizer/issues)

Transform AI-generated text into **natural, human-like writing** using 13 AI providers, 4 rewrite levels, 13 tones, multi-pass humanization, and a 12-metric detection engine.

**✅ 100% Free • No Login • No Limits • Open Source (MIT) • Private & Secure**

</div>

---

## 📺 Demo

> 💡 **Try it now:** [**Live Demo on GitHub Pages**](https://rudra496.github.io/StealthHumanizer/) — no installation needed!

![StealthHumanizer Demo](https://img.shields.io/badge/🎬_Demo_Screenshot-Coming_Soon-8b5cf6?style=for-the-badge)

### How It Works

```
📝 AI Text → 🥷 Multi-Pass Rewrite → 📊 AI Detection → 🔁 Re-Humanize → ✅ Human Score 100%
```

1. **Paste** your AI-generated text (up to 10,000 words)
2. **Select** rewrite level, style, and tone
3. **Set** target human score (50%–100%)
4. **Humanize** — AI rewrites with human patterns
5. **Auto-loop** — re-humanizes flagged sentences until target reached
6. **Export** — copy, download TXT/DOCX

---

## ✨ Features

### 🥷 Rewrite Engine
| Feature | Details |
|---------|---------|
| **4 Rewrite Levels** | Light, Medium, Aggressive, **Ninja** (5-pass auto-loop) |
| **5 Writing Styles** | Academic, Professional, Casual, Creative, Technical |
| **13 Tone Presets** | Conversational, Academic Formal/Casual, Journalistic, Creative Writing, Professional, Technical, Persuasive, Storytelling, Humorous, Emotional, Analytical |
| **Multi-Pass Humanization** | Ninja: 5 passes, Aggressive: 3 passes, auto-target 100% |
| **Target Score Control** | Slider from 50% to 100% human |
| **Alternative Rewrites** | Click any sentence for 3 different versions |
| **Side-by-Side Comparison** | Diff view with per-sentence scores |
| **16 Languages** | Auto-detects and preserves input language |

### 🔍 12-Metric AI Detector
| Metric | What It Measures |
|--------|-----------------|
| **Perplexity** | How predictable/unexpected the word choices are |
| **Burstiness** | Sentence length variation (humans vary wildly) |
| **Vocabulary Diversity** | Unique word usage vs repetition |
| **Sentence Variation** | Length, structure, type diversity |
| **Sentence Start Diversity** | Do sentences start the same way? |
| **Pronoun Usage** | First/second person pronouns (human indicator) |
| **Transition Frequency** | Overuse of formal transitions |
| **Passive Voice** | Ratio of passive constructions |
| **AI Phrase Density** | Detection of 50+ known AI phrases |
| **Hedging Language** | "It could be argued", "one might consider" |
| **Quantifier Patterns** | Overuse of "numerous", "various", "multiple" |
| **Contraction Usage** | Humans use contractions; AI often doesn't |

**Readability Scores:** Flesch Reading Ease, Flesch-Kincaid Grade Level, Coleman-Liau Index

### 🆓 13 AI Providers (10 Free!)

| Provider | Free? | Speed | Quality | Model |
|----------|:-----:|:-----:|:-------:|-------|
| [Google Gemini](https://aistudio.google.com/apikey) | ✅ | ⚡ | ⭐⭐⭐⭐⭐ | gemini-1.5-flash/pro |
| [Groq](https://console.groq.com/keys) | ✅ | ⚡⚡⚡ | ⭐⭐⭐⭐ | llama-3.3-70b |
| [ZAI (GLM-5)](https://z.ai/manage-apikey/apikey-list) | ✅ | ⚡⚡ | ⭐⭐⭐⭐⭐ | glm-5 |
| [OpenRouter](https://openrouter.ai/keys) | ✅ | ⚡⚡ | ⭐⭐⭐⭐ | 100+ models |
| [Together AI](https://api.together.xyz/settings/api-keys) | ✅ | ⚡⚡ | ⭐⭐⭐⭐ | llama-3-70b |
| [Cerebras](https://cloud.cerebras.ai/) | ✅ | ⚡⚡⚡ | ⭐⭐⭐⭐ | llama3.1-70b |
| [Mistral AI](https://console.mistral.ai/) | ✅ | ⚡⚡ | ⭐⭐⭐⭐ | mistral-large |
| [Cohere](https://dashboard.cohere.com/api-keys) | ✅ | ⚡⚡ | ⭐⭐⭐ | command-r-plus |
| [DeepInfra](https://deepinfra.com/dash/api_keys) | ✅ | ⚡⚡ | ⭐⭐⭐⭐ | llama-3-70b |
| [HuggingFace](https://huggingface.co/settings/tokens) | ✅ | ⚡ | ⭐⭐⭐ | llama-3-8b |
| [Cloudflare Workers AI](https://dash.cloudflare.com/) | ✅ | ⚡⚡⚡ | ⭐⭐⭐ | llama-3-8b |
| [OpenAI GPT-4](https://platform.openai.com/api-keys) | ❌ | ⚡ | ⭐⭐⭐⭐⭐ | gpt-4o |
| [Anthropic Claude](https://console.anthropic.com/) | ❌ | ⚡ | ⭐⭐⭐⭐⭐ | claude-sonnet-4 |

> 💡 **No API key?** Start with **Gemini** or **Groq** — both free, no credit card needed!

### 🎨 UX Features
- 🌙 Dark / ☀️ Light mode
- ⌨️ Keyboard shortcuts (`Ctrl+Enter`, `Ctrl+1/2/3/4`)
- 📜 History (localStorage, 50 entries)
- 📋 Copy / 💾 Export as TXT & DOCX
- 📱 Fully mobile responsive
- 🔒 Zero server data storage
- 🏃 No account or sign-up required

---

## 🚀 Quick Start

### Option 1: 🌐 Use Online (Zero Install)
👉 **[Live Demo](https://rudra496.github.io/StealthHumanizer/)** — add any free API key and start humanizing!

### Option 2: 🚀 Deploy on Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rudra496/StealthHumanizer)

### Option 3: 💻 Run Locally

```bash
git clone https://github.com/rudra496/StealthHumanizer.git
cd StealthHumanizer
npm install
npm run dev
```

### Step-by-Step Usage

1. **Get a free API key:**
   - [Google Gemini](https://aistudio.google.com/apikey) — Sign in → Create API Key → Copy
   - [Groq](https://console.groq.com/keys) — Sign up → Create key → Paste

2. **Paste your AI-generated text**

3. **Configure:**
   - Level: Light / Medium / Aggressive / **Ninja**
   - Style: Academic / Professional / Casual / Creative / Technical
   - Tone: Conversational / Formal / Journalistic / etc.
   - Target: 80% → 100%

4. **Click "Humanize"** — get human-like natural writing!

---

## 🏆 StealthHumanizer vs Others

| Feature | StealthWriter | QuillBot | **StealthHumanizer** |
|---------|:------------:|:--------:|:--------------------:|
| **Price** | $20–50/mo | $19.95/mo | **FREE forever** |
| **Daily Limit** | 10–150 | Limited | **Unlimited** |
| **Word Limit** | 1K–5K | 1.2K | **10K** |
| **AI Providers** | 1 | 1 | **13 (10 free)** |
| **Rewrite Levels** | 3 | 2 | **4 (+ Ninja)** |
| **Writing Styles** | 3 | 4 | **5** |
| **Tone Presets** | 0 | 0 | **13** |
| **Multi-Pass** | ❌ | ❌ | **✅ (up to 5)** |
| **Target Score** | ❌ | ❌ | **✅ (50–100%)** |
| **AI Detector** | Basic | None | **12 metrics** |
| **Readability** | ❌ | ❌ | **3 scores** |
| **Open Source** | ❌ | ❌ | **✅ MIT** |
| **Self-Hostable** | ❌ | ❌ | **✅** |
| **API Keys Stored** | Their server | Their server | **Your browser only** |
| **No Account** | ❌ | ❌ | **✅** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| AI Integration | Native `fetch()` — zero SDK dependencies |
| Deployment | [Vercel](https://vercel.com/) / GitHub Pages |
| Dependencies | `next`, `react`, `lucide-react` — that's it |

---

## 🔒 Security & Privacy

- 🔑 **API keys never leave your browser** — stored only in `localStorage`
- 🚫 **No server-side storage** — no databases, no user accounts
- 🔐 **All API calls use HTTPS** — encrypted in transit
- 📵 **No tracking, no analytics** — zero third-party scripts
- 🛡️ **MIT Licensed** — fully transparent, auditable code
- See [SECURITY.md](SECURITY.md) for full security policy

---

## 📁 Project Structure

```
StealthHumanizer/
├── app/
│   ├── api/
│   │   ├── humanize/route.ts    # Multi-pass humanization endpoint
│   │   └── alternative/route.ts # Alternative rewrite suggestions
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Main application page
│   └── globals.css              # Global styles + dark mode
├── components/
│   ├── Humanizer.tsx            # Main humanization interface
│   ├── Detector.tsx             # AI detection dashboard
│   ├── Settings.tsx             # API key management
│   ├── History.tsx              # Humanization history
│   ├── Navbar.tsx               # Navigation bar
│   └── Toast.tsx                # Notification toasts
├── lib/
│   ├── types.ts                 # TypeScript types
│   ├── providers.ts             # 13 AI provider configs
│   ├── prompts.ts               # 13 tones × 4 levels system prompts
│   ├── detector.ts              # 12-metric AI detection engine
│   ├── humanizer.ts             # Multi-pass humanization logic
│   ├── readability.ts           # Readability score calculations
│   └── storage.ts               # localStorage management
├── docs/
│   ├── index.html               # Standalone GitHub Pages version
│   ├── sitemap.xml              # SEO sitemap
│   └── robots.txt               # Crawler rules
├── .github/
│   ├── workflows/
│   │   ├── pages.yml            # GitHub Pages auto-deploy
│   │   └── ci.yml               # Build verification
│   └── ISSUE_TEMPLATE/          # Bug report & feature request
└── [Documentation files]
    ├── README.md                ← You are here
    ├── ARCHITECTURE.md          # System architecture
    ├── STYLE_ENGINE.md          # Tone/style system design
    ├── API_USAGE.md             # Provider API details
    ├── SECURITY.md              # Security policy
    ├── CONTRIBUTING.md          # How to contribute
    ├── ROADMAP.md               # Future plans
    ├── CODE_OF_CONDUCT.md       # Community guidelines
    └── LICENSE                  # MIT License
```

### 🌏 Chinese Language Support

StealthHumanizer now includes **detector-aware transformations** specifically designed for Chinese AI detection systems:

| Feature | Details |
|---------|---------|
| **Simplified Chinese (zh-CN)** | Targets CNKI AIGC, Wanfang, VIP detection systems |
| **Traditional Chinese (zh-TW)** | Adapts to Taiwan/HK writing conventions |
| **Two Modes** | General natural rewrite + Academic rewrite |
| **Structural Variations** | 把/被 constructions, topic-comment reordering, idiom insertion |
| **Connector Density Control** | Chinese detectors heavily weight connector frequency |
| **Burstiness Engineering** | Chinese-optimized sentence length variation |

**What makes Chinese detection different:**
- Chinese detectors flag connector density (因此/同时/此外), sentence-length regularity, balanced clause structures, and repeated rhetorical templates
- Traditional Chinese requires different discourse patterns — not just script conversion
- Academic mode preserves terminology while reducing AIGC fingerprints

> 💡 Inspired by the [humanize-chinese](https://github.com/nicholasgasior/humanize-chinese) open-source project.

---

## 🗺️ Roadmap

- [x] v1: Core humanization engine
- [x] v2: 13 providers, 13 tones, multi-pass, ninja mode
- [x] GitHub Pages deployment
- [x] SEO optimization & structured data
- [x] GitHub Actions CI/CD
- [ ] v3: Browser extension (Chrome/Firefox)
- [ ] v3: Real-time streaming humanization
- [ ] v3: Batch processing (multiple texts)
- [ ] v3: Custom model fine-tuning guide

See [ROADMAP.md](ROADMAP.md) for full details.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — use it however you want.

See [LICENSE](LICENSE) for details.

---

## ⭐ Star History

<a href="https://star-history.com/#rudra496/StealthHumanizer&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=rudra496/StealthHumanizer&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=rudra496/StealthHumanizer&type=Date" />
   <img alt="Star History" src="https://api.star-history.com/svg?repos=rudra496/StealthHumanizer&type=Date" />
 </picture>
</a>

---

<div align="center">

**Built with ❤️ by [Rudra Sarker](https://github.com/rudra496)**

[![Twitter](https://img.shields.io/badge/Twitter-@Rudra496-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/Rudra496)
[![Website](https://img.shields.io/badge/Website-rudra496.github.io-22c55e?style=flat-square&logo=github)](https://rudra496.github.io/site)
[![GitHub](https://img.shields.io/badge/GitHub-rudra496-181717?style=flat-square&logo=github)](https://github.com/rudra496)

<p><sub>Shahjalal University of Science and Technology, Bangladesh</sub></p>

**⭐ If you find this useful, please give it a star! It helps more than you know.**

</div>
