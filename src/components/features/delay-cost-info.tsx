import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import { calculateDelayDataList } from "@/utils/delay-cost";
import { AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Hint } from "@/components/ui/hint";

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
  const formatCurrency = useFormatCurrency();

  const delayDataList = useMemo(
    () => calculateDelayDataList(strategy, stepYears, maxDelayYears),
    [strategy, stepYears, maxDelayYears]
  );

  if (delayDataList.length === 0) {
    return null;
  }

  const currentCapital = delayDataList[0]?.currentCapital || 0;
  const currentYearAtGoal = delayDataList[0]?.currentYearAtGoal || 0;

  return (
    <Card className="border-orange-200 bg-orange-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="size-4 text-orange-600" />
          {t("components.features.delay-cost-info.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2 bg-background rounded-lg border text-sm">
            <span className="text-muted-foreground">
              {t("components.features.delay-cost-info.currentCapital")}
            </span>
            <span className="font-semibold">
              {formatCurrency(currentCapital)}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-background rounded-lg border text-sm">
            <span className="text-muted-foreground">
              {t("components.features.delay-cost-info.currentYearAtGoal")}
            </span>
            <span className="font-semibold">{currentYearAtGoal}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.delayYearsHint"
                    )}
                  >
                    {t("components.features.delay-cost-info.table.delayYears")}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.ageAtStartHint"
                    )}
                    className="justify-end"
                  >
                    {t("components.features.delay-cost-info.table.ageAtStart")}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.yearAtGoalHint"
                    )}
                    className="justify-end"
                  >
                    {t("components.features.delay-cost-info.table.yearAtGoal")}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.delayedCapitalHint"
                    )}
                    className="justify-end"
                  >
                    {t(
                      "components.features.delay-cost-info.table.delayedCapital"
                    )}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.costHint"
                    )}
                    className="justify-end"
                  >
                    {t("components.features.delay-cost-info.table.cost")}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.costPercentageHint"
                    )}
                    className="justify-end"
                  >
                    {t(
                      "components.features.delay-cost-info.table.costPercentage"
                    )}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.requiredInitialDescription"
                    )}
                    className="justify-end"
                  >
                    {t(
                      "components.features.delay-cost-info.table.requiredInitial"
                    )}
                  </Hint>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <Hint
                    hint={t(
                      "components.features.delay-cost-info.table.requiredMonthlyDescription"
                    )}
                    className="justify-end"
                  >
                    {t(
                      "components.features.delay-cost-info.table.requiredMonthly"
                    )}
                  </Hint>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayDataList.map((data) => (
                <TableRow key={data.delayYears}>
                  <TableCell className="font-medium text-sm">
                    {t("components.features.delay-cost-info.table.yearsLabel", {
                      years: data.delayYears,
                    })}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {strategy.currentAge + data.delayYears}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {data.delayedYearAtGoal}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {formatCurrency(data.delayedCapital)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm text-orange-700">
                    -{formatCurrency(data.cost)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-orange-600">
                    -{formatPercentage(data.costPercentage)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-blue-700">
                    {data.requiredInitialAmount !== null
                      ? formatCurrency(data.requiredInitialAmount)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-blue-700">
                    {data.requiredMonthlyContribution !== null
                      ? formatCurrency(data.requiredMonthlyContribution)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("components.features.delay-cost-info.description", { stepYears })}
        </p>
      </CardContent>
    </Card>
  );
};
