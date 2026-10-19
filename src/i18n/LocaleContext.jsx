import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { khmerTranslations } from './khmer';

const STORAGE_KEY = 'vpos.market-language';
const translationCatalog = khmerTranslations;
const lowerCatalog = new Map();
for (const [key, val] of Object.entries(translationCatalog)) {
  const lk = key.toLowerCase();
  if (!lowerCatalog.has(lk)) lowerCatalog.set(lk, val);
}

const LocaleContext = createContext(null);

export function lookup(text) {
  if (!text) return undefined;

  // 1. Exact catalog match
  const exact = translationCatalog[text];
  if (exact !== undefined) return exact;

  // 2. Trailing colon: "Store:" -> lookup("Store") + "៖"
  if (text.endsWith(':') || text.endsWith('：')) {
    const base = text.slice(0, -1).trim();
    const baseTrans = lookup(base);
    if (baseTrans) return `${baseTrans}៖`;
  }

  // 3. Trailing ellipsis: "Loading…" / "Loading..." -> lookup("Loading") + "…"
  if (text.endsWith('…')) {
    const base = text.slice(0, -1).trim();
    const baseTrans = lookup(base);
    if (baseTrans) return `${baseTrans}…`;
  } else if (text.endsWith('...')) {
    const base = text.slice(0, -3).trim();
    const baseTrans = lookup(base);
    if (baseTrans) return `${baseTrans}…`;
  }

  // 4. Case-insensitive fallback
  const lower = lowerCatalog.get(text.toLowerCase());
  if (lower !== undefined) return lower;

  return undefined;
}

export function t(text, language = 'km') {
  if (language !== 'km') return text;
  return lookup(text) ?? text;
}

const textState = new WeakMap();
const attributeState = new WeakMap();

function storedLanguage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'km' ? 'km' : 'en';
  } catch {
    return 'en';
  }
}

function preserveWhitespace(value, translated) {
  const match = value.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return `${match?.[1] ?? ''}${translated}${match?.[3] ?? ''}`;
}

function shouldSkipText(node) {
  let element = node.parentElement;
  while (element) {
    if (element.hasAttribute('data-locale-ignore') || ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(element.tagName)) return true;
    element = element.parentElement;
  }
  return false;
}

function translateText(node, language) {
  if (shouldSkipText(node)) return;
  const current = node.nodeValue ?? '';
  const known = textState.get(node);
  const source = known && current === known.translated ? known.original : current;
  const key = source.trim();
  if (!key) return;

  if (language === 'km') {
    const translation = lookup(key);
    if (!translation) return;
    const next = preserveWhitespace(source, translation);
    if (next !== current) {
      textState.set(node, { original: source, translated: next });
      node.nodeValue = next;
    }
  } else if (known && current === known.translated) {
    node.nodeValue = known.original;
    textState.delete(node);
  }
}

const TRANSLATABLE_ATTRIBUTES = ['aria-label', 'title', 'placeholder', 'alt'];

function translateAttributes(element, language) {
  if (element.hasAttribute('data-locale-ignore')) return;
  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(attribute);
    if (!current) continue;
    let states = attributeState.get(element);
    const known = states?.get(attribute);
    const source = known && current === known.translated ? known.original : current;
    const translation = language === 'km' ? lookup(source.trim()) : undefined;
    if (translation) {
      if (translation !== current) {
        if (!states) states = new Map();
        states.set(attribute, { original: source, translated: translation });
        attributeState.set(element, states);
        element.setAttribute(attribute, translation);
      }
    } else if (language === 'en' && known && current === known.translated) {
      element.setAttribute(attribute, known.original);
      states?.delete(attribute);
    }
  }
}

function localizeTree(root, language) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(root, language);
    return;
  }
  if (root instanceof Element) translateAttributes(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) translateText(node, language);
  if (root instanceof Element) root.querySelectorAll('*').forEach((element) => translateAttributes(element, language));
}

export function LocaleProvider({ children }) {
  const [language, setLanguageState] = useState(storedLanguage);
  const setLanguage = useCallback((next) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.marketLanguage = language;
    localizeTree(document.body, language);

    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === 'characterData') localizeTree(record.target, language);
        else if (record.type === 'attributes') localizeTree(record.target, language);
        else record.addedNodes.forEach((node) => localizeTree(node, language));
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });
    return () => observer.disconnect();
  }, [language]);

  const translate = useCallback((text) => (language === 'km' ? (lookup(text) ?? text) : text), [language]);
  const value = useMemo(() => ({ language, setLanguage, t: translate }), [language, setLanguage, translate]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used within LocaleProvider');
  return value;
}
