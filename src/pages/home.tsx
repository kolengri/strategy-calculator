import { useTranslation } from "react-i18next";
import { BaseLayout } from "@/components/layouts/base";

export function Home() {
  const { t } = useTranslation();

  return (
    <BaseLayout>
      <div className="flex justify-center items-center gap-8 mb-8">
        {t("home.title")}
      </div>
    </BaseLayout>
  );
}
