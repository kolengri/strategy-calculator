import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";

type CapitalGrowthTableProps = {
  strategy: Strategy;
};

export const CapitalGrowthTable = ({ strategy }: CapitalGrowthTableProps) => {
  const { t } = useTranslation();
  const growthData = useMemo(
    () => calculateCapitalGrowth(strategy),
    [strategy]
  );

  if (growthData.length === 0) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("components.features.capital-growth-table.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("components.features.capital-growth-table.columns.year")}
                </TableHead>
                <TableHead>
                  {t("components.features.capital-growth-table.columns.age")}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.capital-growth-table.columns.capitalStart"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.capital-growth-table.columns.contributions"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t("components.features.capital-growth-table.columns.return")}
                </TableHead>
                <TableHead className="text-right">
                  {t("components.features.capital-growth-table.columns.tax")}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.capital-growth-table.columns.capitalEnd"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.capital-growth-table.columns.goalProgress"
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthData.map((row) => (
                <TableRow key={row.year}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.capitalStart)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(row.contributions)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    +{formatCurrency(row.return)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    -{formatCurrency(row.tax)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(row.capitalEnd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(row.goalProgress, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm min-w-[50px]">
                        {formatPercentage(row.goalProgress)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

