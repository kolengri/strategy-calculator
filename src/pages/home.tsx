import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";

export function Home() {
  const { t } = useTranslation();

  return (
    <BaseLayout>
      <title>{t("app.title", { title: t("home.title") })}</title>
      <div className="flex justify-center items-center gap-8 mb-8">
        {t("app.title", { title: t("home.title") })}
        {t("home.title")}
      </div>
    </BaseLayout>
  );
}
