import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "../locales/en.json";
import ruTranslations from "../locales/ru.json";

export const availableLocales = ["en", "ru"] as const;
export type AvailableLocales = (typeof availableLocales)[number];

const LANGUAGE_STORAGE_KEY = "i18n_language";

function getStoredLanguage(): string | null {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLanguage(language: AvailableLocales): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

function getInitialLanguage(): AvailableLocales {
  const savedLanguage = getStoredLanguage();
  if (
    savedLanguage &&
    availableLocales.includes(savedLanguage as AvailableLocales)
  ) {
    return savedLanguage as AvailableLocales;
  }

  // Fallback to browser language
  const browserLang = navigator.language.split("-")[0];
  if (availableLocales.includes(browserLang as AvailableLocales)) {
    return browserLang as AvailableLocales;
  }

  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslations,
    },
    ru: {
      translation: ruTranslations,
    },
  } satisfies Record<
    AvailableLocales,
    { translation: typeof enTranslations | typeof ruTranslations }
  >,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
