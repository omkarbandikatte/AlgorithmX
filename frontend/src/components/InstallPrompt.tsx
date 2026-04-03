import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function InstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('rakshak-install-dismissed')) return;
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setVisible(true), 3000); // show after 3s
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('rakshak-install-dismissed', '1');
  };

  if (!visible || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200,
      width: 'calc(100% - 32px)',
      maxWidth: 448,
      background: 'var(--bg-2)',
      border: '1px solid rgba(255,122,0,0.3)',
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(255,122,0,0.1)',
      animation: 'slide-in-bottom 0.4s ease',
    }}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, flexShrink: 0,
        background: 'var(--primary)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>⚡</div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Install Rakshak AI Learn</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Works offline · Instant access</div>
      </div>

      {/* Actions */}
      <button
        className="btn-primary btn-sm"
        style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}
        onClick={handleInstall}
      >
        <Download size={14} />
        Install
      </button>
      <button
        className="btn-icon"
        style={{ flexShrink: 0, width: 30, height: 30 }}
        onClick={handleDismiss}
      >
        <X size={14} />
      </button>
    </div>
  );
}
