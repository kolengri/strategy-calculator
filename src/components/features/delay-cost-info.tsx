import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrencyStore } from "@/stores/currency";
import { formatCurrency } from "@/utils/currencies";
import { calculateDelayCost } from "@/utils/calculate-capital-growth";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DelayCostInfoProps = {
  strategy: Strategy;
  stepYears?: number;
  maxDelayYears?: number;
};

export const DelayCostInfo = ({
  strategy,
  stepYears = 3,
  maxDelayYears,
}: DelayCostInfoProps) => {
  const { t } = useTranslation();
  const { currency } = useCurrencyStore();

  // Determine max delay years based on strategy type
  const effectiveMaxDelayYears = useMemo(() => {
    if (maxDelayYears !== undefined) {
      return maxDelayYears;
    }
    if (strategy.type === "age-based") {
      // For age-based, limit to years until goal age
      return Math.max(0, strategy.goalAge - strategy.currentAge - 1);
    }
    // For goal-based, use a reasonable default (30 years)
    return 30;
  }, [strategy, maxDelayYears]);

  // Generate delay periods: 3, 6, 9, 12, ...
  const delayPeriods = useMemo(() => {
    const periods: number[] = [];
    for (
      let years = stepYears;
      years <= effectiveMaxDelayYears;
      years += stepYears
    ) {
      periods.push(years);
    }
    return periods;
  }, [stepYears, effectiveMaxDelayYears]);

  // Calculate delay costs for all periods
  const delayDataList = useMemo(() => {
    return delayPeriods
      .map((delayYears) => calculateDelayCost(strategy, delayYears))
      .filter(({ delayYears, cost }) => {
        // Only show periods with positive cost and valid scenarios
        // For age-based, don't show if delayYears >= years to goal (impossible scenario)
        if (strategy.type === "age-based") {
          const yearsToGoal = strategy.goalAge - strategy.currentAge;
          if (delayYears >= yearsToGoal) {
            return false; // Can't start investing after goal age
          }
        }
        return cost > 0;
      });
  }, [strategy, delayPeriods]);

  if (delayDataList.length === 0) {
    return null;
  }

  // Get current capital from first calculation (all should have same currentCapital)
  const currentCapital = delayDataList[0]?.currentCapital || 0;

  return (
    <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="size-5 text-orange-600 dark:text-orange-400" />
          {t("components.features.delay-cost-info.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <span className="text-sm text-muted-foreground">
              {t("components.features.delay-cost-info.currentCapital")}
            </span>
            <span className="font-semibold text-lg">
              {formatCurrency(currentCapital, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
            <span className="text-sm text-muted-foreground">
              {t("components.features.delay-cost-info.currentYearAtGoal")}
            </span>
            <span className="font-semibold text-lg">
              {delayDataList[0]?.currentYearAtGoal || 0}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("components.features.delay-cost-info.table.delayYears")}
                </TableHead>
                <TableHead className="text-right">
                  {t("components.features.delay-cost-info.table.ageAtStart")}
                </TableHead>
                <TableHead className="text-right">
                  {t("components.features.delay-cost-info.table.yearAtGoal")}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.delay-cost-info.table.delayedCapital"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t("components.features.delay-cost-info.table.cost")}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.delay-cost-info.table.costPercentage"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.delay-cost-info.table.requiredInitial"
                  )}
                </TableHead>
                <TableHead className="text-right">
                  {t(
                    "components.features.delay-cost-info.table.requiredMonthly"
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayDataList.map((data) => (
                <TableRow key={data.delayYears}>
                  <TableCell className="font-medium">
                    {t("components.features.delay-cost-info.table.yearsLabel", {
                      years: data.delayYears,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {strategy.currentAge + data.delayYears}
                  </TableCell>
                  <TableCell className="text-right">
                    {data.delayedYearAtGoal}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(data.delayedCapital, currency)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-orange-700 dark:text-orange-300">
                    -{formatCurrency(data.cost, currency)}
                  </TableCell>
                  <TableCell className="text-right text-orange-600 dark:text-orange-400">
                    -{data.costPercentage.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right text-blue-700 dark:text-blue-300">
                    {data.requiredInitialAmount !== null
                      ? formatCurrency(data.requiredInitialAmount, currency)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right text-blue-700 dark:text-blue-300">
                    {data.requiredMonthlyContribution !== null
                      ? formatCurrency(
                          data.requiredMonthlyContribution,
                          currency
                        )
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground italic">
          {t("components.features.delay-cost-info.description", {
            stepYears,
          })}
        </p>
      </CardContent>
    </Card>
  );
};
