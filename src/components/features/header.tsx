import logo from "@/assets/logo.svg";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "react-i18next";

export function Header() {
  const { t } = useTranslation();
  return (
    <header className="flex items-center">
      <img src={logo} alt="Logo" className="size-10 mr-4" />
      <h1 className="text-2xl font-bold flex-1">
        {t("components.features.header.title")}
      </h1>
      <LanguageSelector className="ml-auto" />
    </header>
  );
}
