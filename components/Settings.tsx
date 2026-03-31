'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, Eye, EyeOff, ExternalLink, Shield, Check, X, Zap } from 'lucide-react';
import { PROVIDERS, getProvider, testApiKey } from '@/lib/providers';
import { getApiKeys, setApiKeys, clearApiKeys } from '@/lib/storage';

interface SettingsProps {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function Settings({ showToast }: SettingsProps) {
  const [keys, setKeys] = useState<Record<string, string | undefined>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [testing, setTesting] = useState<string | null>(null);

  useEffect(() => { setKeys(getApiKeys()); }, []);

  const handleSave = (id: string, key: string) => {
    const newKeys = { ...keys, [id]: key || undefined };
    setKeys(newKeys);
    setApiKeys(newKeys);
    showToast('success', `${getProvider(id as any)?.name || id} API key saved!`);
  };

  const handleClearAll = () => { setKeys({}); clearApiKeys(); showToast('info', 'All API keys cleared'); };

  const handleTest = async (id: string) => {
    const key = keys[id];
    if (!key) { showToast('warning', 'No API key to test'); return; }
    setTesting(id);
    showToast('info', `Testing ${id}...`);
    try {
      const valid = await testApiKey(id as any, key);
      setTesting(null);
      if (valid) showToast('success', `${id} key is valid! ✅`);
      else showToast('error', `${id} key is invalid ❌`);
    } catch (err: any) {
      setTesting(null);
      showToast('error', `Error: ${err.message}`);
    }
  };

  const current = getProvider(selectedProvider as any);

  const freeProviders = PROVIDERS.filter(p => p.free);
  const paidProviders = PROVIDERS.filter(p => !p.free);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent-400" /> Settings
        </h2>
        <p className="text-dark-400 mt-1">Configure API keys — stored locally in your browser only</p>
      </div>

      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-dark-200">Your API keys are stored <strong>only in your browser&apos;s localStorage</strong>.</p>
          <p className="text-xs text-dark-400 mt-1">They never leave your device. Text goes directly to the AI provider you choose.</p>
        </div>
      </div>

      {/* Free Providers */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" /> Free Providers
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">No cost</span>
        </h3>
        <div className="grid gap-3">
          {freeProviders.map(provider => (
            <div key={provider.id} onClick={() => setSelectedProvider(provider.id)}
              className={`bg-dark-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                selectedProvider === provider.id ? 'border-accent-500/50 bg-accent-500/5' : 'border-dark-700/50 hover:border-dark-600'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{provider.name}</h4>
                    {keys[provider.id] && <Check className="w-4 h-4 text-green-400" />}
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">FREE</span>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{provider.description}</p>
                </div>
                <Eye className="w-4 h-4 text-dark-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Providers */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Paid Providers</h3>
        <div className="grid gap-3">
          {paidProviders.map(provider => (
            <div key={provider.id} onClick={() => setSelectedProvider(provider.id)}
              className={`bg-dark-800/50 border rounded-xl p-4 cursor-pointer transition-all ${
                selectedProvider === provider.id ? 'border-accent-500/50 bg-accent-500/5' : 'border-dark-700/50 hover:border-dark-600'
              }`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{provider.name}</h4>
                    {keys[provider.id] && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{provider.description}</p>
                </div>
                <Eye className="w-4 h-4 text-dark-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Provider Config */}
      {current && (
        <div className="bg-dark-800/50 border border-accent-500/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">{current.name}</h3>
              <p className="text-sm text-dark-400">{current.description}</p>
            </div>
            {current.free && <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">Free</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input type={showKeys[current.id] ? 'text' : 'password'}
                  value={keys[current.id] || ''}
                  onChange={e => setKeys(prev => ({ ...prev, [current.id]: e.target.value }))}
                  placeholder={current.placeholder}
                  className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 pr-10" />
                <button onClick={() => setShowKeys(prev => ({ ...prev, [current.id]: !prev[current.id] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showKeys[current.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={() => handleSave(current.id, keys[current.id] || '')}
                className="px-4 py-3 rounded-lg bg-accent-500 text-white font-medium hover:bg-accent-600 transition-colors">
                Save
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleTest(current.id)} disabled={testing === current.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm disabled:opacity-50">
              {testing === current.id ? <div className="w-4 h-4 border-2 border-dark-400 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              {testing === current.id ? 'Testing...' : 'Test Key'}
            </button>
            <a href={current.getApiKeyUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm">
              <ExternalLink className="w-4 h-4" /> Get API Key
            </a>
            {current.docsUrl && (
              <a href={current.docsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm">
                <ExternalLink className="w-4 h-4" /> Docs
              </a>
            )}
          </div>

          {/* Model selector */}
          {current.models.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Model</label>
              <div className="flex flex-wrap gap-2">
                {current.models.map(m => (
                  <span key={m} className="px-3 py-1 rounded-lg bg-dark-700/50 text-dark-300 text-xs">{m}</span>
                ))}
              </div>
              <p className="text-xs text-dark-500 mt-1">Default: {current.defaultModel}</p>
            </div>
          )}

          {/* Gemini setup guide */}
          {current.id === 'gemini' && (
            <div className="bg-dark-900/50 rounded-lg p-4 text-sm space-y-1">
              <h4 className="font-medium text-dark-200">🆓 How to get a free Gemini API key:</h4>
              <ol className="text-dark-400 list-decimal list-inside space-y-0.5">
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" className="text-accent-400 hover:underline">Google AI Studio</a></li>
                <li>Sign in with Google</li>
                <li>Click &quot;Create API Key&quot;</li>
                <li>Copy & paste above — done! (15 req/min free)</li>
              </ol>
            </div>
          )}

          {/* Groq setup */}
          {current.id === 'groq' && (
            <div className="bg-dark-900/50 rounded-lg p-4 text-sm space-y-1">
              <h4 className="font-medium text-dark-200">🆓 Groq — Ultra-fast free inference:</h4>
              <ol className="text-dark-400 list-decimal list-inside space-y-0.5">
                <li>Go to <a href="https://console.groq.com/keys" target="_blank" className="text-accent-400 hover:underline">Groq Console</a></li>
                <li>Sign up (free)</li>
                <li>Create API key</li>
                <li>Paste above — uses Llama 3.3 70B for free!</li>
              </ol>
            </div>
          )}

          {/* OpenRouter setup */}
          {current.id === 'openrouter' && (
            <div className="bg-dark-900/50 rounded-lg p-4 text-sm space-y-1">
              <h4 className="font-medium text-dark-200">🆓 OpenRouter — Access to many free models:</h4>
              <ol className="text-dark-400 list-decimal list-inside space-y-0.5">
                <li>Go to <a href="https://openrouter.ai/keys" target="_blank" className="text-accent-400 hover:underline">OpenRouter Keys</a></li>
                <li>Sign up and create key</li>
                <li>Some models are free, others cost credits</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Provider Priority */}
      <div className="bg-dark-800/50 border border-dark-700/50 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-3">Priority Order</h3>
        <p className="text-sm text-dark-400 mb-4">When multiple keys are set, first available is used:</p>
        <div className="space-y-2">
          {PROVIDERS.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-dark-700/30 text-sm">
              <span className="w-6 h-6 rounded-full bg-dark-700 text-dark-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="text-dark-200 flex-1">{p.name}</span>
              {keys[p.id] ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-dark-600" />}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-500/30 rounded-xl p-6">
        <h3 className="text-lg font-medium text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-dark-400 mb-3">Remove all API keys from this browser.</p>
        <button onClick={handleClearAll} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium">Clear All API Keys</button>
      </div>
    </div>
  );
}
