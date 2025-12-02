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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Hint } from "@/components/ui/hint";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { formatPercentage } from "@/utils/format";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";
import { ExportCSVButton } from "./export-csv-button";
import { CalendarIcon } from "lucide-react";

type TableColumn = {
  key: string;
  label: string;
  hint?: string;
  align?: "left" | "right";
};

const TableHeadWithHint = ({ column }: { column: TableColumn }) => {
  const alignClass = column.align === "right" ? "text-right" : "";

  if (!column.hint) {
    return (
      <TableHead className={`text-xs ${alignClass}`}>{column.label}</TableHead>
    );
  }

  return (
    <TableHead className={`text-xs ${alignClass}`}>
      <Hint
        hint={column.hint}
        className={column.align === "right" ? "justify-end" : ""}
      >
        {column.label}
      </Hint>
    </TableHead>
  );
};

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

  const columns: TableColumn[] = useMemo(
    () => [
      {
        key: "year",
        label: t("components.features.capital-growth-table.columns.year"),
      },
      {
        key: "age",
        label: t("components.features.capital-growth-table.columns.age"),
      },
      {
        key: "capitalStart",
        label: t("components.features.capital-growth-table.columns.capitalStart"),
        hint: t("components.features.capital-growth-table.columns.capitalStartHint"),
        align: "right",
      },
      {
        key: "contributions",
        label: t("components.features.capital-growth-table.columns.contributions"),
        hint: t("components.features.capital-growth-table.columns.contributionsHint"),
        align: "right",
      },
      {
        key: "return",
        label: t("components.features.capital-growth-table.columns.return"),
        hint: t("components.features.capital-growth-table.columns.returnHint"),
        align: "right",
      },
      {
        key: "tax",
        label: t("components.features.capital-growth-table.columns.tax"),
        hint: t("components.features.capital-growth-table.columns.taxHint"),
        align: "right",
      },
      {
        key: "withdrawal",
        label: t("components.features.capital-growth-table.columns.withdrawal"),
        hint: t("components.features.capital-growth-table.columns.withdrawalHint"),
        align: "right",
      },
      {
        key: "capitalEnd",
        label: t("components.features.capital-growth-table.columns.capitalEnd"),
        hint: t("components.features.capital-growth-table.columns.capitalEndHint"),
        align: "right",
      },
      {
        key: "goalProgress",
        label: t("components.features.capital-growth-table.columns.goalProgress"),
        hint: t("components.features.capital-growth-table.columns.goalProgressHint"),
        align: "right",
      },
    ],
    [t]
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
                {columns.map((column) => (
                  <TableHeadWithHint key={column.key} column={column} />
                ))}
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
