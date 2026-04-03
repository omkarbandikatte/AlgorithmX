import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const curriculumData = {
  '7': {
    Maharashtra: [
      { subject: 'Mathematics', topics: ['Integers', 'Fractions & Decimals', 'Simple Equations', 'Lines & Angles', 'Triangle Properties', 'Data Handling', 'Perimeter & Area', 'Algebraic Expressions'] },
      { subject: 'Science', topics: ['Nutrition in Plants', 'Nutrition in Animals', 'Heat', 'Acids, Bases & Salts', 'Physical & Chemical Changes', 'Weather, Climate & Soil', 'Respiration in Organisms', 'Motion & Time'] },
      { subject: 'Social Studies', topics: ['Tracing Changes Through Thousand Years', 'New Kings & Kingdoms', 'Tribes & Nomads', 'Devotional Paths', 'Regional Cultures', 'Eighteenth-Century Formations'] },
      { subject: 'English', topics: ['Three Questions', 'A Gift of Chappals', 'Gopal and the Hilsa Fish', 'Quality', 'Expert Detectives', 'The Invention of Vita Wonk'] },
      { subject: 'Hindi', topics: ['हम पंछी उन्मुक्त गगन के', 'दादी माँ', 'हिमालय की बेटियाँ', 'कठपुतली', 'मिठाईवाला', 'पापा खो गए'] },
    ],
    Assam: [
      { subject: 'Mathematics', topics: ['Integers', 'Fractions & Decimals', 'Data Handling', 'Simple Equations', 'Lines & Angles', 'Triangle Properties', 'Ratio & Proportion'] },
      { subject: 'Science', topics: ['Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases & Salts', 'Physical & Chemical Changes', 'Weather & Climate'] },
      { subject: 'Social Studies', topics: ['Environment', 'Inside Our Earth', 'Our Changing Earth', 'Air', 'Water', 'Natural Vegetation & Wildlife'] },
      { subject: 'English', topics: ['Three Questions', 'A Gift of Chappals', 'Gopal and the Hilsa Fish', 'Quality', 'Expert Detectives'] },
      { subject: 'Assamese', topics: ['কবিতা', 'গল্প', 'ব্যাকৰণ', 'ৰচনা', 'পত্ৰ লিখন'] },
    ],
  },
  '8': {
    Maharashtra: [
      { subject: 'Mathematics', topics: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling', 'Squares & Square Roots', 'Cubes & Cube Roots', 'Comparing Quantities', 'Mensuration', 'Exponents & Powers', 'Factorisation'] },
      { subject: 'Science', topics: ['Crop Production', 'Microorganisms', 'Synthetic Fibres', 'Metals & Non-metals', 'Coal & Petroleum', 'Combustion & Flame', 'Conservation of Plants', 'Cell Structure', 'Force & Pressure', 'Friction', 'Sound', 'Light'] },
      { subject: 'Social Studies', topics: ['From Trade to Territory', 'Ruling the Countryside', 'Tribals & Dikus', 'When People Rebel', 'Weavers & Iron Smelters', 'Women, Caste & Reform', 'National Movement', 'India After Independence'] },
      { subject: 'English', topics: ['Best Christmas Present', 'The Tsunami', 'Glimpses of the Past', 'The Summit Within', 'A Short Monsoon Diary'] },
      { subject: 'Hindi', topics: ['ध्वनि', 'लाख की चूड़ियाँ', 'बस की यात्रा', 'दीवानों की हस्ती', 'चिट्ठियों की दुनिया', 'भगवान के डाकिए'] },
    ],
    Assam: [
      { subject: 'Mathematics', topics: ['Rational Numbers', 'Linear Equations', 'Quadrilaterals', 'Data Handling', 'Squares & Square Roots', 'Comparing Quantities', 'Mensuration', 'Exponents', 'Factorisation'] },
      { subject: 'Science', topics: ['Crop Production', 'Microorganisms', 'Synthetic Fibres', 'Metals & Non-metals', 'Coal & Petroleum', 'Combustion & Flame', 'Conservation of Plants', 'Force & Pressure', 'Light', 'Pollution'] },
      { subject: 'Social Studies', topics: ['Resources', 'Land, Soil & Water', 'Mineral & Power Resources', 'Agriculture', 'Industries', 'Human Resources'] },
      { subject: 'English', topics: ['Best Christmas Present', 'The Tsunami', 'The Summit Within', 'A Short Monsoon Diary'] },
      { subject: 'Assamese', topics: ['গদ্য', 'পদ্য', 'ব্যাকৰণ', 'ৰচনা', 'অনুবাদ'] },
    ],
  },
} as const;

export default function CurriculumMode() {
  const { t } = useLanguage();
  const [grade, setGrade] = useState<'7' | '8' | ''>('');
  const [state, setState] = useState<'Maharashtra' | 'Assam' | ''>('');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const data = grade && state ? curriculumData[grade as '7' | '8'][state as 'Maharashtra' | 'Assam'] : null;
  const subjectColors = ['#3B82F6', '#FF7A00', '#22C55E', '#8B5CF6', '#EC4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>{t.curriculum}</h2>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>NCERT curriculum by Grade & State</p>
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.grade}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([{v:'7',l:t.seventh},{v:'8',l:t.eighth}] as const).map(g => (
                <button key={g.v} onClick={() => { setGrade(g.v); setExpandedSubject(null); }} style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.82rem', background: grade === g.v ? 'var(--primary-dim)' : 'var(--bg-2)', border: `1px solid ${grade === g.v ? 'rgba(255,122,0,0.4)' : 'var(--border)'}`, color: grade === g.v ? 'var(--primary)' : 'var(--text-primary)', fontWeight: grade === g.v ? 700 : 400, transition: 'all 0.2s', textAlign: 'left' }}>{g.l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.state}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {([{v:'Maharashtra',l:t.maharashtra},{v:'Assam',l:t.assam}] as const).map(s => (
                <button key={s.v} onClick={() => { setState(s.v); setExpandedSubject(null); }} style={{ padding: '10px 12px', borderRadius: 10, fontSize: '0.82rem', background: state === s.v ? 'var(--primary-dim)' : 'var(--bg-2)', border: `1px solid ${state === s.v ? 'rgba(255,122,0,0.4)' : 'var(--border)'}`, color: state === s.v ? 'var(--primary)' : 'var(--text-primary)', fontWeight: state === s.v ? 700 : 400, transition: 'all 0.2s', textAlign: 'left' }}>{s.l}</button>
              ))}
            </div>
          </div>
        </div>

        {!data && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📚</div>
            <p style={{ fontSize: '0.85rem' }}>Select Grade and State to view curriculum</p>
          </div>
        )}

        {data && (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span className="badge badge-primary">{grade === '7' ? t.seventh : t.eighth} · {state}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{data.length} {t.subjects}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.map((subj, i) => {
                const isExpanded = expandedSubject === subj.subject;
                const color = subjectColors[i % subjectColors.length];
                return (
                  <div key={subj.subject} className="card" style={{ padding: 0, overflow: 'hidden', borderColor: isExpanded ? 'rgba(255,122,0,0.3)' : 'var(--border)', transition: 'border-color 0.2s' }}>
                    <button onClick={() => setExpandedSubject(isExpanded ? null : subj.subject)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BookOpen size={16} color={color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{subj.subject}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{subj.topics.length} {t.topics}</div>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </button>
                    {isExpanded && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)', animation: 'fadeIn 0.25s ease' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 12 }}>
                          {subj.topics.map((topic, ti) => (
                            <span key={ti} style={{ padding: '5px 10px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 99, fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
                              onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = color; (e.target as HTMLElement).style.color = color; }}
                              onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
                            >{topic}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
