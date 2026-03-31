# 🥷 StealthHumanizer v2

**The world's most comprehensive free & open-source AI text humanizer.**

Transform AI-generated text into 100% natural, human-like writing using 12+ AI providers, 13 tones, multi-pass humanization, and advanced detection analysis.

## ✨ Features

### Core Humanization
- **4 Rewrite Levels** — Light, Medium, Aggressive, Ninja (maximum stealth)
- **5 Writing Styles** — Academic, Professional, Casual, Creative, Technical
- **13 Tone Presets** — Academic Formal/Casual, Journalistic, Creative, Conversational, Professional, Technical, Persuasive, Storytelling, Humorous, Emotional, Analytical, Custom
- **Multi-Pass Humanization** — Auto re-humanizes flagged sentences until target score is reached (up to 3 passes)
- **Target Score Control** — Set your desired human score (50%-100%)
- **Alternative Rewrites** — Click any sentence for 3 different versions
- **Side-by-Side Comparison** — Diff view with per-sentence detection scores

### 12+ AI Providers (9 Free!)
| Provider | Free? | Speed | Quality |
|----------|-------|-------|---------|
| Google Gemini | ✅ | Fast | Excellent |
| Groq (Llama 3.3 70B) | ✅ | Ultra-fast | Very Good |
| OpenRouter | ✅ | Varies | Varies |
| Together AI | ✅ | Fast | Good |
| Cerebras | ✅ | Ultra-fast | Good |
| Mistral AI | ✅ | Fast | Very Good |
| Cohere | ✅ | Fast | Good |
| DeepInfra | ✅ | Fast | Good |
| HuggingFace | ✅ | Medium | Fair |
| Cloudflare Workers AI | ✅ | Fast | Good |
| OpenAI GPT-4 | ❌ | Medium | Excellent |
| Anthropic Claude | ❌ | Medium | Excellent |

### Advanced AI Detector
- **12 detection metrics** — Perplexity, Burstiness, Vocabulary Diversity, Sentence Variation, Sentence Start Diversity, Pronoun Usage, Transition Frequency, Passive Voice, AI Phrase Density, Hedging, Quantifiers
- **Sentence-by-sentence analysis** with color-coded highlighting
- **Readability scores** — Flesch Reading Ease, Flesch-Kincaid Grade Level, Coleman-Liau Index

### UX Features
- Dark/Light mode
- Keyboard shortcuts (Ctrl+Enter, Ctrl+1/2/3/4)
- History (localStorage, 50 entries)
- Export as TXT, DOCX
- Mobile responsive
- No account needed

## 🚀 Quick Start

### 1. Get a Free API Key

**Gemini (Recommended):**
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in → Create API Key → Copy

**Groq (Ultra-fast, free):**
1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up → Create key → Paste

### 2. Deploy

**Vercel (one click):**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rudra496/StealthHumanizer)

**Or locally:**
```bash
git clone https://github.com/rudra496/StealthHumanizer.git
cd StealthHumanizer
npm install
npm run dev
```

### 3. Use It
1. Paste AI text
2. Pick level (Light/Medium/Aggressive/Ninja)
3. Pick style + tone
4. Set target score (80-100%)
5. Click Humanize → get undetectable human text!

## 🆚 vs StealthWriter

| Feature | StealthWriter | StealthHumanizer v2 |
|---------|--------------|---------------------|
| Price | $20-50/mo | **FREE** |
| Daily Limit | 10-150 | **Unlimited** |
| Word Limit | 1K-5K | **10K** |
| AI Providers | 1 (unknown) | **12+** |
| Rewrite Levels | 3 | **4** (incl. Ninja) |
| Writing Styles | 3 | **5** |
| Tones | 0 | **13** |
| Multi-Pass | ❌ | ✅ (3 passes) |
| Target Score | ❌ | ✅ (50-100%) |
| Readability | ❌ | ✅ |
| Detection Metrics | Basic | **12 metrics** |
| Open Source | ❌ | ✅ MIT |
| Self-Hostable | ❌ | ✅ |

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **12 AI Provider APIs** (all via fetch, minimal deps)

## 🔒 Privacy

All API keys stored **only** in your browser's localStorage. Text goes directly to your chosen AI provider. No server, no tracking, no accounts.

## 📄 License

MIT — use it however you want.

---

**Built with ❤️ by [Rudra](https://github.com/rudra496)**
