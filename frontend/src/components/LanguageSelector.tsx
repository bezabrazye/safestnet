'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';

const languageNames: Record<Language, string> = {
  en: 'ENG',
  ru: 'RU',
  lv: 'LV'
};

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[color:var(--text-sub)]">{t.common.language}:</span>
      <div className="flex bg-[rgba(4,210,128,.12)] border border-[rgba(4,210,128,.26)] rounded-lg p-1">
        {(['en', 'ru', 'lv'] as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
              language === lang
                ? 'bg-[rgba(0,255,157,.20)] text-[color:var(--primary)] shadow-sm'
                : 'text-[color:var(--text-sub)] hover:text-[color:var(--text)] hover:bg-[rgba(4,210,128,.08)]'
            }`}
          >
            {languageNames[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
