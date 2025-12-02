import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-8 pb-4 border-t border-border/40">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>© {currentYear}</span>
          <span>{t("components.features.footer.title")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{t("components.features.footer.disclaimer")}</span>
        </div>
      </div>
    </footer>
  );
}

