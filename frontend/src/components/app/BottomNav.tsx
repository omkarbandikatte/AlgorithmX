import React from 'react';
import { MessageSquare, BookOpen, LayoutGrid, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp, AppTab } from '../../context/AppContext';

const tabs: { id: AppTab; icon: typeof MessageSquare; labelKey: keyof ReturnType<typeof useLanguage>['t'] }[] = [
  { id: 'chat', icon: MessageSquare, labelKey: 'chatMode' },
  { id: 'learn', icon: BookOpen, labelKey: 'learnMode' },
  { id: 'curriculum', icon: LayoutGrid, labelKey: 'curriculum' },
  { id: 'profile', icon: User, labelKey: 'profile' },
];

export default function BottomNav() {
  const { t } = useLanguage();
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 100,
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      padding: '8px 0 env(safe-area-inset-bottom, 8px)',
    }}>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
      }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.2s',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 32, height: 2,
                  background: 'var(--primary)',
                  borderRadius: '0 0 4px 4px',
                  boxShadow: '0 0 8px var(--primary)',
                }} />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? 600 : 400 }}>{t[tab.labelKey] as string}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
