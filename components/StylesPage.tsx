'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Save, RotateCcw } from 'lucide-react';
import {
  loadStyleConfig,
  saveStyleConfig,
  DEFAULT_SCHEMA_PROMPT,
  type StyleConfig,
} from '@/lib/style-config';

interface Props {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function StylesPage({ showToast }: Props) {
  const [config, setConfig] = useState<StyleConfig>({ userSystemPrompt: '', schemaSystemPrompt: DEFAULT_SCHEMA_PROMPT });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setConfig(loadStyleConfig());
  }, []);

  function update(patch: Partial<StyleConfig>) {
    setConfig(prev => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function handleSave() {
    saveStyleConfig(config);
    setDirty(false);
    showToast('success', 'Style config saved.');
  }

  function resetSchema() {
    update({ schemaSystemPrompt: DEFAULT_SCHEMA_PROMPT });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h2 className="text-xl font-semibold text-white">Styles</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      {/* User system prompt */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-white">User system prompt</h3>
          <p className="text-xs text-dark-400 mt-0.5">
            Your personal voice, style rules, and writing conventions. The model uses this to understand how your prose should read. When this is set, the Humanizer routes through the structured rewrite pipeline.
          </p>
        </div>
        <textarea
          value={config.userSystemPrompt}
          onChange={e => update({ userSystemPrompt: e.target.value })}
          placeholder="Describe your style, voice, banned words, tone, and any other writing rules you want enforced…"
          rows={16}
          className="w-full px-3 py-2.5 bg-dark-900/60 border border-dark-700/50 rounded-lg text-sm text-white placeholder-dark-600 focus:outline-none focus:ring-1 focus:ring-accent-500/50 resize-y font-mono leading-relaxed"
        />
        <p className="text-xs text-dark-500">{config.userSystemPrompt.length} chars</p>
      </div>

      {/* Schema system prompt */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Response schema</h3>
            <p className="text-xs text-dark-400 mt-0.5">
              Appended after the user prompt. Tells the model how to format its output — a JSON object listing which sentences violated which rules, the offending tokens, and the proposed fix. Only sentences with violations are rewritten.
            </p>
          </div>
          <button
            onClick={resetSchema}
            className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white transition-colors whitespace-nowrap flex-shrink-0 mt-0.5"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
        <textarea
          value={config.schemaSystemPrompt}
          onChange={e => update({ schemaSystemPrompt: e.target.value })}
          rows={14}
          className="w-full px-3 py-2.5 bg-dark-900/60 border border-dark-700/50 rounded-lg text-sm text-white placeholder-dark-600 focus:outline-none focus:ring-1 focus:ring-accent-500/50 resize-y font-mono leading-relaxed"
        />
        <p className="text-xs text-dark-500">{config.schemaSystemPrompt.length} chars</p>
      </div>
    </div>
  );
}
