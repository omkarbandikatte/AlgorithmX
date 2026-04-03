import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AppView = 'landing' | 'app';
export type AppTab = 'chat' | 'learn' | 'curriculum' | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AppContextType {
  view: AppView;
  setView: (v: AppView) => void;
  activeTab: AppTab;
  setActiveTab: (t: AppTab) => void;
  chatMessages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  isELI5Mode: boolean;
  setIsELI5Mode: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  view: 'landing',
  setView: () => {},
  activeTab: 'chat',
  setActiveTab: () => {},
  chatMessages: [],
  addMessage: () => {},
  clearChat: () => {},
  apiKey: '',
  setApiKey: () => {},
  isELI5Mode: false,
  setIsELI5Mode: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('landing');
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [apiKey, setApiKeyState] = useState(() => localStorage.getItem('rakshak-api-key') || '');
  const [isELI5Mode, setIsELI5Mode] = useState(false);

  const addMessage = (msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const clearChat = () => setChatMessages([]);

  const setApiKey = (k: string) => {
    setApiKeyState(k);
    localStorage.setItem('rakshak-api-key', k);
  };

  return (
    <AppContext.Provider value={{
      view, setView,
      activeTab, setActiveTab,
      chatMessages, addMessage, clearChat,
      apiKey, setApiKey,
      isELI5Mode, setIsELI5Mode,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
