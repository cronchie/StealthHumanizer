'use client';

import { useState, useCallback } from 'react';
import {
  Sparkles, Copy, Download, FileText, ChevronDown,
  ChevronUp, RefreshCw, Zap, Eye, ArrowRight,
  FileDown, FileTextIcon
} from 'lucide-react';
import { RewriteLevel, StylePreset, HumanizationResult } from '@/lib/types';
import { detectAI } from '@/lib/detector';
import { SAMPLE_AI_TEXT } from '@/lib/prompts';
import { countWords, downloadAsTxt, downloadAsDocx } from '@/lib/storage';

interface HumanizerProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Humanizer({ showToast }: HumanizerProps) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState<RewriteLevel>('medium');
  const [style, setStyle] = useState<StylePreset>('academic');
  const [expandedSentence, setExpandedSentence] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<Record<number, string[]>>({});
  const [showComparison, setShowComparison] = useState(false);

  const wordCount = countWords(inputText);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) {
      showToast('warning', 'Please enter some text to humanize.');
      return;
    }

    if (wordCount > 10000) {
      showToast('warning', 'Maximum 10,000 words per input.');
      return;
    }

    // Get API keys
    let keys: Record<string, string | undefined> = {};
    try {
      const stored = localStorage.getItem('stealthhumanizer_api_keys');
      if (stored) keys = JSON.parse(stored);
    } catch {}

    if (!keys.gemini && !keys.openai && !keys.claude) {
      showToast('warning', 'Please add an API key in Settings first. Gemini is free!');
      return;
    }

    const model = keys.gemini ? 'gemini' : keys.openai ? 'openai' : 'claude';
    const apiKey = keys[model];

    setLoading(true);
    setProgress(0);
    setResult(null);

    try {
      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          level,
          style,
          model,
          apiKey,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Humanization failed');
      }

      const data = await response.json();
      setResult(data);
      showToast('success', `Humanized successfully with ${model === 'gemini' ? 'Gemini' : model === 'openai' ? 'GPT-4' : 'Claude'}! (${data.wordCount.output} words)`);
    } catch (err: any) {
      showToast('error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }, [inputText, level, style, showToast, wordCount]);

  const handleLoadSample = () => {
    setInputText(SAMPLE_AI_TEXT);
    showToast('info', 'Sample AI text loaded!');
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.fullText);
      showToast('success', 'Copied to clipboard!');
    }
  };

  const handleDownload = (format: 'txt' | 'docx') => {
    if (result) {
      if (format === 'txt') downloadAsTxt(result.fullText, 'humanized-text');
      else downloadAsDocx(result.fullText, 'humanized-text');
      showToast('success', `Downloaded as ${format.toUpperCase()}!`);
    }
  };

  const handleGetAlternatives = async (index: number) => {
    if (!result || expandedSentence === index) {
      setExpandedSentence(null);
      return;
    }

    setExpandedSentence(index);
    const sentence = result.sentences[index];
    if (!sentence || !sentence.original) return;

    // Check if we already have alternatives
    if (alternatives[index]) return;

    try {
      let keys: Record<string, string | undefined> = {};
      const stored = localStorage.getItem('stealthhumanizer_api_keys');
      if (stored) keys = JSON.parse(stored);

      const model = keys.gemini ? 'gemini' : keys.openai ? 'openai' : 'claude';
      const apiKey = keys[model];

      const response = await fetch('/api/alternative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: sentence.original,
          current: sentence.humanized,
          level,
          style,
          model,
          apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlternatives(prev => ({ ...prev, [index]: data.alternatives }));
      }
    } catch {}
  };

  const handleSelectAlternative = (index: number, alt: string) => {
    if (!result) return;
    const newSentences = [...result.sentences];
    newSentences[index] = { ...newSentences[index], humanized: alt };
    const newFullText = newSentences.map(s => s.humanized).join(' ');
    setResult({ ...result, sentences: newSentences, fullText: newFullText });
    showToast('success', 'Alternative applied!');
  };

  // Run detection on result
  const detection = result ? detectAI(result.fullText) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-400" />
            AI Text Humanizer
          </h2>
          <p className="text-dark-400 mt-1">Transform AI-generated text into natural, human-like writing</p>
        </div>
        <button
          onClick={handleLoadSample}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors text-sm"
        >
          <Zap className="w-4 h-4" />
          Load Sample Text
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        {/* Rewrite Level */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-dark-300 mb-2">Rewrite Level</label>
          <div className="flex gap-2">
            {(['light', 'medium', 'aggressive'] as RewriteLevel[]).map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                  level === l
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                    : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Style Preset */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-dark-300 mb-2">Writing Style</label>
          <div className="flex gap-2">
            {(['academic', 'professional', 'casual'] as StylePreset[]).map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${
                  style === s
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                    : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input/Output */}
      <div className={`grid gap-6 ${showComparison && result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-dark-300">Input Text</label>
            <span className={`text-xs ${wordCount > 10000 ? 'text-red-400' : 'text-dark-500'}`}>
              {wordCount} / 10,000 words
            </span>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            className="w-full h-64 p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleHumanize}
              disabled={loading || !inputText.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Humanizing... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Humanize Text
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="mt-3 h-1.5 bg-dark-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Output */}
        {result && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-dark-300">
                Humanized Output
                {detection && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    detection.overallVerdict === 'human'
                      ? 'bg-green-500/20 text-green-400'
                      : detection.overallVerdict === 'mixed'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {detection.score}% Human
                  </span>
                )}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors"
                  title="Toggle comparison view"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={() => handleDownload('txt')} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Download TXT">
                  <FileText className="w-4 h-4" />
                </button>
                <button onClick={() => handleDownload('docx')} className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors" title="Download DOCX">
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full h-64 p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white overflow-y-auto">
              {showComparison ? (
                <div className="space-y-3">
                  {result.sentences.filter(s => s.original).map((sentence, i) => (
                    <div key={i} className="group">
                      <p className="text-dark-500 text-sm line-through">{sentence.original}</p>
                      <div
                        className="sentence-highlight cursor-pointer text-white"
                        onClick={() => handleGetAlternatives(i)}
                      >
                        <p className="text-sm">{sentence.humanized}</p>
                        <ChevronDown className="w-3 h-3 text-dark-500 group-hover:text-accent-400 transition-colors" />
                      </div>
                      {expandedSentence === i && alternatives[i] && (
                        <div className="ml-4 mt-1 space-y-1">
                          {alternatives[i].map((alt, j) => (
                            <button
                              key={j}
                              onClick={() => handleSelectAlternative(i, alt)}
                              className="block w-full text-left text-sm text-dark-300 hover:text-accent-400 transition-colors px-2 py-1 rounded hover:bg-dark-700/50"
                            >
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

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent-400">{result.wordCount.input}</p>
            <p className="text-xs text-dark-400 mt-1">Input Words</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent-400">{result.wordCount.output}</p>
            <p className="text-xs text-dark-400 mt-1">Output Words</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-accent-400">
              {result.model === 'gemini' ? 'Gemini' : result.model === 'openai' ? 'GPT-4' : 'Claude'}
            </p>
            <p className="text-xs text-dark-400 mt-1">Model Used</p>
          </div>
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${
              detection?.score && detection.score >= 60 ? 'text-green-400' : detection?.score && detection.score >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {detection?.score || 0}%
            </p>
            <p className="text-xs text-dark-400 mt-1">Human Score</p>
          </div>
        </div>
      )}

      {/* How to use */}
      {!result && !inputText && (
        <div className="bg-dark-800/30 border border-dark-700/30 rounded-xl p-6 text-center">
          <ArrowRight className="w-8 h-8 text-accent-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-2">How to Use</h3>
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="text-dark-400">
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
              <p className="text-sm">Paste your AI-generated text</p>
            </div>
            <div className="text-dark-400">
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <p className="text-sm">Choose rewrite level and style</p>
            </div>
            <div className="text-dark-400">
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <p className="text-sm">Click Humanize and get natural text</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
