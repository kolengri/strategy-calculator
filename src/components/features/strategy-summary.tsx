import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";
import { getFundById } from "@/db/funds";
import {
  TrendingUp,
  PiggyBank,
  Percent,
  Calendar,
  BadgeDollarSign,
  TrendingDown,
} from "lucide-react";

type StrategySummaryProps = {
  strategy: Strategy;
};

type SummaryData = {
  finalCapital: number;
  totalContributions: number;
  totalReturns: number;
  totalTaxes: number;
  inflationAdjustedCapital: number;
  yearsToGoal: number;
  averageYearlyReturn: number;
  effectiveReturnAfterInflation: number;
};

function calculateSummary(strategy: Strategy): SummaryData | null {
  const growthData = calculateCapitalGrowth(strategy);

  if (growthData.length === 0) {
    return null;
  }

  const lastRow = growthData[growthData.length - 1];
  const fund = getFundById(strategy.selectedFund);

  if (!fund) {
    return null;
  }

  // Calculate totals from all rows
  const totalContributions = growthData.reduce(
    (sum, row) => sum + row.contributions,
    strategy.initialAmount
  );
  const totalReturns = growthData.reduce((sum, row) => sum + row.return, 0);
  const totalTaxes = growthData.reduce((sum, row) => sum + row.tax, 0);

  const yearsToGoal = growthData.length;
  const inflationRate = strategy.inflationRate / 100;

  // Calculate inflation-adjusted (real) capital - what the money will be worth in today's terms
  const inflationMultiplier = Math.pow(1 + inflationRate, yearsToGoal);
  const inflationAdjustedCapital = lastRow.capitalEnd / inflationMultiplier;

  // Calculate effective return after inflation
  const nominalReturn = fund.yearlyReturn * 100;
  const effectiveReturnAfterInflation = nominalReturn - strategy.inflationRate;

  return {
    finalCapital: lastRow.capitalEnd,
    totalContributions,
    totalReturns,
    totalTaxes,
    inflationAdjustedCapital,
    yearsToGoal,
    averageYearlyReturn: nominalReturn,
    effectiveReturnAfterInflation,
  };
}

export const StrategySummary = ({ strategy }: StrategySummaryProps) => {
  const { t } = useTranslation();
  const formatCurrency = useFormatCurrency();

  const summary = useMemo(() => calculateSummary(strategy), [strategy]);

  if (!summary) {
    return null;
  }

  const items = [
    {
      label: t("components.features.strategy-form.summary.finalCapital"),
      value: formatCurrency(summary.finalCapital),
      icon: BadgeDollarSign,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: t("components.features.strategy-form.summary.totalContributions"),
      value: formatCurrency(summary.totalContributions),
      icon: PiggyBank,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: t("components.features.strategy-form.summary.totalReturns"),
      value: `+${formatCurrency(summary.totalReturns)}`,
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: t("components.features.strategy-form.summary.totalTaxes"),
      value: `-${formatCurrency(summary.totalTaxes)}`,
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      label: t(
        "components.features.strategy-form.summary.inflationAdjustedCapital"
      ),
      value: formatCurrency(summary.inflationAdjustedCapital),
      description: t(
        "components.features.strategy-form.summary.inflationAdjustedCapitalDescription",
        { rate: strategy.inflationRate }
      ),
      icon: Percent,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: t("components.features.strategy-form.summary.yearsToGoal"),
      value: `${summary.yearsToGoal}`,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          {t("components.features.strategy-form.summary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 p-4 rounded-xl bg-background border"
            >
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`size-4 ${item.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
              </div>
              <span className={`text-xl font-bold ${item.color}`}>
                {item.value}
              </span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Return rates */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">
              {t("components.features.strategy-form.summary.averageYearlyReturn")}
            </span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatPercentage(summary.averageYearlyReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">
              {t("components.features.strategy-form.summary.effectiveReturn")}
            </span>
            <span
              className={`font-semibold ${
                summary.effectiveReturnAfterInflation >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatPercentage(summary.effectiveReturnAfterInflation)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

