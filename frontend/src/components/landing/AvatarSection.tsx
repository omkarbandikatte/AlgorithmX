import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AvatarSection() {
  const { t } = useLanguage();
  const [isCallActive, setIsCallActive] = useState(false);
  const [pulseVisible, setPulseVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setPulseVisible(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{ padding: '0 16px 64px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.aiAvatar}</span>
            <div className="badge badge-success" style={{ fontSize: '0.62rem' }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--success)',
                animation: 'skeleton-pulse 1.5s ease-in-out infinite',
              }} />
              {t.liveReady}
            </div>
          </div>

          {/* Avatar Image */}
          <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '1 / 0.75' }}>
            <img
              src="/ai-avatar.png"
              alt="AI Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Scan line overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)',
              pointerEvents: 'none',
            }} />

            {/* Camera in bottom right */}
            <div style={{
              position: 'absolute', bottom: 12, right: 12,
              width: 60, height: 50,
              background: 'rgba(0,0,0,0.7)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 22 }}>📷</span>
            </div>

            {/* Audio visualizer bars (when call active) */}
            {isCallActive && (
              <div style={{
                position: 'absolute', bottom: 16, left: 16,
                display: 'flex', alignItems: 'flex-end', gap: 3, height: 28,
              }}>
                {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9].map((h, i) => (
                  <div key={i} style={{
                    width: 4, height: `${h * 100}%`,
                    background: 'var(--primary)',
                    borderRadius: 2,
                    animation: `typing-dot 1s ease-in-out ${i * 0.1}s infinite`,
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* Bottom quick-access chips */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
            {[
              { icon: '∫', label: t.complexFormulas, sub: t.complexFormulasDesc },
              { icon: '</>', label: t.codeReview, sub: t.codeReviewDesc },
            ].map((chip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '8px 12px',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  background: 'var(--primary-dim)',
                  border: '1px solid rgba(255,122,0,0.2)',
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: 'var(--primary)', fontWeight: 700,
                }}>{chip.icon}</div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{chip.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{chip.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Call Controls */}
          <div style={{
            padding: '16px 20px',
            display: 'flex',
            gap: 12,
          }}>
            <button
              className={isCallActive ? 'btn-ghost' : 'btn-primary'}
              style={{ flex: 1, justifyContent: 'center', gap: 8 }}
              onClick={() => setIsCallActive(true)}
            >
              <Phone size={16} />
              {t.startCall}
            </button>
            <button
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center', gap: 8, opacity: isCallActive ? 1 : 0.5 }}
              onClick={() => setIsCallActive(false)}
            >
              <PhoneOff size={16} />
              {t.end}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
