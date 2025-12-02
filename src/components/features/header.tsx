import logo from "@/assets/logo.svg";
import { LanguageSelector } from "./language-selector";
import { CurrencySelector } from "./currency-selector";
import { StrategyImportExport } from "./strategy-import-export";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="relative pb-4">
      {/* Main header content */}
      <div className="relative flex items-center gap-4 p-3 sm:p-4 rounded-2xl">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Logo container */}
          <div className="relative group cursor-pointer">
            <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-gray-900 border border-border shadow-sm group-hover:shadow-md group-hover:border-primary/40 transition-all duration-300">
              <img src={logo} alt="Logo" className="size-7 sm:size-8" />
            </div>
          </div>

          {/* Title section */}
          <div className="flex flex-col min-w-0 gap-0.5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate text-foreground">
              {t("components.features.header.title")}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground font-medium tracking-widest uppercase">
                {t("components.features.header.subtitle")}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center">
          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-muted/50 border border-border/40">
            <CurrencySelector className="border-0 bg-transparent shadow-none hover:bg-primary/10 transition-colors rounded-lg" />
            <div className="w-px h-5 bg-border/60" />
            <LanguageSelector className="border-0 bg-transparent shadow-none hover:bg-primary/10 transition-colors rounded-lg" />
          </div>
        </div>
      </div>
    </header>
  );
}
