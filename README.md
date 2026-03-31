# 🥷 StealthHumanizer

**Free, open-source AI text humanizer** — the ultimate alternative to StealthWriter.

Transform AI-generated text into natural, human-like writing. Works with Google Gemini (free!), OpenAI GPT-4, and Anthropic Claude.

## ✨ Features

- **AI Text Humanizer** — 3 rewrite levels: Light, Medium, Aggressive
- **3 Writing Styles** — Academic, Professional, Casual
- **Built-in AI Detector** — Sentence-by-sentence analysis with color-coded highlighting
- **Alternative Rewrites** — Click any sentence to get 3 different versions
- **Multi-Model Support** — Gemini (free), GPT-4, Claude
- **Side-by-Side Comparison** — See original vs humanized text
- **History** — All your past humanizations saved locally
- **Dark/Light Mode** — Easy on the eyes
- **Export** — Copy, download as TXT or DOCX
- **100% Free & Private** — API keys stored only in your browser

## 🚀 Quick Start

### 1. Get a Free API Key (Gemini — Recommended)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key

### 2. Deploy to Vercel (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rudra496/StealthHumanizer)

Or manually:

```bash
git clone https://github.com/rudra496/StealthHumanizer.git
cd StealthHumanizer
npm install
npm run dev
```

Open `http://localhost:3000` → Go to **Settings** → Paste your Gemini API key → Done!

### 3. Use It

1. Paste AI-generated text
2. Choose rewrite level (Light / Medium / Aggressive)
3. Choose style (Academic / Professional / Casual)
4. Click **Humanize** — get natural, human-like text instantly!

## 🆚 vs StealthWriter

| Feature | StealthWriter | StealthHumanizer |
|---------|--------------|------------------|
| **Price** | $20-50/month | **FREE** (bring your own API key) |
| **Daily Limit** | 10-150/day | **Unlimited** |
| **Word Limit** | 1,000-5,000 | **10,000** |
| **Models** | Unknown | Gemini, GPT-4, Claude |
| **Open Source** | ❌ | ✅ MIT License |
| **Privacy** | Server-side | **Keys stay in your browser** |
| **Self-Hostable** | ❌ | ✅ |
| **Alternative Rewrites** | ✅ | ✅ |
| **Built-in Detector** | ✅ | ✅ |
| **History** | ❌ | ✅ |
| **Export Options** | Basic | TXT + DOCX |

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Gemini API** (free tier)
- **OpenAI API** (optional)
- **Anthropic API** (optional)

## 📖 API Configuration

### Gemini (Free — Recommended)
- Get key: https://aistudio.google.com/apikey
- Free tier: 15 requests/minute, 1500 requests/day
- Model: Gemini 1.5 Flash

### OpenAI GPT-4 (Paid)
- Get key: https://platform.openai.com/api-keys
- Model: GPT-4o

### Anthropic Claude (Paid)
- Get key: https://console.anthropic.com/
- Model: Claude Sonnet 4

## 📝 How It Works

StealthHumanizer uses carefully crafted prompts that instruct the AI to:

1. **Break uniform patterns** — AI text tends to have similar sentence lengths
2. **Add natural imperfections** — Contractions, filler words, asides
3. **Vary vocabulary** — Replace formal words with common alternatives
4. **Restructure sentences** — Mix short and long, active and passive
5. **Add personality** — First person, rhetorical questions, natural tangents

The built-in detector analyzes:
- **Perplexity** — How predictable the text is
- **Burstiness** — Variation in sentence structure
- **Vocabulary Diversity** — Unique word usage
- **Transition Frequency** — Overuse of formal transitions
- **Passive Voice Ratio** — AI tends to use more passive voice
- **AI Phrase Detection** — Known AI-like patterns

## 🔒 Privacy

- API keys are stored **only in your browser's localStorage**
- No data is sent to any third-party server
- Text goes directly to the AI provider you choose
- No accounts, no tracking, no analytics

## 📄 License

MIT License — use it however you want.

## 🤝 Contributing

Pull requests welcome! This is an open-source project built for everyone.

---

**Made with ❤️ by [Rudra](https://github.com/rudra496)**
