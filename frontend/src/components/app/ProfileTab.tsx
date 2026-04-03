import React, { useState } from 'react';
import { Key, Globe, Download, Info, ChevronRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import type { Lang } from '../../context/LanguageContext';

export default function ProfileTab() {
  const { t, lang, setLang } = useLanguage();
  const { apiKey, setApiKey } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [keySaved, setKeySaved] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Capture install prompt if available
  React.useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSaveKey = () => {
    setApiKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleInstall = () => {
    if (installPrompt) { installPrompt.prompt(); }
    else { alert('To install: tap Share → Add to Home Screen in Safari, or use browser menu → Install App in Chrome.'); }
  };

  const langs: { code: Lang; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>{t.profile}</h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.settings} & Preferences</p>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Language Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(59,130,246,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={16} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.language}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>UI + AI response language</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {langs.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10,
                  background: lang === l.code ? 'var(--primary-dim)' : 'var(--bg-2)',
                  border: `1px solid ${lang === l.code ? 'rgba(255,122,0,0.4)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: lang === l.code ? 700 : 500, color: lang === l.code ? 'var(--primary)' : 'var(--text-primary)' }}>{l.native}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l.label}</div>
                </div>
                {lang === l.code && <Check size={16} color="var(--primary)" />}
              </button>
            ))}
          </div>
        </div>

        {/* API Key Section */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(255,122,0,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={16} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.apiKey}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enables real AI responses</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="input-field"
              type="password"
              placeholder={t.apiKeyPlaceholder}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
            />
            <button
              className={keySaved ? 'btn-ghost' : 'btn-primary'}
              style={{ justifyContent: 'center', gap: 8 }}
              onClick={handleSaveKey}
            >
              {keySaved ? <><Check size={14} /> Saved!</> : t.saveKey}
            </button>
            <div style={{ display: 'flex', gap: 6, padding: '10px 12px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10 }}>
              <Info size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: '0.72rem', color: 'rgba(100,160,255,0.9)', lineHeight: 1.5 }}>
                Get a free Gemini API key at <strong>aistudio.google.com</strong>. Without a key, demo responses are shown.
              </p>
            </div>
          </div>
        </div>

        {/* Install App */}
        <div className="card" style={{ cursor: 'pointer' }} onClick={handleInstall}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: 'rgba(34,197,94,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={16} color="var(--success)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{t.installApp}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Works offline · No App Store needed</div>
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>

        {/* App Info */}
        <div className="card" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Rakshak AI Learn</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.version}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {t.footerTagline}. Built with ❤️ for students everywhere.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {[t.docs, t.community, t.privacyPolicy].map(link => (
              <a key={link} href="#" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 10px', background: 'var(--bg-2)', borderRadius: 99, border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--primary)'}
                onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-muted)'}
              >{link}</a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
