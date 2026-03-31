'use client';

import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, HelpCircle, BarChart3, Zap } from 'lucide-react';
import { DetectionResult } from '@/lib/types';
import { detectAI, getClassificationColor, getScoreColor } from '@/lib/detector';
import { SAMPLE_AI_TEXT } from '@/lib/prompts';
import { countWords } from '@/lib/storage';

interface DetectorProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Detector({ showToast }: DetectorProps) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDetect = () => {
    if (!text.trim()) {
      showToast('warning', 'Please enter some text to analyze.');
      return;
    }

    setLoading(true);
    // Simulate slight delay for UX
    setTimeout(() => {
      const detection = detectAI(text);
      setResult(detection);
      setLoading(false);
      showToast('info', `Analysis complete: ${detection.score}% human`);
    }, 500);
  };

  const handleLoadSample = () => {
    setText(SAMPLE_AI_TEXT);
    showToast('info', 'Sample AI text loaded!');
  };

  const handleClear = () => {
    setText('');
    setResult(null);
  };

  const scoreColor = result ? getScoreColor(result.score) : 'text-dark-400';
  const verdictIcon = result?.overallVerdict === 'human'
    ? CheckCircle
    : result?.overallVerdict === 'ai'
    ? AlertTriangle
    : HelpCircle;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-accent-400" />
          AI Text Detector
        </h2>
        <p className="text-dark-400 mt-1">Analyze text to determine if it was written by AI or a human</p>
      </div>

      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-dark-300">Text to Analyze</label>
          <div className="flex gap-2">
            <button onClick={handleLoadSample} className="text-xs text-accent-400 hover:text-accent-300 transition-colors">
              Load Sample
            </button>
            {text && (
              <button onClick={handleClear} className="text-xs text-dark-500 hover:text-dark-300 transition-colors">
                Clear
              </button>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste text here to check if it's AI-generated..."
          className="w-full h-48 p-4 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-dark-500">{countWords(text)} words</span>
          <button
            onClick={handleDetect}
            disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-medium transition-all shadow-lg shadow-accent-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Zap className="w-5 h-5 animate-pulse" /> Analyzing...</>
            ) : (
              <><Search className="w-5 h-5" /> Scan for AI</>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Score */}
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
                {result.score}%
              </div>
              <div className="flex items-center justify-center gap-2">
                {(() => {
                  const Icon = verdictIcon;
                  return <Icon className={`w-5 h-5 ${scoreColor}`} />;
                })()}
                <span className={`text-lg font-medium ${scoreColor}`}>
                  {result.overallVerdict === 'human' ? 'Likely Human Written' :
                   result.overallVerdict === 'ai' ? 'Likely AI Generated' :
                   'Mixed - Uncertain'}
                </span>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full progress-bar ${
                  result.score >= 60 ? 'bg-green-500' : result.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-dark-500">
              <span>AI Generated</span>
              <span>Human Written</span>
            </div>
          </div>

          {/* Analysis Metrics */}
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent-400" />
              Detailed Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Burstiness', value: result.analysis.burstiness, desc: 'Sentence variation' },
                { label: 'Vocab Diversity', value: result.analysis.vocabularyDiversity, desc: 'Unique words ratio' },
                { label: 'Perplexity', value: result.analysis.perplexity, desc: 'Predictability score' },
                { label: 'Sentence Variation', value: result.analysis.sentenceLengthVariation, desc: 'Length differences' },
                { label: 'Transition Freq.', value: result.analysis.transitionFrequency, desc: 'AI-like transitions' },
                { label: 'Passive Voice', value: result.analysis.passiveVoiceRatio, desc: 'Passive usage' },
              ].map(metric => (
                <div key={metric.label} className="bg-dark-700/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-dark-400">{metric.label}</span>
                    <span className="text-sm font-medium text-dark-200">{metric.value}%</span>
                  </div>
                  <div className="h-1.5 bg-dark-700 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-accent-500/60 rounded-full"
                      style={{ width: `${Math.min(100, metric.value)}%` }}
                    />
                  </div>
                  <p className="text-xs text-dark-500 mt-1">{metric.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sentence-by-Sentence */}
          <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4">Sentence-by-Sentence Analysis</h3>
            <div className="space-y-2">
              {result.sentences.map((sentence, i) => (
                <div
                  key={i}
                  className={`sentence-highlight p-3 rounded-lg border ${getClassificationColor(sentence.classification)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-dark-200 flex-1">{sentence.text}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                      sentence.classification === 'human'
                        ? 'bg-green-500/20 text-green-400'
                        : sentence.classification === 'maybe'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {sentence.score}%
                    </span>
                  </div>
                  {sentence.issues.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sentence.issues.map((issue, j) => (
                        <span key={j} className="text-xs text-dark-500 bg-dark-700/50 px-2 py-0.5 rounded">
                          {issue}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
