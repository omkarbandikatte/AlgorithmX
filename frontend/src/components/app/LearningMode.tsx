import React, { useState } from 'react';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';

interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}
interface LearnResult {
  notes: string;
  quiz: QuizQuestion[];
  summary: string;
}

const mockLearnData: Record<string, LearnResult> = {
  default: {
    notes: `**Overview**\nThis topic involves understanding fundamental principles and their applications in real-world scenarios.\n\n**Key Concepts**\n1. **Definition**: The core concept can be understood as the systematic study of patterns and relationships.\n2. **Principles**: Three main principles govern this topic:\n   - Conservation of the fundamental quantity\n   - The relationship between cause and effect\n   - The role of energy in transformations\n3. **Applications**: Used widely in engineering, science, and everyday problem solving.\n\n**Important Formulas**\n• F = ma (Newton's Second Law)\n• E = mc² (Mass-Energy Equivalence)\n• PV = nRT (Ideal Gas Law)\n\n**Summary**\nUnderstanding this topic requires grasping both theoretical foundations and practical applications.`,
    quiz: [
      { q: 'What is the primary purpose of studying this topic?', options: ['Entertainment only', 'Understanding patterns and relationships', 'Memorizing facts', 'None of the above'], answer: 1 },
      { q: 'Which formula relates force and acceleration?', options: ['E = mc²', 'PV = nRT', 'F = ma', 'v = u + at'], answer: 2 },
      { q: 'How many main principles were mentioned?', options: ['Two', 'Three', 'Four', 'Five'], answer: 1 },
    ],
    summary: 'This topic covers fundamental principles with broad applications across science and engineering.',
  },
};

