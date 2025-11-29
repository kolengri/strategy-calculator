import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "../locales/en.json";
import ruTranslations from "../locales/ru.json";

export const availableLocales = ["en", "ru"] as const;
export type AvailableLocales = (typeof availableLocales)[number];

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
  lng: "ru", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes values
  },
});

export default i18n;
