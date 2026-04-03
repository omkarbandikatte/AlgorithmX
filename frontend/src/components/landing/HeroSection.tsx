import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { setView, setActiveTab } = useApp();
  const [displayed, setDisplayed] = useState('');
  const fullText = t.tagline;

  // Typing animation for headline
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 45);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <section
      className="dot-grid-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 16px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(255,122,0,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        {/* Badge */}
        <div className="animate-fade-in" style={{ marginBottom: 24 }}>
          <span className="badge badge-primary">
            <Sparkles size={10} />
            AI-Powered · Multilingual · Offline Ready
          </span>
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-in"
          style={{
            fontSize: 'clamp(2.2rem, 7vw, 3rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            animationDelay: '0.1s',
          }}
        >
          <span className="text-gradient">{displayed}</span>
          {displayed.length < fullText.length && (
            <span style={{ animation: 'blink-cursor 1s step-end infinite', color: 'var(--primary)' }}>|</span>
          )}
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            marginBottom: 36,
            animationDelay: '0.3s',
          }}
        >
          {t.subtitle}
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            animationDelay: '0.5s',
          }}
        >
          <button
            className="btn-primary animate-glow"
            style={{ width: '100%', maxWidth: 320, justifyContent: 'center', padding: '15px 24px', fontSize: '1rem' }}
            onClick={() => { setView('app'); setActiveTab('chat'); }}
          >
            {t.startLearning}
            <ChevronRight size={18} />
          </button>
          <button
            className="btn-ghost"
            style={{ width: '100%', maxWidth: 320, justifyContent: 'center', padding: '15px 24px', fontSize: '1rem' }}
            onClick={() => { setView('app'); setActiveTab('chat'); }}
          >
            {t.tryDoubtSolver}
          </button>
        </div>

        {/* Stats row */}
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            marginTop: 48,
            animationDelay: '0.7s',
          }}
        >
          {[
            { val: '15+', label: 'Languages' },
            { val: '100%', label: 'Offline' },
            { val: '0s', label: 'Wait Time' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{stat.val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
