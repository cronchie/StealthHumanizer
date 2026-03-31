'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Eye, EyeOff, ExternalLink, Shield, Check, X } from 'lucide-react';
import { ApiKeys, ModelProvider } from '@/lib/types';
import { getApiKeys, setApiKeys, clearApiKeys } from '@/lib/storage';

interface SettingsProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

const PROVIDERS: {
  id: ModelProvider;
  name: string;
  description: string;
  free: boolean;
  getUrl: string;
  placeholder: string;
  docsUrl: string;
}[] = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Free tier with generous limits. Recommended!',
    free: true,
    getUrl: 'https://aistudio.google.com/apikey',
    placeholder: 'AIza...',
    docsUrl: 'https://ai.google.dev/docs',
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Paid API, best quality for complex texts',
    free: false,
    getUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/docs',
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'Paid API, excellent for academic writing',
    free: false,
    getUrl: 'https://console.anthropic.com/',
    placeholder: 'sk-ant-...',
    docsUrl: 'https://docs.anthropic.com',
  },
];

export default function Settings({ showToast }: SettingsProps) {
  const [keys, setKeys] = useState<ApiKeys>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [activeProvider, setActiveProvider] = useState<ModelProvider>('gemini');

  useEffect(() => {
    setKeys(getApiKeys());
  }, []);

  const handleSave = (provider: ModelProvider, key: string) => {
    const newKeys = { ...keys, [provider]: key || undefined };
    setKeys(newKeys);
    setApiKeys(newKeys);
    showToast('success', `${PROVIDERS.find(p => p.id === provider)?.name} API key saved!`);
  };

  const handleClearAll = () => {
    setKeys({});
    clearApiKeys();
    showToast('info', 'All API keys cleared');
  };

  const handleToggleVisibility = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleTestKey = async (provider: ModelProvider) => {
    const key = keys[provider];
    if (!key) {
      showToast('warning', 'No API key to test');
      return;
    }

    showToast('info', `Testing ${provider} API key...`);

    try {
      if (provider === 'gemini') {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(key);
        await genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent('Say "ok"');
      } else if (provider === 'openai') {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true });
        await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "ok"' }],
          max_tokens: 5,
        });
      } else if (provider === 'claude') {
        const Anthropic = (await import('@anthropic-ai/sdk')).default;
        const anthropic = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
        await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 5,
          messages: [{ role: 'user', content: 'Say "ok"' }],
        });
      }
      showToast('success', `${provider} API key is valid! ✅`);
    } catch (err: any) {
      showToast('error', `Invalid key: ${err.message}`);
    }
  };

  const currentProvider = PROVIDERS.find(p => p.id === activeProvider)!;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent-400" />
          Settings
        </h2>
        <p className="text-dark-400 mt-1">Configure your API keys. Keys are stored locally in your browser only.</p>
      </div>

      {/* Security notice */}
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-dark-200">Your API keys are stored <strong>only in your browser&apos;s localStorage</strong>.</p>
          <p className="text-xs text-dark-400 mt-1">They are never sent to any server except the API provider directly. No data leaves your machine.</p>
        </div>
      </div>

      {/* Provider tabs */}
      <div className="flex gap-2">
        {PROVIDERS.map(provider => (
          <button
            key={provider.id}
            onClick={() => setActiveProvider(provider.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeProvider === provider.id
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                : 'bg-dark-800 text-dark-300 hover:text-white hover:bg-dark-700'
            }`}
          >
            {provider.name}
            {provider.free && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">FREE</span>
            )}
            {keys[provider.id] && <Check className="w-3 h-3 text-green-400" />}
          </button>
        ))}
      </div>

      {/* Active provider config */}
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">{currentProvider.name}</h3>
            <p className="text-sm text-dark-400">{currentProvider.description}</p>
          </div>
          {currentProvider.free && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
              Free Tier Available
            </span>
          )}
        </div>

        {/* API Key input */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">API Key</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showKeys[currentProvider.id] ? 'text' : 'password'}
                value={keys[currentProvider.id] || ''}
                onChange={e => setKeys(prev => ({ ...prev, [currentProvider.id]: e.target.value }))}
                placeholder={currentProvider.placeholder}
                className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all pr-10"
              />
              <button
                onClick={() => handleToggleVisibility(currentProvider.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
              >
                {showKeys[currentProvider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={() => handleSave(currentProvider.id, keys[currentProvider.id] || '')}
              className="px-4 py-3 rounded-lg bg-accent-500 text-white font-medium hover:bg-accent-600 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTestKey(currentProvider.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors text-sm"
          >
            <Check className="w-4 h-4" />
            Test Key
          </button>
          <a
            href={currentProvider.getUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Get API Key
          </a>
          <a
            href={currentProvider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 transition-colors text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Documentation
          </a>
        </div>

        {/* Setup instructions for Gemini */}
        {activeProvider === 'gemini' && (
          <div className="bg-dark-900/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-dark-200">How to get a free Gemini API key:</h4>
            <ol className="text-xs text-dark-400 space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" className="text-accent-400 hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click &quot;Create API Key&quot;</li>
              <li>Copy the key and paste it above</li>
              <li>That&apos;s it! Free tier includes 15 requests per minute</li>
            </ol>
          </div>
        )}
      </div>

      {/* Model Priority */}
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-3">Model Priority</h3>
        <p className="text-sm text-dark-400 mb-4">
          When multiple API keys are configured, StealthHumanizer uses them in this order:
        </p>
        <div className="space-y-2">
          {PROVIDERS.map((provider, i) => (
            <div key={provider.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-700/30">
              <span className="w-6 h-6 rounded-full bg-dark-700 text-dark-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="text-sm text-dark-200">{provider.name}</span>
              {keys[provider.id] ? (
                <Check className="w-4 h-4 text-green-400 ml-auto" />
              ) : (
                <X className="w-4 h-4 text-dark-600 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-dark-400 mb-3">Clear all stored API keys from your browser.</p>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          Clear All API Keys
        </button>
      </div>
    </div>
  );
}