async function callGeminiForLearn(topic: string, apiKey: string, lang: string, isELI5: boolean): Promise<LearnResult> {
  const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', gu: 'Gujarati' };
  const eli5 = isELI5 ? "Explain everything like I'm 10 years old." : '';
  const prompt = `You are an expert teacher. Create learning content about: "${topic}". ${eli5} Respond in ${langMap[lang] || 'English'}.

Return ONLY valid JSON in this exact format:
{
  "notes": "Detailed notes with **bold** for key terms, numbered lists, and clear sections. At least 300 words.",
  "quiz": [
    {"q": "Question 1?", "options": ["A", "B", "C", "D"], "answer": 0},
    {"q": "Question 2?", "options": ["A", "B", "C", "D"], "answer": 1},
    {"q": "Question 3?", "options": ["A", "B", "C", "D"], "answer": 2}
  ],
  "summary": "One sentence summary"
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
      }),
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]) as LearnResult;
  }
  throw new Error('Invalid response format');
}

function FormattedNotes({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: '0.84rem', lineHeight: 1.8 }}>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={i} style={{ fontWeight: 700, color: 'var(--primary)', marginTop: 14, marginBottom: 4 }}>{line.slice(2, -2)}</div>;
        }
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ marginBottom: 4, color: line.startsWith('•') || line.match(/^\d+\./) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {parts.map((p, j) =>
              p.startsWith('**') && p.endsWith('**')
                ? <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.slice(2, -2)}</strong>
                : p
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function LearningMode() {
  const { t } = useLanguage();
  const { apiKey, isELI5Mode, setIsELI5Mode } = useApp();
  const { lang } = useLanguage();
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<LearnResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'quiz' | 'feedback'>('notes');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const generate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setActiveTab('notes');

    try {
      if (apiKey) {
        const data = await callGeminiForLearn(topic, apiKey, lang, isELI5Mode);
        setResult(data);
      } else {
        await new Promise(r => setTimeout(r, 1500));
        setResult(mockLearnData.default);
      }
    } catch {
      setResult(mockLearnData.default);
    } finally {
      setIsLoading(false);
    }
  };

  const score = quizSubmitted && result
    ? result.quiz.filter((q, i) => selectedAnswers[i] === q.answer).length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>{t.learnMode}</h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Enter a topic to get notes + quiz</p>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Topic Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input-field"
            placeholder={t.topicPlaceholder}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            style={{ flex: 1 }}
          />
          <button
            className="btn-primary"
            style={{ padding: '12px 18px', flexShrink: 0 }}
            onClick={generate}
            disabled={isLoading}
          >
            {isLoading ? '...' : t.generate}
          </button>
        </div>

        {/* ELI5 toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            onClick={() => setIsELI5Mode(!isELI5Mode)}
            style={{
              width: 40, height: 22,
              background: isELI5Mode ? 'var(--primary)' : 'var(--bg-3)',
              borderRadius: 99, position: 'relative',
              border: '1px solid var(--border)',
              transition: 'background 0.2s',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 2, left: isELI5Mode ? 20 : 2,
              width: 16, height: 16,
              background: '#fff', borderRadius: '50%',
              transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.explainLike10}</span>
        </label>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[100, 80, 60, 90, 70].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 7 }} />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <>
            {/* Tabs */}
            <div className="tab-bar">
              {(['notes', 'quiz', 'feedback'] as const).map(tab => (
                <button
                  key={tab}
                  className={`tab-item ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'notes' ? t.notes : tab === 'quiz' ? t.quiz : t.feedback}
                </button>
              ))}
            </div>

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{topic}</span>
                </div>
                <FormattedNotes text={result.notes} />
              </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeIn 0.3s ease' }}>
                {result.quiz.map((q, qi) => (
                  <div key={qi} className="card">
                    <p style={{ fontSize: '0.86rem', fontWeight: 600, marginBottom: 12 }}>
                      Q{qi + 1}. {q.q}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt, oi) => {
                        const isSelected = selectedAnswers[qi] === oi;
                        const isCorrect = q.answer === oi;
                        let bg = 'var(--bg-2)';
                        let border = 'var(--border)';
                        if (quizSubmitted) {
                          if (isCorrect) { bg = 'rgba(34,197,94,0.1)'; border = 'rgba(34,197,94,0.4)'; }
                          else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = 'rgba(239,68,68,0.4)'; }
                        } else if (isSelected) {
                          bg = 'var(--primary-dim)'; border = 'rgba(255,122,0,0.4)';
                        }
                        return (
                          <button key={oi} onClick={() => !quizSubmitted && setSelectedAnswers(prev => ({ ...prev, [qi]: oi }))}
                            style={{
                              padding: '10px 14px', borderRadius: 10,
                              background: bg, border: `1px solid ${border}`,
                              textAlign: 'left', fontSize: '0.82rem',
                              color: 'var(--text-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.2s', cursor: quizSubmitted ? 'default' : 'pointer',
                            }}>
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle size={16} color="var(--success)" />}
                            {quizSubmitted && isSelected && !isCorrect && <XCircle size={16} color="var(--danger)" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button className="btn-primary" style={{ justifyContent: 'center' }}
                    onClick={() => Object.keys(selectedAnswers).length === result.quiz.length && setQuizSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length < result.quiz.length}
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <div className="card" style={{ textAlign: 'center', background: score === result.quiz.length ? 'rgba(34,197,94,0.08)' : 'var(--card)', borderColor: score === result.quiz.length ? 'rgba(34,197,94,0.3)' : 'var(--border)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: score === result.quiz.length ? 'var(--success)' : 'var(--primary)' }}>
                      {score}/{result.quiz.length}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {score === result.quiz.length ? '🎉 Perfect Score!' : score >= result.quiz.length / 2 ? '👍 Good job! Review incorrect answers.' : '📚 Keep studying and try again!'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--primary)' }}>📊 Learning Summary</h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
                {quizSubmitted && (
                  <div style={{ marginTop: 14, padding: '12px', background: 'var(--bg-2)', borderRadius: 10 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Quiz Performance</p>
                    <div style={{ marginTop: 8, height: 6, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(score / result.quiz.length) * 100}%`, background: 'var(--primary)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>{score}/{result.quiz.length} correct • {Math.round((score / result.quiz.length) * 100)}% accuracy</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
