"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import i18n, { type AvailableLocales, availableLocales, setLanguageCookie } from "@/lib/i18n";

type LanguageSelectorProps = {
  className?: string;
};

const handleChange = (value: string) => {
  const newLocale = value as AvailableLocales;
  i18n.changeLanguage(newLocale);
  setLanguageCookie(newLocale);
};

export const LanguageSelector = ({ className }: LanguageSelectorProps) => {
  const locale = i18n.language as AvailableLocales;

  return (
    <Select onValueChange={handleChange} defaultValue={locale}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={locale.toUpperCase()} />
      </SelectTrigger>
      <SelectContent>
        {availableLocales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
