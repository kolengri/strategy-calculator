import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Strategy } from "@/stores/strategy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import { calculateDelayDataList } from "@/utils/delay-cost";
import { AlertCircle, HelpCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.delayYears"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.delayYearsHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.ageAtStart"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.ageAtStartHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.yearAtGoal"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.yearAtGoalHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.delayedCapital"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.delayedCapitalHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t("components.features.delay-cost-info.table.cost")}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.costHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.costPercentage"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.costPercentageHint"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.requiredInitial"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.requiredInitialDescription"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-right text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                        {t(
                          "components.features.delay-cost-info.table.requiredMonthly"
                        )}
                        <HelpCircle className="size-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {t(
                            "components.features.delay-cost-info.table.requiredMonthlyDescription"
                          )}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
