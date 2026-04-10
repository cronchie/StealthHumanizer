'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sparkles, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Humanizer from '@/components/Humanizer';
import Detector from '@/components/Detector';
import History from '@/components/History';
import Settings from '@/components/Settings';
import Toast from '@/components/Toast';
import Footer from '@/components/Footer';
import { Toast as ToastType, Tab } from '@/lib/types';
import { getTheme, setTheme as saveTheme } from '@/lib/storage';

function HeroSection() {
  const scrollToHumanizer = () => {
    document.getElementById('humanizer-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 max-w-7xl text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" /> Free & Open Source — No Login Required
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
            Transform <span className="hero-gradient">AI Text</span> Into<br />Natural Writing
          </h1>
          <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-8">
            Free. No login. <strong className="text-dark-200">13 AI providers</strong>. Undetectable.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-10 animate-fade-in-up-delay">
          {[
            { icon: '⚡', label: 'Instant Humanization' },
            { icon: '🥷', label: 'Ninja Mode' },
            { icon: '📄', label: 'Upload PDF/DOCX' },
            { icon: '🔄', label: 'Multi-Pass' },
            { icon: '📝', label: 'Grammar Check' },
            { icon: '🌍', label: 'Multi-Language' },
          ].map(f => (
            <div key={f.label} className="glass-card rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-dark-200 hover:border-accent-500/40 transition-colors">
              <span className="text-lg">{f.icon}</span> {f.label}
            </div>
          ))}
        </div>

        <button onClick={scrollToHumanizer}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold text-lg shadow-xl shadow-accent-500/25 hover:shadow-accent-500/40 transition-all duration-300 hover:scale-105 animate-fade-in-up-delay-2">
          Start Humanizing <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '1', icon: <FileText className="w-6 h-6" />, title: 'Paste or Upload', desc: 'Paste your AI-generated text or upload a PDF/DOCX file.' },
    { num: '2', icon: <Sparkles className="w-6 h-6" />, title: 'Choose Style', desc: 'Pick your preferred writing style, tone, and humanization level.' },
    { num: '3', icon: <ArrowRight className="w-6 h-6" />, title: 'Get Results', desc: 'Receive naturally humanized text in seconds — undetectable.' },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-3">How It Works</h2>
        <p className="text-dark-400 text-center mb-10">Three simple steps to undetectable writing</p>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 text-center hover:border-accent-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-4">
                {s.icon}
              </div>
              <div className="text-xs text-accent-500 font-bold uppercase tracking-wider mb-2">Step {s.num}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-dark-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustIndicators() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <p className="text-dark-400 text-sm mb-4">Trusted by researchers & writers worldwide</p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {[
            { value: '13', label: 'AI Providers' },
            { value: '4', label: 'Rewrite Levels' },
            { value: '13', label: 'Tones' },
            { value: '16+', label: 'Languages' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl px-6 py-3 text-center min-w-[120px]">
              <p className="text-2xl font-bold hero-gradient">{s.value}</p>
              <p className="text-xs text-dark-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-dark-500">
          <span className="px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/30">🔒 100% Private</span>
          <span className="px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/30">⚡ No Login Required</span>
          <span className="px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/30">🌐 Open Source</span>
          <span className="px-3 py-1.5 rounded-full bg-dark-800/50 border border-dark-700/30">🆓 Forever Free</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('humanizer');
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const saved = getTheme();
    setThemeState(saved);
    document.documentElement.classList.toggle('light', saved === 'light');
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    setThemeState(t); saveTheme(t);
    document.documentElement.classList.toggle('light', t === 'light');
    document.documentElement.classList.toggle('dark', t === 'dark');
  };

  const showToast = useCallback((type: ToastType['type'], message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <div className={`min-h-screen ${theme} flex flex-col`}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />

      {activeTab === 'humanizer' && (
        <>
          <HeroSection />
          <HowItWorks />
          <main className="container mx-auto px-4 py-6 max-w-7xl" id="humanizer-section">
            <Humanizer showToast={showToast} onGoToSettings={() => setActiveTab('settings')} />
          </main>
          <TrustIndicators />
        </>
      )}

      {activeTab !== 'humanizer' && (
        <main className="container mx-auto px-4 py-6 max-w-7xl flex-1">
          {activeTab === 'detector' && <Detector showToast={showToast} />}
          {activeTab === 'history' && <History showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'settings' && <Settings showToast={showToast} />}
        </main>
      )}

      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => <Toast key={t.id} toast={t} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />)}
      </div>
      <Footer />
    </div>
  );
}
