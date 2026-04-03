import React, { useState } from 'react';
import { Zap, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Lang } from '../../context/LanguageContext';

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const { setView, setActiveTab } = useApp();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langs: { code: Lang; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'gu', label: 'ગુજરાતી' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      padding: '12px 16px',
      background: 'rgba(10,10,10,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--primary)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(255,122,0,0.4)',
          }}>
            <Zap size={18} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
            {t.appName}
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => setShowLangMenu(p => !p)}
              title="Switch Language"
            >
              <Globe size={16} />
            </button>
            {showLangMenu && (
              <div style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                overflow: 'hidden',
                minWidth: 130,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
              }}>
                {langs.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setShowLangMenu(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: lang === l.code ? 'var(--primary)' : 'var(--text-primary)',
                      background: lang === l.code ? 'var(--primary-dim)' : 'transparent',
                      fontWeight: lang === l.code ? 600 : 400,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (lang !== l.code) (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (lang !== l.code) (e.target as HTMLElement).style.background = 'transparent'; }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            className="btn-primary btn-sm"
            onClick={() => { setView('app'); setActiveTab('chat'); }}
          >
            {t.startLearning}
          </button>
        </div>
      </div>
    </nav>
  );
}
