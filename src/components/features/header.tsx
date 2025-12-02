import logo from "@/assets/logo.svg";
import { LanguageSelector } from "./language-selector";
import { CurrencySelector } from "./currency-selector";
import { StrategyImportExport } from "./strategy-import-export";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="flex items-center gap-3 pb-3 border-b border-border/60">
      <div className="flex items-center gap-3 flex-1">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shadow-sm">
          <img src={logo} alt="Logo" className="size-5 sm:size-6" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {t("components.features.header.title")}
        </h1>
      </div>
      <div className="flex items-center gap-1.5">
        {/* <StrategyImportExport /> */}
        <CurrencySelector />
        <LanguageSelector />
      </div>
    </header>
  );
}
