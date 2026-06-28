'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, RotateCcw, BookOpen } from 'lucide-react';
import {
  StyleGuides,
  StyleGuideCategory,
  StyleRule,
  DEFAULT_STYLE_GUIDES,
  loadStyleGuides,
  saveStyleGuides,
  activeRuleCount,
  createRule,
  createCategory,
} from '@/lib/style-guides';

interface Props {
  showToast: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void;
}

export default function StyleGuideManager({ showToast }: Props) {
  const [guides, setGuides] = useState<StyleGuides>(DEFAULT_STYLE_GUIDES);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setGuides(loadStyleGuides());
  }, []);

  function update(next: StyleGuides) {
    setGuides(next);
    saveStyleGuides(next);
  }

  function toggleCategory(catId: string) {
    update(guides.map(c => c.id === catId ? { ...c, enabled: !c.enabled } : c));
  }

  function toggleExpanded(catId: string) {
    setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }));
  }

  function updateCategory(catId: string, patch: Partial<StyleGuideCategory>) {
    update(guides.map(c => c.id === catId ? { ...c, ...patch } : c));
  }

  function deleteCategory(catId: string) {
    update(guides.filter(c => c.id !== catId));
  }

  function addRule(catId: string) {
    update(guides.map(c =>
      c.id === catId ? { ...c, rules: [...c.rules, createRule()] } : c
    ));
  }

  function updateRule(catId: string, ruleId: string, patch: Partial<StyleRule>) {
    update(guides.map(c =>
      c.id === catId
        ? { ...c, rules: c.rules.map(r => r.id === ruleId ? { ...r, ...patch } : r) }
        : c
    ));
  }

  function deleteRule(catId: string, ruleId: string) {
    update(guides.map(c =>
      c.id === catId ? { ...c, rules: c.rules.filter(r => r.id !== ruleId) } : c
    ));
  }

  function addCategory() {
    const cat = createCategory();
    const next = [...guides, cat];
    update(next);
    setExpanded(prev => ({ ...prev, [cat.id]: true }));
  }

  function reset() {
    update(DEFAULT_STYLE_GUIDES);
    setExpanded({});
    showToast('info', 'Style guides reset to defaults (all fields cleared)');
  }

  const total = activeRuleCount(guides);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-medium text-white">Style Guides</h3>
          {total > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-xs font-medium">
              {total} active rule{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <p className="text-xs text-dark-400">
        Active rules are injected into the system prompt and override the default rewriting style. Enable a category, then fill in the rules you want enforced.
      </p>

      <div className="space-y-2">
        {guides.map(cat => {
          const isOpen = !!expanded[cat.id];
          const filledRules = cat.rules.filter(r => r.enabled && r.content.trim().length > 0);

          return (
            <div
              key={cat.id}
              className={`rounded-xl border transition-colors ${
                cat.enabled
                  ? 'border-accent-500/30 bg-dark-800/60'
                  : 'border-dark-700/40 bg-dark-800/30'
              }`}
            >
              {/* Category header */}
              <div className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={cat.enabled}
                  onChange={() => toggleCategory(cat.id)}
                  className="accent-accent-500 w-4 h-4 flex-shrink-0"
                />
                <button
                  onClick={() => toggleExpanded(cat.id)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                >
                  {isOpen
                    ? <ChevronDown className="w-4 h-4 text-dark-400 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-dark-400 flex-shrink-0" />
                  }
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`text-sm font-medium truncate ${cat.enabled ? 'text-white' : 'text-dark-400'}`}>
                      {cat.name}
                    </span>
                    {filledRules.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-accent-500/15 text-accent-400 text-xs flex-shrink-0">
                        {filledRules.length}/{cat.rules.length}
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <span className="text-xs text-dark-500 truncate hidden sm:block max-w-[240px]">
                      {cat.description}
                    </span>
                  )}
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-dark-500 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Expanded rules */}
              {isOpen && (
                <div className="border-t border-dark-700/40 px-3 pb-3 pt-3 space-y-3">
                  {/* Category name & description (editable for custom categories) */}
                  {!cat.isDefault && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Category name</label>
                        <input
                          value={cat.name}
                          onChange={e => updateCategory(cat.id, { name: e.target.value })}
                          className="w-full px-2 py-1.5 bg-dark-900/60 border border-dark-700/50 rounded text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-dark-400 mb-1 block">Description (optional)</label>
                        <input
                          value={cat.description}
                          onChange={e => updateCategory(cat.id, { description: e.target.value })}
                          className="w-full px-2 py-1.5 bg-dark-900/60 border border-dark-700/50 rounded text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-accent-500/50"
                        />
                      </div>
                    </div>
                  )}

                  {/* Rules */}
                  {cat.rules.map(rule => (
                    <div key={rule.id} className="flex gap-2 items-start">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => updateRule(cat.id, rule.id, { enabled: !rule.enabled })}
                        className="accent-accent-500 w-4 h-4 flex-shrink-0 mt-2"
                      />
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <input
                          value={rule.name}
                          onChange={e => updateRule(cat.id, rule.id, { name: e.target.value })}
                          placeholder="Rule name"
                          className="w-full px-2 py-1 bg-dark-900/40 border border-dark-700/30 rounded text-xs text-dark-200 placeholder-dark-600 focus:outline-none focus:ring-1 focus:ring-accent-500/40 focus:border-accent-500/30"
                        />
                        <textarea
                          value={rule.content}
                          onChange={e => updateRule(cat.id, rule.id, { content: e.target.value })}
                          placeholder="Describe this rule in plain language — it will be injected directly into the system prompt…"
                          rows={2}
                          className={`w-full px-2 py-1.5 bg-dark-900/40 border rounded text-sm placeholder-dark-600 resize-none focus:outline-none focus:ring-1 focus:ring-accent-500/40 transition-colors ${
                            rule.enabled && rule.content.trim()
                              ? 'border-accent-500/20 text-white'
                              : 'border-dark-700/30 text-dark-300'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => deleteRule(cat.id, rule.id)}
                        className="text-dark-600 hover:text-red-400 transition-colors flex-shrink-0 mt-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => addRule(cat.id)}
                    className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-accent-400 transition-colors mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add rule
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addCategory}
        className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors border border-dashed border-dark-700/50 hover:border-dark-500 rounded-xl px-4 py-2.5 w-full justify-center"
      >
        <Plus className="w-4 h-4" /> Add custom category
      </button>
    </div>
  );
}
