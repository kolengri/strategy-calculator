import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "../locales/en.json";
import ruTranslations from "../locales/ru.json";

export const availableLocales = ["en", "ru"] as const;
export type AvailableLocales = (typeof availableLocales)[number];

const LANGUAGE_COOKIE_NAME = "i18n_language";
const COOKIE_MAX_AGE_DAYS = 365;

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] ?? null;
}

export function setLanguageCookie(language: AvailableLocales): void {
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getInitialLanguage(): AvailableLocales {
  const savedLanguage = getCookie(LANGUAGE_COOKIE_NAME);
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
