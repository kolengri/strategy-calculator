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
import { Hint } from "@/components/ui/hint";

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

  const lastRowCapitalEnd = lastRow?.capitalEnd ?? 0;

  // Calculate inflation-adjusted (real) capital - what the money will be worth in today's terms
  const inflationMultiplier = Math.pow(1 + inflationRate, yearsToGoal);
  const inflationAdjustedCapital = lastRowCapitalEnd / inflationMultiplier;

  // Calculate effective return after inflation
  const nominalReturn = fund.yearlyReturn * 100;
  const effectiveReturnAfterInflation = nominalReturn - strategy.inflationRate;

  return {
    finalCapital: lastRowCapitalEnd,
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
      hint: t("components.features.strategy-form.summary.finalCapitalHint"),
      value: formatCurrency(summary.finalCapital),
      icon: BadgeDollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: t("components.features.strategy-form.summary.totalContributions"),
      hint: t(
        "components.features.strategy-form.summary.totalContributionsHint"
      ),
      value: formatCurrency(summary.totalContributions),
      icon: PiggyBank,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: t("components.features.strategy-form.summary.totalReturns"),
      hint: t("components.features.strategy-form.summary.totalReturnsHint"),
      value: `+${formatCurrency(summary.totalReturns)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: t("components.features.strategy-form.summary.totalTaxes"),
      hint: t("components.features.strategy-form.summary.totalTaxesHint"),
      value: `-${formatCurrency(summary.totalTaxes)}`,
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      label: t(
        "components.features.strategy-form.summary.inflationAdjustedCapital"
      ),
      hint: t(
        "components.features.strategy-form.summary.inflationAdjustedCapitalHint"
      ),
      value: formatCurrency(summary.inflationAdjustedCapital),
      description: t(
        "components.features.strategy-form.summary.inflationAdjustedCapitalDescription",
        { rate: strategy.inflationRate }
      ),
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: t("components.features.strategy-form.summary.yearsToGoal"),
      hint: t("components.features.strategy-form.summary.yearsToGoalHint"),
      value: `${summary.yearsToGoal}`,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/3 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="size-4 text-primary" />
          {t("components.features.strategy-form.summary.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 xxl:grid-cols-6 gap-3">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1.5 p-3 rounded-lg bg-background/80 border border-border/50"
            >
              <div className="flex items-center gap-1.5">
                <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                  <item.icon className={`size-3.5 ${item.color}`} />
                </div>
                <Hint hint={item.hint}>
                  <span className="text-xs text-muted-foreground truncate">
                    {item.label}
                  </span>
                </Hint>
              </div>
              <span className={`text-base font-bold ${item.color}`}>
                {item.value}
              </span>
              {item.description && (
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {item.description}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Return rates */}
        <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
            <Hint
              hint={t(
                "components.features.strategy-form.summary.averageYearlyReturnHint"
              )}
              className="text-xs text-muted-foreground"
            >
              {t(
                "components.features.strategy-form.summary.averageYearlyReturn"
              )}
            </Hint>
            <span className="font-semibold text-sm text-green-600">
              {formatPercentage(summary.averageYearlyReturn)}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50">
            <Hint
              hint={t(
                "components.features.strategy-form.summary.effectiveReturnHint"
              )}
              className="text-xs text-muted-foreground"
            >
              {t("components.features.strategy-form.summary.effectiveReturn")}
            </Hint>
            <span
              className={`font-semibold text-sm ${
                summary.effectiveReturnAfterInflation >= 0
                  ? "text-green-600"
                  : "text-red-600"
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
