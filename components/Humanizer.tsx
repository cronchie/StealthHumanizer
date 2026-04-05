'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Sparkles, Copy, Download, FileText, RefreshCw, Zap, Eye,
  FileDown, Target, ChevronDown, ChevronUp, Keyboard, ArrowRight,
  Type, Languages, Upload, RotateCcw, CheckCircle, AlertTriangle,
  X, FileUp
} from 'lucide-react';
import { RewriteLevel, StylePreset, TonePreset, HumanizationResult, ModelProvider } from '@/lib/types';
import { TONE_CONFIGS, SAMPLE_AI_TEXT, SAMPLE_TECHNICAL_TEXT } from '@/lib/prompts';
import { detectAI, getScoreColor, getScoreBarColor } from '@/lib/detector';
import { getReadabilityLabel } from '@/lib/readability';
import { countWords, downloadAsTxt, downloadAsDocx } from '@/lib/storage';
import { PROVIDERS } from '@/lib/providers';

const REWRITE_LEVELS: { id: RewriteLevel; name: string; desc: string }[] = [
  { id: 'light', name: '🪶 Light', desc: 'Subtle fixes' },
  { id: 'medium', name: '✨ Medium', desc: 'Noticeable rewrite' },
  { id: 'aggressive', name: '🔥 Aggressive', desc: 'Complete rewrite' },
  { id: 'ninja', name: '🥷 Ninja', desc: 'Maximum stealth' },
];

const STYLES: { id: StylePreset; name: string; icon: string }[] = [
  { id: 'humanize', name: 'Humanize', icon: '🧑' },
  { id: 'academic', name: 'Academic', icon: '🎓' },
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'casual', name: 'Casual', icon: '☕' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'technical', name: 'Technical', icon: '⚙️' },
];

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
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
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

interface GrammarIssue {
  type: string;
  original: string;
  suggestion: string;
  explanation: string;
}

