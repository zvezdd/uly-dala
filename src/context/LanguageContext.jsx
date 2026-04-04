import { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const tr = translations[lang];
  return (
    <LanguageContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

const LANG_OPTIONS = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kz', label: 'KZ' },
];

export function LanguageSwitcher({ style = {} }) {
  const { lang, setLang } = useLanguage();
  return (
    <div style={{
      display: 'flex', gap: 2,
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: 3,
      ...style,
    }}>
      {LANG_OPTIONS.map(l => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          style={{
            padding: '4px 10px', borderRadius: 16,
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Space Grotesk', 'Figtree', sans-serif",
            letterSpacing: '0.06em',
            border: 'none', cursor: 'pointer',
            background: lang === l.code ? '#3b8fff' : 'transparent',
            color: lang === l.code ? '#fff' : 'rgba(255,255,255,0.45)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
