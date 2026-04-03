import React from 'react';
import { Brain, Zap, WifiOff } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const features = (t: ReturnType<typeof useLanguage>['t']) => [
  {
    icon: Brain,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.12)',
    title: t.multimodalTitle,
    desc: t.multimodalDesc,
    tag: 'Multimodal',
  },
  {
    icon: Zap,
    iconColor: '#FF7A00',
    iconBg: 'rgba(255,122,0,0.12)',
    title: t.doubtSolverTitle,
    desc: t.doubtSolverDesc,
    tag: 'Real-Time',
  },
  {
    icon: WifiOff,
    iconColor: '#22C55E',
    iconBg: 'rgba(34,197,94,0.12)',
    title: t.offlineTitle,
    desc: t.offlineDesc,
    tag: 'PWA',
  },
];

export default function FeaturesSection() {
  const { t } = useLanguage();
  const feats = features(t);

  return (
    <section style={{ padding: '64px 16px', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>{t.coreIntelligence}</span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {t.features}
          </h2>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {feats.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="card"
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  animation: `fadeIn 0.5s ease ${i * 0.1}s both`,
                  transition: 'transform 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,122,0,0.3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                {/* Icon */}
                <div style={{
                  width: 48, height: 48, flexShrink: 0,
                  background: f.iconBg,
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={f.iconColor} />
                </div>

                {/* Text */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{f.title}</h3>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600,
                      background: f.iconBg,
                      color: f.iconColor,
                      padding: '2px 8px',
                      borderRadius: 99,
                      letterSpacing: '0.05em',
                    }}>{f.tag}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
