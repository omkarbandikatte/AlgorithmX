import React, { useState } from 'react';
import { ChevronDown, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const demoMessages = {
  user: "Can you explain Quantum Entanglement using the analogy of a pair of magic shoes?",
  ai: `Imagine a pair of **Quantum Magic Shoes**. Even if you put the Left shoe in a box and send it to the Moon, and keep the Right shoe in New York, they remain "entangled."

The moment you open your box in New York and find a "Left" shoe, the shoe on the Moon *instantly* realizes it must become the "Right" shoe. No signal is sent; they simply share a single existence across space.`,
};

export default function ChatPreview() {
  const { t } = useLanguage();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showTranslate, setShowTranslate] = useState(false);

  return (
    <section style={{ padding: '0 16px 64px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Tab bar */}
        <div className="tab-bar" style={{ marginBottom: 16 }}>
          <div className="tab-item active" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <span style={{ fontSize: 10 }}>💬</span> {t.textIntelligence}
          </div>
          <div className="tab-item" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <span style={{ fontSize: 10 }}>🤖</span> {t.liveAIAssistant}
          </div>
        </div>

        {/* Chat container */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Messages */}
          <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* User Message */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: '16px 16px 4px 16px',
                padding: '12px 16px',
                maxWidth: '85%',
                fontSize: '0.85rem',
                lineHeight: 1.6,
              }}>
                {demoMessages.user}
              </div>
            </div>

            {/* AI Message */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{
                width: 34, height: 34, flexShrink: 0,
                background: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                boxShadow: '0 0 12px rgba(255,122,0,0.3)',
              }}>⚡</div>

              <div style={{ flex: 1 }}>
                <div style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '14px 16px',
                  fontSize: '0.83rem',
                  lineHeight: 1.7,
                }}>
                  <p style={{ marginBottom: 10 }}>
                    Imagine a pair of <strong style={{ color: 'var(--primary)' }}>Quantum Magic Shoes</strong>. Even if you put the Left shoe in a box and send it to the Moon, and keep the Right shoe in New York, they remain "entangled."
                  </p>
                  <p>
                    The moment you open your box in New York and find a "Left" shoe, the shoe on the Moon <em>instantly</em> realizes it must become the "Right" shoe. No signal is sent; they simply share a single existence across space.
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn-ghost btn-sm"
                    style={{
                      fontSize: '0.75rem',
                      padding: '6px 12px',
                      background: activeAction === 'simpler' ? 'var(--primary-dim)' : undefined,
                      borderColor: activeAction === 'simpler' ? 'var(--primary)' : undefined,
                      color: activeAction === 'simpler' ? 'var(--primary)' : undefined,
                    }}
                    onClick={() => setActiveAction('simpler')}
                  >
                    🔵 {t.explainSimpler}
                  </button>

                  {/* Translate dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 4 }}
                      onClick={() => setShowTranslate(p => !p)}
                    >
                      ⋮ {t.translate} <ChevronDown size={12} />
                    </button>
                    {showTranslate && (
                      <div style={{
                        position: 'absolute',
                        bottom: '110%',
                        left: 0,
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        overflow: 'hidden',
                        zIndex: 10,
                        minWidth: 100,
                        boxShadow: 'var(--shadow-md)',
                      }}>
                        {['EN', 'HI', 'GU'].map(l => (
                          <button key={l} style={{
                            display: 'block', width: '100%',
                            padding: '8px 14px', fontSize: '0.8rem',
                            color: 'var(--text-primary)',
                            textAlign: 'left',
                          }}
                          onClick={() => setShowTranslate(false)}
                          >{l}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn-icon" style={{ width: 30, height: 30 }} onClick={() => {}}>
                    <Volume2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--primary)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12,
            }}>⚡</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
