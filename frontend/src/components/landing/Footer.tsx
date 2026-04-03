import React from 'react';
import { Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { t } = useLanguage();
  const { setView } = useApp();

  return (
    <footer style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      {/* CTA Banner */}
      <div style={{
        padding: '48px 16px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(255,122,0,0.05) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
            {t.readyToEvolve}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24, lineHeight: 1.6 }}>
            {t.joinThousands}
          </p>
          <button
            className="btn-primary animate-glow"
            style={{ justifyContent: 'center' }}
            onClick={() => setView('app')}
          >
            {t.getFullAccess}
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div style={{ padding: '28px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--primary)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={14} color="#fff" fill="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.appName}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: 20 }}>
          {t.footerTagline}
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[t.docs, t.features, t.community, t.privacyPolicy].map(link => (
            <a
              key={link}
              href="#"
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--primary)'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
            >
              {link}
            </a>
          ))}
        </div>

        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--border)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>© 2025 Rakshak AI Learn</span>
          <span>{t.version}</span>
        </div>
      </div>
    </footer>
  );
}
