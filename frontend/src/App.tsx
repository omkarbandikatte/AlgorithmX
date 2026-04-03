import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';

// Landing
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import FeaturesSection from './components/landing/FeaturesSection';
import ChatPreview from './components/landing/ChatPreview';
import AvatarSection from './components/landing/AvatarSection';
import Footer from './components/landing/Footer';

// App
import BottomNav from './components/app/BottomNav';
import ChatInterface from './components/app/ChatInterface';
import LearningMode from './components/app/LearningMode';
import CurriculumMode from './components/app/CurriculumMode';
import ProfileTab from './components/app/ProfileTab';

// Shared
import InstallPrompt from './components/InstallPrompt';

import './index.css';

// ─── Tab animation variants ───────────────────────────────────────────────────
const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

// ─── App View (tabs) ──────────────────────────────────────────────────────────
function AppView() {
  const { activeTab } = useApp();

  const tabContent: Record<typeof activeTab, React.ReactNode> = {
    chat:       <ChatInterface />,
    learn:      <LearningMode />,
    curriculum: <CurriculumMode />,
    profile:    <ProfileTab />,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',           // full viewport incl. mobile safe area
      maxWidth: 480,
      margin: '0 auto',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ height: '100%', overflow: 'hidden' }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}

// ─── Landing View ─────────────────────────────────────────────────────────────
function LandingView() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ChatPreview />
        <AvatarSection />
      </main>
      <Footer />
    </div>
  );
}

// ─── Root with context ────────────────────────────────────────────────────────
function RootApp() {
  const { view } = useApp();

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingView />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100dvh', overflow: 'hidden' }}
          >
            <AppView />
          </motion.div>
        )}
      </AnimatePresence>
      <InstallPrompt />
    </>
  );
}

// ─── Final export ──────────────────────────────────────────────────────────────
export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <RootApp />
      </AppProvider>
    </LanguageProvider>
  );
}
