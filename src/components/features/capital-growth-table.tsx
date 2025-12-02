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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";
import { ExportCSVButton } from "./export-csv-button";
import { CalendarIcon } from "lucide-react";

type CapitalGrowthTableProps = {
  strategy: Strategy;
};

export const CapitalGrowthTable = ({ strategy }: CapitalGrowthTableProps) => {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();
  const growthData = useMemo(
    () => calculateCapitalGrowth(strategy),
    [strategy]
  );

  if (growthData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>
            {t("components.features.capital-growth-table.title", {
              name: strategy.name,
            })}
          </span>
          <ExportCSVButton strategy={strategy} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {t("components.features.capital-growth-table.columns.year")}
                </TableHead>
                <TableHead className="text-xs">
                  {t("components.features.capital-growth-table.columns.age")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.capitalStart")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.contributions")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.return")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.tax")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.withdrawal")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.capitalEnd")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.capital-growth-table.columns.goalProgress")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {growthData.map((row) => (
                <TableRow
                  key={row.year}
                  className={row.withdrawal > 0 ? "bg-amber-500/5" : ""}
                >
                  <TableCell className="text-sm">{row.year}</TableCell>
                  <TableCell className="text-sm">{row.age}</TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.capitalStart)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(row.contributions)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-green-600">
                    +{formatCurrency(row.return)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-red-600">
                    -{formatCurrency(row.tax)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {row.withdrawal > 0 ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-amber-600 font-medium cursor-help inline-flex items-center gap-1">
                              <CalendarIcon className="size-3" />-
                              {formatCurrency(row.withdrawal)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              {row.lifeEvents.map((e) => (
                                <div key={e.id}>
                                  {e.name}: {formatCurrency(e.amount)}
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    {formatCurrency(row.capitalEnd)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(row.goalProgress, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs min-w-[40px]">
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
