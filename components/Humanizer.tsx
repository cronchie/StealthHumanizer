'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Sparkles, Copy, Download, FileText, RefreshCw, Zap, Eye,
  FileDown, Target, ChevronDown, ChevronUp, Keyboard, ArrowRight,
  Type, Languages
} from 'lucide-react';
import { RewriteLevel, StylePreset, TonePreset, HumanizationResult } from '@/lib/types';
import { TONE_CONFIGS, SAMPLE_AI_TEXT, SAMPLE_TECHNICAL_TEXT } from '@/lib/prompts';
import { detectAI, getScoreColor, getScoreBarColor } from '@/lib/detector';
import { getReadabilityLabel } from '@/lib/readability';
import { countWords, downloadAsTxt, downloadAsDocx } from '@/lib/storage';

const REWRITE_LEVELS: { id: RewriteLevel; name: string; desc: string }[] = [
  { id: 'light', name: '🪶 Light', desc: 'Subtle fixes' },
  { id: 'medium', name: '✨ Medium', desc: 'Noticeable rewrite' },
  { id: 'aggressive', name: '🔥 Aggressive', desc: 'Complete rewrite' },
  { id: 'ninja', name: '🥷 Ninja', desc: 'Maximum stealth' },
];

const STYLES: StylePreset[] = ['academic', 'professional', 'casual', 'creative', 'technical'];

const TONES: { id: TonePreset; name: string; emoji: string }[] = [
  { id: 'academic-formal', name: 'Academic Formal', emoji: '🎓' },
  { id: 'academic-casual', name: 'Academic Casual', emoji: '📚' },
  { id: 'journalistic', name: 'Journalistic', emoji: '📰' },
  { id: 'creative-writing', name: 'Creative', emoji: '✍️' },
  { id: 'conversational', name: 'Conversational', emoji: '💬' },
  { id: 'professional', name: 'Professional', emoji: '💼' },
  { id: 'technical', name: 'Technical', emoji: '⚙️' },
  { id: 'persuasive', name: 'Persuasive', emoji: '🎯' },
  { id: 'storytelling', name: 'Storytelling', emoji: '📖' },
  { id: 'humorous', name: 'Humorous', emoji: '😂' },
  { id: 'emotional', name: 'Emotional', emoji: '❤️' },
  { id: 'analytical', name: 'Analytical', emoji: '🔬' },
  { id: 'custom', name: 'Custom', emoji: '🎨' },
];

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'tr', name: 'Turkish' },
];

