import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import {
  calculateCapitalGrowth,
  type CapitalGrowthRow,
} from "@/utils/calculate-capital-growth";
import { generateWhatIfScenarios } from "@/utils/what-if-scenarios";
import { TrendingUp, TrendingDown, LineChart } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WhatIfScenariosProps = {
  strategy: Strategy;
};

export const WhatIfScenarios = ({ strategy }: WhatIfScenariosProps) => {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  const baseRows = useMemo(
    () => calculateCapitalGrowth(strategy),
    [strategy]
  );

  const scenarios = useMemo(
    () => generateWhatIfScenarios(strategy, baseRows),
    [strategy, baseRows]
  );

  if (baseRows.length === 0 || scenarios.length === 0) {
    return null;
  }

  const baseFinalCapital = baseRows[baseRows.length - 1].capitalEnd;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LineChart className="size-4 text-blue-600" />
          {t("components.features.what-if.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-2 bg-background rounded-lg border text-sm">
          <span className="text-muted-foreground">
            {t("components.features.what-if.baseScenario")}:
          </span>{" "}
          <span className="font-semibold">{formatCurrency(baseFinalCapital)}</span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  {t("components.features.what-if.table.scenario")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.what-if.table.finalCapital")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.what-if.table.difference")}
                </TableHead>
                <TableHead className="text-right text-xs">
                  {t("components.features.what-if.table.percentChange")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => {
                const isPositive = scenario.difference >= 0;
                return (
                  <TableRow key={scenario.id}>
                    <TableCell className="font-medium text-sm flex items-center gap-1.5">
                      {isPositive ? (
                        <TrendingUp className="size-3.5 text-green-600" />
                      ) : (
                        <TrendingDown className="size-3.5 text-red-600" />
                      )}
                      {t("components.features.what-if.scenarioReturn", {
                        modifier: scenario.name,
                      })}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(scenario.finalCapital)}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm font-semibold ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatCurrency(scenario.difference)}
                    </TableCell>
                    <TableCell
                      className={`text-right text-sm ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {formatPercentage(scenario.differencePercentage)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("components.features.what-if.description")}
        </p>
      </CardContent>
    </Card>
  );
};

