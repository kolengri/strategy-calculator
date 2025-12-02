import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { Strategy } from "@/stores/strategy";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";
import { capitalGrowthToCSV, downloadFile } from "@/utils/export-csv";
import { Download } from "lucide-react";

type ExportCSVButtonProps = {
  strategy: Strategy;
};

export function ExportCSVButton({ strategy }: ExportCSVButtonProps) {
  const { t } = useTranslation();

  const handleExport = () => {
    const growthData = calculateCapitalGrowth(strategy);

    const headers = {
      year: t("components.features.capital-growth-table.columns.year"),
      age: t("components.features.capital-growth-table.columns.age"),
      capitalStart: t(
        "components.features.capital-growth-table.columns.capitalStart"
      ),
      contributions: t(
        "components.features.capital-growth-table.columns.contributions"
      ),
      return: t("components.features.capital-growth-table.columns.return"),
      tax: t("components.features.capital-growth-table.columns.tax"),
      capitalEnd: t(
        "components.features.capital-growth-table.columns.capitalEnd"
      ),
      goalProgress: t(
        "components.features.capital-growth-table.columns.goalProgress"
      ),
    };

    const csv = capitalGrowthToCSV(growthData, strategy, headers);
    const filename = `${strategy.name.replace(/\s+/g, "-")}-growth.csv`;
    downloadFile(csv, filename);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={handleExport}
      title={t("components.features.export-csv.title")}
    >
      <Download className="size-4" />
    </Button>
  );
}

