import logo from "@/assets/logo.svg";
import { LanguageSelector } from "./language-selector";
import { CurrencySelector } from "./currency-selector";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="flex items-center gap-4 pb-4 border-b border-border/40 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-primary/3 opacity-50 pointer-events-none" />
      <div className="flex items-center gap-4 flex-1 relative z-10">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/3 border border-primary/20 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <img src={logo} alt="Logo" className="size-6 sm:size-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent tracking-tight">
          {t("components.features.header.title")}
        </h1>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <CurrencySelector />
        <LanguageSelector />
      </div>
    </header>
  );
}
