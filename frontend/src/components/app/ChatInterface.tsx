import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, ChevronDown, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp, ChatMessage } from '../../context/AppContext';

// Mock AI responses for demo when no API key
const mockResponses = [
  "Great question! Let me break this down for you step by step.\n\nThis is a fascinating topic that has multiple layers to it. The key insight is that complex systems often emerge from simple rules applied repeatedly.\n\nWould you like me to go deeper into any specific aspect?",
  "Here's a clear explanation:\n\n**Key Concept**: The fundamental principle here is based on the relationship between cause and effect in dynamic systems.\n\n1. First, consider the initial conditions\n2. Then trace how changes propagate\n3. Finally, observe the emergent behavior\n\nThis applies to everything from physics to economics!",
  "Excellent! Let me explain this using a simple analogy.\n\nThink of it like a river flowing downhill — it always finds the path of least resistance. Similarly, in this context, the system naturally evolves toward its lowest energy state.\n\nThe mathematics behind this is actually quite elegant. Want me to show the equations?",
];

async function callGeminiAPI(message: string, apiKey: string, lang: string, isELI5: boolean): Promise<string> {
  const langInstructions: Record<string, string> = {
    en: 'Respond in English.',
    hi: 'Respond in Hindi (हिन्दी में जवाब दें).',
    gu: 'Respond in Gujarati (ગુજરાતીમાં જવાબ આપો).',
  };
  const eli5Instruction = isELI5 ? "Explain like I'm 10 years old, using very simple words and fun analogies." : '';
  const systemPrompt = `You are Rakshak, a friendly and highly knowledgeable AI learning assistant for students. ${langInstructions[lang] || ''} ${eli5Instruction} Be concise, clear, and educational. Use markdown-like formatting with **bold** for key terms.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
      }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

function TypingMessage({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(content.slice(0, i + 1));
      i++;
      if (i >= content.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [content]);
  return <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{displayed}</span>;
}

function formatMessage(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--primary)' }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatInterface() {
  const { t, lang } = useLanguage();
  const { chatMessages, addMessage, clearChat, apiKey, isELI5Mode, setIsELI5Mode } = useApp();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTranslateFor, setShowTranslateFor] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [latestAiId, setLatestAiId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput('');

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    addMessage(userMsg);
    setIsLoading(true);

    try {
      let aiResponse: string;
      if (apiKey) {
        aiResponse = await callGeminiAPI(msg, apiKey, lang, isELI5Mode);
      } else {
        await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
        aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      }
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: aiResponse, timestamp: new Date() };
      addMessage(aiMsg);
      setLatestAiId(aiMsg.id);
    } catch {
      const errMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'ai', content: 'Sorry, I encountered an error. Please check your API key in Profile settings.', timestamp: new Date() };
      addMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainSimpler = async (originalContent: string) => {
    sendMessage(`Please explain this more simply: "${originalContent.slice(0, 100)}..."`);
  };

  const handleTranslate = async (content: string, targetLang: string) => {
    setShowTranslateFor(null);
    const langNames: Record<string, string> = { EN: 'English', HI: 'Hindi', GU: 'Gujarati' };
    sendMessage(`Translate the following to ${langNames[targetLang]}: "${content.slice(0, 200)}"`);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleTTS = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'gu' ? 'gu-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.chatMode}</h2>
          {!apiKey && (
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Demo mode — add API key in Profile</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* ELI5 Toggle */}
          <button
            onClick={() => setIsELI5Mode(!isELI5Mode)}
            style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '5px 10px',
              borderRadius: 99,
              background: isELI5Mode ? 'var(--primary-dim)' : 'var(--bg-2)',
              color: isELI5Mode ? 'var(--primary)' : 'var(--text-secondary)',
              border: `1px solid ${isELI5Mode ? 'rgba(255,122,0,0.3)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}
          >
            {t.explainLike10}
          </button>
          <button className="btn-icon" onClick={clearChat} title="Clear chat">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {chatMessages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '30%', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <p style={{ fontSize: '0.85rem' }}>Ask me anything to start learning</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, alignItems: 'center' }}>
              {['Explain photosynthesis simply', 'What is Newton\'s 3rd Law?', 'Solve: 2x + 5 = 13'].map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', maxWidth: 260, width: '100%', justifyContent: 'center' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map(msg => (
          <div key={msg.id} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            {msg.role === 'ai' && (
              <div style={{
                width: 30, height: 30, flexShrink: 0,
                background: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, boxShadow: '0 0 8px rgba(255,122,0,0.3)',
              }}>⚡</div>
            )}

            <div style={{ maxWidth: '82%' }}>
              <div style={{
                background: msg.role === 'user' ? 'var(--bg-3)' : 'var(--bg-2)',
                border: `1px solid ${msg.role === 'user' ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                padding: '12px 14px',
                fontSize: '0.83rem',
                lineHeight: 1.7,
              }}>
                {msg.role === 'ai' && msg.id === latestAiId
                  ? <TypingMessage content={msg.content} />
                  : <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{formatMessage(msg.content)}</span>
                }
              </div>

              {/* AI action buttons */}
              {msg.role === 'ai' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn-ghost btn-sm"
                    style={{ fontSize: '0.7rem', padding: '5px 10px' }}
                    onClick={() => handleExplainSimpler(msg.content)}
                  >
                    🔵 {t.explainSimpler}
                  </button>

                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn-ghost btn-sm"
                      style={{ fontSize: '0.7rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 3 }}
                      onClick={() => setShowTranslateFor(showTranslateFor === msg.id ? null : msg.id)}
                    >
                      ⋮ {t.translate} <ChevronDown size={10} />
                    </button>
                    {showTranslateFor === msg.id && (
                      <div style={{
                        position: 'absolute', bottom: '110%', left: 0,
                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                        borderRadius: 10, overflow: 'hidden', zIndex: 20,
                        minWidth: 90, boxShadow: 'var(--shadow-md)',
                      }}>
                        {['EN', 'HI', 'GU'].map(l => (
                          <button key={l}
                            style={{ display: 'block', width: '100%', padding: '7px 12px', fontSize: '0.78rem', color: 'var(--text-primary)', textAlign: 'left' }}
                            onClick={() => handleTranslate(msg.content, l)}
                          >{l}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={() => handleTTS(msg.content)} title={t.textToSpeech}>
                    <Volume2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 30, height: 30, flexShrink: 0,
              background: 'var(--primary)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
            }}>⚡</div>
            <div style={{
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              borderRadius: '4px 16px 16px 16px',
              padding: '14px 16px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--primary)',
                  animation: `typing-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '8px 8px 8px 16px',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'}
        onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={t.chatPlaceholder}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '0.88rem',
            }}
          />
          <button
            className="btn-icon"
            onClick={handleVoiceInput}
            title={t.voiceInput}
            style={{
              background: isListening ? 'rgba(255,122,0,0.2)' : undefined,
              color: isListening ? 'var(--primary)' : undefined,
              borderColor: isListening ? 'var(--primary)' : undefined,
              animation: isListening ? 'glow-pulse 1s ease-in-out infinite' : undefined,
            }}
          >
            <Mic size={15} />
          </button>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: input.trim() && !isLoading ? 'var(--primary)' : 'var(--bg-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              color: input.trim() && !isLoading ? '#fff' : 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            <Send size={15} />
          </button>
        </div>
        <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
          PRESS ENTER TO SEND · IMAGE PREVIEW ACTIVE
        </p>
      </div>
    </div>
  );
}