interface HumanizerProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Humanizer({ showToast }: HumanizerProps) {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<HumanizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ pass: 0, max: 0, message: '' });
  const [level, setLevel] = useState<RewriteLevel>('medium');
  const [style, setStyle] = useState<StylePreset>('humanize');
  const [tone, setTone] = useState<TonePreset>('conversational');
  const [customTone, setCustomTone] = useState('');
  const [language, setLanguage] = useState('auto');
  const [targetScore, setTargetScore] = useState(80);
  const [expandedSentence, setExpandedSentence] = useState<number | null>(null);
  const [alternatives, setAlternatives] = useState<Record<number, string[]>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [showReadability, setShowReadability] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // File upload
  const [fileUploading, setFileUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grammar check
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [grammarChecking, setGrammarChecking] = useState(false);
  const [correctedText, setCorrectedText] = useState('');

  // Re-humanize
  const [rehumanizing, setRehumanizing] = useState(false);
  const [writingSample, setWritingSample] = useState('');

  // Pipeline options
  const [enablePostprocess, setEnablePostprocess] = useState(true);
  const [characterShield, setCharacterShield] = useState(false);
  const [enableChain, setEnableChain] = useState(false);
  const [selectedChainModels, setSelectedChainModels] = useState<string[]>([]);
  const [pipelineStep, setPipelineStep] = useState('');

  const wordCount = countWords(inputText);

  useEffect(() => {
    const reuse = sessionStorage.getItem('stealthhumanizer_reuse_text');
    if (reuse) { setInputText(reuse); sessionStorage.removeItem('stealthhumanizer_reuse_text'); }
  }, []);

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

  const getApiCredentials = () => {
    let keys: Record<string, string | undefined> = {};
    try { const s = localStorage.getItem('stealthhumanizer_api_keys'); if (s) keys = JSON.parse(s); } catch {}
    const providerId = Object.keys(keys).find(k => keys[k]) || 'gemini';
    const apiKey = keys[providerId];
    return { providerId, apiKey };
  };

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) { showToast('warning', 'Please enter some text to humanize.'); return; }
    if (wordCount > 10000) { showToast('warning', 'Maximum 10,000 words per input.'); return; }
    const { providerId, apiKey } = getApiCredentials();
    if (!apiKey) { showToast('warning', 'Please add an API key in Settings first. Gemini is free!'); return; }

    setLoading(true);
    setResult(null);
    setGrammarIssues([]);
    setCorrectedText('');
    setPipelineStep('Step 1: LLM Rewrite...');
    setProgress({ pass: 0, max: level === 'ninja' ? 3 : level === 'aggressive' ? 3 : 2, message: 'Layer 1: LLM Rewrite...' });

    try {
      // Get all available API keys
      let allApiKeys: Record<string, string | undefined> = {};
      try { const s = localStorage.getItem('stealthhumanizer_api_keys'); if (s) allApiKeys = JSON.parse(s); } catch {}

      const response = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText, level, style, tone, customTone,
          model: providerId, apiKey, targetScore, language, writingSample,
          postprocess: enablePostprocess,
          characterShield,
          chainModels: enableChain ? selectedChainModels : [],
          apiKeys: allApiKeys,
        }),
      });
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed'); }
      const data = await response.json();
      setResult(data);
      setPipelineStep('');
      setProgress({ pass: 1, max: 1, message: 'Done!' });

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
      const { providerId, apiKey } = getApiCredentials();
      if (!apiKey) return;
      const resp = await fetch('/api/alternative', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original: sentence.original, current: sentence.humanized, level, style, tone, customTone, model: providerId, apiKey }),
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

  // File upload handler
  const handleFileUpload = async (file: File) => {
    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!resp.ok) { const err = await resp.json(); throw new Error(err.error || 'Upload failed'); }
      const data = await resp.json();
      setInputText(data.text);
      showToast('success', `Loaded ${file.name} (${countWords(data.text)} words)`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload file');
    } finally {
      setFileUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Re-humanize flagged sentences
  const handleRehumanize = async () => {
    if (!result) return;
    const { providerId, apiKey } = getApiCredentials();
    if (!apiKey) { showToast('warning', 'No API key configured'); return; }

    const detection = detectAI(result.fullText);
    const flagged = detection.sentences.filter((s: any) => s.classification !== 'human').map((s: any) => s.text);
    if (flagged.length === 0) { showToast('info', 'No flagged sentences to re-humanize!'); return; }

    setRehumanizing(true);
    try {
      const resp = await fetch('/api/rehumanize', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flaggedSentences: flagged, level, style, tone, customTone,
          model: providerId, apiKey, fullText: result.fullText,
        }),
      });
      if (!resp.ok) throw new Error('Re-humanization failed');
      const data = await resp.json();
      
      const newDetection = detectAI(data.fullText);
      const origSentences = result.sentences.map((s: any) => s.original);
      const newSentencesSplit = data.fullText.match(/[^.!?]+[.!?]+[\s]*/g)?.map((s: string) => s.trim()).filter((s: string) => s.length > 0) || [data.fullText.trim()];
      const maxLen = Math.max(origSentences.length, newSentencesSplit.length);
      const sentences = [];
      for (let i = 0; i < maxLen; i++) {
        sentences.push({
          original: origSentences[i] || '',
          humanized: newSentencesSplit[i] || '',
          alternatives: [], index: i,
          detectionScore: newDetection.sentences[i]?.score,
        });
      }

      setResult({
        ...result,
        sentences,
        fullText: data.fullText,
        passes: result.passes + 1,
        finalScore: newDetection.score,
        wordCount: { ...result.wordCount, output: countWords(data.fullText) },
      });
      showToast('success', `Re-humanized ${flagged.length} sentences → ${newDetection.score}% human`);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setRehumanizing(false);
    }
  };

  // Grammar check
  const handleGrammarCheck = async () => {
    if (!result) return;
    const { providerId, apiKey } = getApiCredentials();
    if (!apiKey) { showToast('warning', 'No API key configured'); return; }

    setGrammarChecking(true);
    try {
      const resp = await fetch('/api/grammar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: result.fullText, model: providerId, apiKey }),
      });
      if (!resp.ok) throw new Error('Grammar check failed');
      const data = await resp.json();
      setGrammarIssues(data.issues || []);
      setCorrectedText(data.correctedText || result.fullText);
      if (data.issues.length === 0) {
        showToast('success', 'No grammar issues found! ✅');
      } else {
        showToast('info', `Found ${data.issues.length} issue(s)`);
      }
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setGrammarChecking(false);
    }
  };

  const handleApplyGrammarFix = () => {
    if (!result || !correctedText) return;
    const newSentencesSplit = correctedText.match(/[^.!?]+[.!?]+[\s]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [correctedText.trim()];
    const maxLen = Math.max(result.sentences.length, newSentencesSplit.length);
    const sentences = [];
    for (let i = 0; i < maxLen; i++) {
      sentences.push({
        original: result.sentences[i]?.original || '',
        humanized: newSentencesSplit[i] || '',
        alternatives: [], index: i,
        detectionScore: result.sentences[i]?.detectionScore,
      });
    }
    setResult({
      ...result,
      sentences,
      fullText: correctedText,
      wordCount: { ...result.wordCount, output: countWords(correctedText) },
    });
    setGrammarIssues([]);
    setCorrectedText('');
    showToast('success', 'Grammar corrections applied!');
  };

  const detection = result ? detectAI(result.fullText) : null;
  const readLabel = detection ? getReadabilityLabel(detection.readability.fleschReadingEase) : null;
  const flaggedCount = detection?.sentences.filter(s => s.classification !== 'human').length || 0;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-400" /> AI Text Humanizer
          </h2>
          <p className="text-dark-400 mt-1">Transform AI text into undetectable human writing</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowShortcuts(!showShortcuts)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <Keyboard className="w-4 h-4" /> Shortcuts
          </button>
          <button onClick={() => setInputText(SAMPLE_AI_TEXT)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <Zap className="w-4 h-4" /> Sample
          </button>
          <button onClick={() => setInputText(SAMPLE_TECHNICAL_TEXT)} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white text-sm transition-colors">
            <FileText className="w-4 h-4" /> Tech Sample
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts */}
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

        {/* Style + Tone */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Writing Style</label>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => (
                <button key={s.id} onClick={() => setStyle(s.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${style === s.id ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25' : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'}`}>
                  <span>{s.icon}</span> {s.name}
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
            <div className="mt-3 space-y-4 animate-fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                    <Target className="w-4 h-4 text-accent-400" /> Target Human Score: {targetScore}%
                  </label>
                  <input type="range" min="50" max="100" step="5" value={targetScore} onChange={e => setTargetScore(Number(e.target.value))}
                    className="w-full accent-accent-500" />
                  <div className="flex justify-between text-xs text-dark-500 mt-1"><span>50%</span><span>75%</span><span>100%</span></div>
                </div>
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
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-dark-300 mb-2">
                  <Type className="w-4 h-4 text-accent-400" /> Your Writing Sample (optional)
                </label>
                <textarea value={writingSample} onChange={e => setWritingSample(e.target.value)}
                  placeholder="Paste a sample of your own writing here... The AI will match your personal writing style, vocabulary, and sentence patterns. This dramatically improves humanization."
                  className="w-full h-24 p-3 bg-dark-800 border border-dark-700/50 rounded-lg text-white placeholder-dark-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50" />
                <p className="text-xs text-dark-500 mt-1">When provided, the humanized output will match your personal writing style</p>
              </div>

              {/* Pipeline Controls */}
              <div className="border-t border-dark-700/30 pt-4 space-y-4">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-400" /> Pipeline Engine
                </h4>

                {/* Post-Processing Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-200">Non-LLM Post-Processing</p>
                    <p className="text-xs text-dark-500">Synonym swaps, collocation replacements, sentence manipulation</p>
                  </div>
                  <button
                    onClick={() => setEnablePostprocess(!enablePostprocess)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enablePostprocess ? 'bg-accent-500' : 'bg-dark-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enablePostprocess ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Character Shield Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-200">🛡️ Character Shield</p>
                    <p className="text-xs text-dark-500">Insert invisible Unicode chars to disrupt AI detector tokenization</p>
                  </div>
                  <button
                    onClick={() => setCharacterShield(!characterShield)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${characterShield ? 'bg-accent-500' : 'bg-dark-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${characterShield ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Multi-Model Chain Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-200">Multi-Model Chain</p>
                    <p className="text-xs text-dark-500">Pass text through multiple AI models to mix fingerprints</p>
                  </div>
                  <button
                    onClick={() => {
                      const newVal = !enableChain;
                      setEnableChain(newVal);
                      // Default to free models when enabling
                      if (newVal && selectedChainModels.length === 0) {
                        setSelectedChainModels(['gemini', 'groq']);
                      }
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enableChain ? 'bg-accent-500' : 'bg-dark-600'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${enableChain ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                {/* Chain Model Selection */}
                {enableChain && (
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-xs text-dark-400">Select models to chain through (requires API keys in Settings):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {PROVIDERS.filter(p => p.free).map(p => (
                        <label key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          selectedChainModels.includes(p.id)
                            ? 'bg-accent-500/20 border border-accent-500/50 text-accent-300'
                            : 'bg-dark-700/30 border border-dark-700/30 text-dark-400 hover:text-dark-200'
                        }`}>
                          <input
                            type="checkbox"
                            checked={selectedChainModels.includes(p.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedChainModels(prev => [...prev, p.id]);
                              } else {
                                setSelectedChainModels(prev => prev.filter(id => id !== p.id));
                              }
                            }}
                            className="accent-accent-500"
                          />
                          <span className="truncate">{p.name}</span>
                          {p.free && <span className="text-green-400 text-[10px]">FREE</span>}
                        </label>
                      ))}
                    </div>
                    {selectedChainModels.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-dark-400">
                        <span>Pipeline: LLM Rewrite → Post-Process →</span>
                        {selectedChainModels.map((id, i) => {
                          const p = PROVIDERS.find(pr => pr.id === id);
                          return (
                            <span key={id}>
                              {i > 0 ? ' → ' : ''}{p?.name || id}
                            </span>
                          );
                        })}
                        <span>→ Polish</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Pipeline Visual */}
                {(enablePostprocess || enableChain) && (
                  <div className="bg-dark-700/20 rounded-lg p-3">
                    <p className="text-xs text-dark-400 mb-2">Active Pipeline:</p>
                    <div className="flex items-center gap-1 flex-wrap text-xs">
                      <span className="px-2 py-1 rounded bg-accent-500/20 text-accent-300">① LLM Rewrite</span>
                      <span className="text-dark-600">→</span>
                      {enablePostprocess && (
                        <>
                          <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">② Post-Process</span>
                          <span className="text-dark-600">→</span>
                        </>
                      )}
                      {enableChain && selectedChainModels.map((id, i) => (
                        <span key={id}>
                          <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300">③{i > 0 ? '+' + (i+1) : ''} Chain: {PROVIDERS.find(p => p.id === id)?.name}</span>
                          <span className="text-dark-600">→</span>
                        </span>
                      ))}
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">④ Polish</span>
                    </div>
                  </div>
                )}
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
            <div className="flex items-center gap-2">
              <span className={`text-xs ${wordCount > 10000 ? 'text-red-400' : 'text-dark-500'}`}>{wordCount} / 10,000 words</span>
              <button onClick={() => fileInputRef.current?.click()} disabled={fileUploading}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-colors disabled:opacity-50">
                <Upload className="w-3 h-3" /> {fileUploading ? 'Loading...' : 'Upload File'}
              </button>
              <input ref={fileInputRef} type="file" accept=".txt,.docx,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative`}
          >
            {dragOver && (
              <div className="absolute inset-0 z-10 border-2 border-dashed border-accent-400 bg-accent-500/10 rounded-xl flex items-center justify-center">
                <div className="text-center text-accent-400">
                  <FileUp className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Drop file here</p>
                  <p className="text-xs">.txt, .docx, .pdf</p>
                </div>
              </div>
            )}
            <textarea value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder="Paste your AI-generated text here... or drag & drop a .txt/.docx/.pdf file"
              className="w-full h-64 p-4 glass-card rounded-xl text-white placeholder-dark-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all text-sm leading-relaxed" />
          </div>

          <div className="mt-3">
            <button onClick={handleHumanize} disabled={loading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> {pipelineStep || `${progress.message} (Pass ${progress.pass}/${progress.max})`}</>
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
                    ~{detection.score}% Human ({result.passes} pass{result.passes > 1 ? 'es' : ''})
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
            <div className="w-full h-64 p-4 glass-card rounded-xl text-white overflow-y-auto">
              {showComparison ? (
                <div className="space-y-3">
                  {result.sentences.filter(s => s.original).map((s, i) => {
                    const score = s.detectionScore ?? 50;
                    const isFlagged = score < 60;
                    return (
                      <div key={i} className="group">
                        <p className="text-dark-500 text-xs line-through mb-1">{s.original}</p>
                        <div className={`sentence-highlight cursor-pointer p-1.5 rounded border ${
                          !isFlagged ? 'border-green-500/30' : score >= 40 ? 'border-yellow-500/30' : 'border-red-500/30'
                        }`} onClick={() => handleGetAlternatives(i)}>
                          <p className="text-sm text-dark-200">{s.humanized}</p>
                          {s.detectionScore !== undefined && (
                            <span className={`text-xs ${s.detectionScore >= 60 ? 'text-green-400' : s.detectionScore >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {s.detectionScore}% {isFlagged && '⚠'} •
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
                    );
                  })}
                </div>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.fullText}</p>
              )}
            </div>

            {/* Action buttons after humanization */}
            <div className="mt-3 flex gap-2 flex-wrap">
              <button onClick={handleRehumanize} disabled={rehumanizing || flaggedCount === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <RotateCcw className={`w-4 h-4 ${rehumanizing ? 'animate-spin' : ''}`} />
                {rehumanizing ? 'Re-humanizing...' : `🔄 Re-Humanize Flagged (${flaggedCount})`}
              </button>
              <button onClick={handleGrammarCheck} disabled={grammarChecking}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <CheckCircle className={`w-4 h-4 ${grammarChecking ? 'animate-spin' : ''}`} />
                {grammarChecking ? 'Checking...' : '📝 Grammar Check'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grammar Issues Panel */}
      {grammarIssues.length > 0 && (
        <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" /> Grammar Issues ({grammarIssues.length})
            </h3>
            <div className="flex gap-2">
              <button onClick={handleApplyGrammarFix}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                <CheckCircle className="w-3 h-3" /> Apply All Fixes
              </button>
              <button onClick={() => { setGrammarIssues([]); setCorrectedText(''); }}
                className="p-1.5 rounded-lg hover:bg-dark-700/50 text-dark-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {grammarIssues.map((issue, i) => (
              <div key={i} className="bg-dark-700/30 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                    issue.type === 'spelling' ? 'bg-red-500/20 text-red-400' :
                    issue.type === 'grammar' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{issue.type}</span>
                  <div className="flex-1">
                    <p className="text-dark-300"><span className="line-through text-red-400/60">{issue.original}</span> → <span className="text-green-400">{issue.suggestion}</span></p>
                    <p className="text-dark-500 text-xs mt-1">{issue.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <p className="text-xs text-dark-500 mt-3">ℹ️ Detection scores are estimated using heuristic analysis. For accurate results, use a dedicated AI detection service.</p>
        </div>
      )}

      {/* Stats */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-slide-up">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-accent-400">{result.wordCount.input}</p>
            <p className="text-xs text-dark-400">Input Words</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-accent-400">{result.wordCount.output}</p>
            <p className="text-xs text-dark-400">Output Words</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-sm font-bold text-accent-400">{result.modelName}</p>
            <p className="text-xs text-dark-400">Model</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className={`text-xl font-bold ${detection ? getScoreColor(detection.score) : 'text-dark-400'}`}>~{detection?.score || 0}%</p>
            <p className="text-xs text-dark-400">Est. Human Score</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
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
              <p>Paste text or upload a file</p>
              <p className="text-xs mt-1 text-dark-500">.txt, .docx, .pdf supported</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
              <p>Choose level, style, and tone</p>
              <p className="text-xs mt-1 text-dark-500">🧑 Humanize is recommended</p>
            </div>
            <div>
              <div className="w-8 h-8 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
              <p>Get human-sounding text back</p>
              <p className="text-xs mt-1 text-dark-500">Re-humanize flagged sentences</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
