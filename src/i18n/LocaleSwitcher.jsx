import React from 'react';
import { useLocale } from './LocaleContext';
import { Globe } from 'lucide-react';

export function LocaleSwitcher({ className = '' }) {
  const { language, setLanguage } = useLocale();

  const toggle = () => {
    setLanguage(language === 'km' ? 'en' : 'km');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      title={language === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'}
      data-locale-ignore
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-xs ${className}`}
    >
      <Globe className="w-3.5 h-3.5 text-gray-500" />
      <span className="font-bold text-gray-900">{language === 'km' ? 'ខ្មែរ' : 'EN'}</span>
      <span className="text-[10px] text-gray-400 font-normal">| {language === 'km' ? 'EN' : 'ខ្មែរ'}</span>
    </button>
  );
}