interface HumanizerProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Humanizer({ showToast }: HumanizerProps) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ pass: 0, max: 0, message: '' });
  const [level, setLevel] = useState<RewriteLevel>('medium');
  const [style, setStyle] = useState<StylePreset>('academic');
  const [tone, setTone] = useState<TonePreset>('conversational');
  const [customTone, setCustomTone] = useState('');
  const [language, setLanguage] = useState('auto');
  const [targetScore, setTargetScore] = useState(80);
  const [expandedSentence, setExpandedSentence] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<Record<number, string[]>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showReadability, setShowReadability] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const wordCount = countWords(inputText);

  // Load reuse text from sessionStorage
  useEffect(() => {
    const reuse = sessionStorage.getItem('stealthhumanizer_reuse_text');
    if (reuse) {
      setInputText(reuse);
      sessionStorage.removeItem('stealthhumanizer_reuse_text');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleHumanize(); }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); result && handleCopy(); }
      if (e.ctrlKey && e.key === '1') { e.preventDefault(); setLevel('light'); }
      if (e.ctrlKey && e.key === '2') { e.preventDefault(); setLevel('medium'); }
      if (e.ctrlKey && e.key === '3') { e.preventDefault(); setLevel('aggressive'); }
      if (e.ctrlKey && e.key === '4') { e.preventDefault(); setLevel('ninja'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inputText, result, level]);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) { showToast('warning', 'Please enter some text to humanize.'); return; }
    if (wordCount > 10000) { showToast('warning', 'Maximum 10,000 words per input.'); return; }

    let keys: Record<string, string | undefined> = {};
    try { const s = localStorage.getItem('stealthhumanizer_api_keys'); if (s) keys = JSON.parse(s); } catch {}
    if (Object.values(keys).every(k => !k)) {
      showToast('warning', 'Please add an API key in Settings first. Gemini is free!');
      return;
    }

    const providerId = Object.keys(keys).find(k => keys[k]) || 'gemini';
    const apiKey = keys[providerId]!;

    setLoading(true);
    setResult(null);
    setProgress({ pass: 0, max: level === 'ninja' ? 3 : level === 'aggressive' ? 2 : 1, message: 'Starting...' });

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText, level, style, tone, customTone,
          model: providerId, apiKey, targetScore, language,
        }),
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed'); }
      const data = await response.json();
      setResult(data);

      const scoreMsg = data.finalScore >= 70 ? `🎉 ${data.finalScore}% human!` : `Score: ${data.finalScore}% human`;
      showToast('success', `Done with ${data.modelName} (${data.passes} pass${data.passes > 1 ? 'es' : ''}) — ${scoreMsg}`);
    } catch (err: any) {
      showToast('error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setProgress({ pass: 0, max: 0, message: '' });
    }
  }, [inputText, level, style, tone, customTone, language, targetScore, showToast, wordCount]);

  const handleCopy = () => { if (result) { navigator.clipboard.writeText(result.fullText); showToast('success', 'Copied!'); } };
  const handleDownload = (format: 'txt' | 'docx') => {
    if (result) { format === 'txt' ? downloadAsTxt(result.fullText, 'humanized') : downloadAsDocx(result.fullText, 'humanized'); showToast('success', `Downloaded as ${format.toUpperCase()}!`); }
  };

  const handleGetAlternatives = async (index: number) => {
    if (!result || expandedSentence === index) { setExpandedSentence(null); return; }
    setExpandedSentence(index);
    if (alternatives[index]) return;
    const sentence = result.sentences[index];
    if (!sentence?.original) return;

    try {
      let keys: Record<string, string | undefined> = {};
      const s = localStorage.getItem('stealthhumanizer_api_keys'); if (s) keys = JSON.parse(s);
      const providerId = Object.keys(keys).find(k => keys[k]) || 'gemini';
      const resp = await fetch('/api/alternative', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: sentence.original, current: sentence.humanized, level, style, tone, customTone, model: providerId, apiKey: keys[providerId] }),
      });
      if (resp.ok) { const data = await resp.json(); setAlternatives(prev => ({ ...prev, [index]: data.alternatives })); }
    } catch {}
  };

  const handleSelectAlternative = (index: number, alt: string) => {
    if (!result) return;
    const newSentences = [...result.sentences];
    newSentences[index] = { ...newSentences[index], humanized: alt };
    setResult({ ...result, sentences: newSentences, fullText: newSentences.map(s => s.humanized).join(' ') });
    showToast('success', 'Alternative applied!');
  };

  const detection = result ? detectAI(result.fullText) : null;
  const readLabel = detection ? getReadabilityLabel(detection.readability.fleschReadingEase) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-400" /> AI Text Humanizer
          </h2>
          <p className="text-dark-400 mt-1">Transform AI text into undetectable human writing</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <Keyboard className="w-4 h-4" /> Shortcuts
          </button>
          <button onClick={() => setInputText(SAMPLE_AI_TEXT)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <Zap className="w-4 h-4" /> Sample Text
          </button>
          <button onClick={() => setInputText(SAMPLE_TECHNICAL_TEXT)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <FileText className="w-4 h-4" /> Tech Sample
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts modal */}
      {showShortcuts && (
        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-white mb-3">⌨️ Keyboard Shortcuts</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="text-dark-400"><kbd className="bg-dark-700 px-1.5 py-0.5 rounded text-dark-300">Ctrl+Enter</kbd> Humanize</div>
            <div className="text-dark-400"><kbd className="bg-dark-700 px-1.5 py-0.5 rounded text-dark-300">Ctrl+Shift+C</kbd> Copy result</div>
            <div className="text-dark-400"><kbd className="bg-dark-700 px-1.5 py-0.5 rounded text-dark-300">Ctrl+1/2/3/4</kbd> Switch level</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-4">
        {/* Rewrite Level */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Rewrite Level</label>
          <div className="flex gap-2 flex-wrap">
            {REWRITE_LEVELS.map(l => (
              <button key={l.id} onClick={() => setLevel(l.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${level === l.id ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'}`}>
                {l.name} <span className="text-xs opacity-70">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style + Tone Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Writing Style</label>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => (
                <button key={s} onClick={() => setStyle(s)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${style === s ? 'bg-accent-500 text-white' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Tone</label>
            <select value={tone} onChange={e => setTone(e.target.value as TonePreset)}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50">
              {TONES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
            </select>
          </div>
        </div>

        {/* Custom Tone */}
        {tone === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Custom Tone Description</label>
            <input type="text" value={customTone} onChange={e => setCustomTone(e.target.value)}
              placeholder="e.g., Write like a tired grad student at 3am..."
              className="w-full px-4 py-2 bg-dark-800 border border-dark-700/50 rounded-lg text-white placeholder-dark-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50" />
          </div>
        )}

        {/* Advanced Options */}
        <div>
          <button onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors">
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Advanced Options
          </button>
          {showAdvanced && (
            <div className="mt-3 grid md:grid-cols-2 gap-4 animate-fade-in">
              {/* Target Score */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                  <Target className="w-4 h-4 text-accent-400" /> Target Human Score: {targetScore}%
                </label>
                <input type="range" min="50" max="100" step="5" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                  className="w-full accent-accent-500" />
                <div className="flex justify-between text-xs text-dark-500 mt-1">
                  <span>50%</span><span>75%</span><span>100%</span>
                </div>
              </div>
              {/* Language */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                  <Languages className="w-4 h-4 text-accent-400" /> Language
                </label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50">
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input/Output */}
      <div className={`grid gap-6 ${showComparison && result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-dark-300">Input Text</label>
            <span className={`text-xs ${wordCount > 10000 ? 'text-red-400' : 'text-dark-500'}`}>{wordCount} / 10,000 words</span>
          </div>
          <textarea value={inputText} onChange={e => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            className="w-full h-64 p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all text-sm leading-relaxed" />
          <div className="mt-3">
            <button onClick={handleHumanize} disabled={loading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> {progress.message} (Pass {progress.pass}/{progress.max})</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Humanize Text</>
              )}
            </button>
          </div>
          {loading && (
            <div className="mt-3 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full progress-bar"
                style={{ width: `${progress.max > 0 ? (progress.pass / progress.max) * 100 : 0}%` }} />
            </div>
          )}
        </div>

        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-dark-300">
                Humanized Output
                {detection && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    detection.score >= 70 ? 'bg-green-500/20 text-green-400' : detection.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {detection.score}% Human ({result.passes} pass{result.passes > 1 ? 'es' : ''})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowComparison(!showComparison)} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Compare view">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => setShowReadability(!showReadability)} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Readability">
                  <Type className="w-4 h-4" />
                </button>
                <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDownload('txt')} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="TXT">
                  <FileText className="w-4 h-4" />
                </button>
                <button onClick={() => handleDownload('docx')} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="DOCX">
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full h-64 p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white overflow-y-auto">
              {showComparison ? (
                <div className="space-y-3">
                  {result.sentences.filter(s => s.original).map((s, i) => (
                    <div key={i} className="group">
                      <p className="text-dark-500 text-xs line-through mb-1">{s.original}</p>
                      <div className={`sentence-highlight cursor-pointer p-1.5 rounded border ${
                        s.detectionScore && s.detectionScore >= 60 ? 'border-green-500/30' : s.detectionScore && s.detectionScore >= 40 ? 'border-yellow-500/30' : 'border-red-500/30'
                      }`} onClick={() => handleGetAlternatives(i)}>
                        <p className="text-sm text-dark-200">{s.humanized}</p>
                        {s.detectionScore !== undefined && (
                          <span className={`text-xs ${s.detectionScore >= 60 ? 'text-green-400' : s.detectionScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {s.detectionScore}% •
                          </span>
                        )}
                        <ChevronDown className="w-3 h-3 inline text-dark-500 group-hover:text-accent-400" />
                      </div>
                      {expandedSentence === i && alternatives[i] && (
                        <div className="ml-4 mt-1 space-y-1">
                          {alternatives[i].map((alt, j) => (
                            <button key={j} onClick={() => handleSelectAlternative(i, alt)}
                              className="block w-full text-left text-xs text-dark-300 hover:text-accent-400 px-2 py-1 rounded hover:bg-dark-700/50 transition-colors">
                              → {alt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.fullText}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Readability Panel */}
      {showReadability && detection && (
        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 animate-fade-in">
          <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-accent-400" /> Readability Analysis
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-dark-700/30 rounded-lg p-3 text-center">
              <p className={`text-xl font-bold ${readLabel?.color || 'text-dark-200'}`}>{detection.readability.fleschReadingEase}</p>
              <p className="text-xs text-dark-400">Flesch Reading Ease</p>
              <p className={`text-xs mt-1 ${readLabel?.color || 'text-dark-500'}`}>{readLabel?.label}</p>
            </div>
            <div className="bg-dark-700/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-dark-200">{detection.readability.fleschKincaidGrade}</p>
              <p className="text-xs text-dark-400">Grade Level</p>
              <p className="text-xs text-dark-500 mt-1">{detection.readability.fleschKincaidGrade <= 12 ? 'Accessible' : 'Advanced'}</p>
            </div>
            <div className="bg-dark-700/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-dark-200">{detection.readability.avgWordsPerSentence}</p>
              <p className="text-xs text-dark-400">Avg Words/Sentence</p>
            </div>
            <div className="bg-dark-700/30 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-dark-200">{detection.readability.readingTimeMinutes}m</p>
              <p className="text-xs text-dark-400">Reading Time</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-slide-up">
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-accent-400">{result.wordCount.input}</p>
            <p className="text-xs text-dark-400">Input Words</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-accent-400">{result.wordCount.output}</p>
            <p className="text-xs text-dark-400">Output Words</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-accent-400">{result.modelName}</p>
            <p className="text-xs text-dark-400">Model</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${detection ? getScoreColor(detection.score) : 'text-dark-400'}`}>{detection?.score || 0}%</p>
            <p className="text-xs text-dark-400">Human Score</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-dark-200">{result.passes}</p>
            <p className="text-xs text-dark-400">Passes</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !inputText && (
        <div className="bg-dark-800/30 border border-dark-700/30 rounded-xl p-8 text-center">
          <ArrowRight className="w-8 h-8 text-accent-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">Ready to Humanize</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-4 text-dark-400 text-sm">
            <div>
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <p>Paste AI-generated text</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <p>Choose level, style, and tone</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <p>Get 100% human text back</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
