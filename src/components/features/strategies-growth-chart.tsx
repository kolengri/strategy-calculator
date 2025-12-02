import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { useStrategyStore } from "@/stores/strategy";
import { useFormatCurrency } from "@/hooks/useFormatCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  prepareGrowthData,
  type PreparedChartDataPoint,
} from "@/utils/prepare-growth-data";
import { getStrategyColor } from "@/utils/get-strategy-color";

export const StrategiesGrowthChart = () => {
  const { t } = useTranslation();
  const { strategies } = useStrategyStore();
  const formatCurrency = useFormatCurrency();

  const chartData = useMemo(() => {
    const data = prepareGrowthData(strategies);

    // Add labels with age and year (if available)
    return data.map(
      (point): PreparedChartDataPoint => ({
        ...point,
        yearLabel:
          point.year !== undefined
            ? `${point.age} ${t(
                "components.features.strategies-growth-chart.tooltip.age"
              )} (${t("components.features.strategies-growth-chart.year")} ${
                point.year
              })`
            : `${point.age} ${t(
                "components.features.strategies-growth-chart.tooltip.age"
              )}`,
      })
    );
  }, [strategies, t]);

  const chartOptions: AgChartOptions = useMemo(() => {
    if (strategies.length === 0) {
      return {};
    }

    // Calculate min/max values for axes
    const allValues: number[] = [];
    chartData.forEach((dataPoint) => {
      strategies.forEach((strategy) => {
        const capital = dataPoint[strategy.name] as number;
        const contributions = dataPoint[
          `${strategy.name}_contributions`
        ] as number;
        if (typeof capital === "number" && !isNaN(capital) && capital > 0) {
          allValues.push(capital);
        }
        if (
          typeof contributions === "number" &&
          !isNaN(contributions) &&
          contributions > 0
        ) {
          allValues.push(contributions);
        }
      });
    });

    const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
    const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1000000;
    const valueRange = maxValue - minValue;
    const padding = valueRange > 0 ? valueRange * 0.1 : maxValue * 0.1; // 10% padding

    // Get age range for X axis
    const ages = chartData
      .map((d) => d.age as number)
      .filter((a) => !isNaN(a) && a > 0);
    const minAge = ages.length > 0 ? Math.min(...ages) : 25;
    const maxAge = ages.length > 0 ? Math.max(...ages) : 65;
    const ageRange = maxAge - minAge;
    const agePadding = Math.max(1, Math.floor(ageRange * 0.05)); // 5% padding or at least 1 year

    const series = strategies.flatMap((strategy) => {
      const color = getStrategyColor(strategy.id);

      // Parse HSL color to get components for gradient
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      const hue = hslMatch ? hslMatch[1] : "200";
      const saturation = hslMatch ? hslMatch[2] : "70";
      const lightness = hslMatch ? hslMatch[3] : "50";

      // Capital growth area with gradient fill
      const capitalSeries = {
        type: "area" as const,
        xKey: "age",
        yKey: strategy.name,
        yName: strategy.name,
        stroke: color,
        strokeWidth: 3,
        fill: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        fillOpacity: 0.15,
        marker: {
          enabled: false,
          size: 4,
          fill: color,
        },
      };

      // Contributions line (dashed) - собственные вложения пунктиром
      const contributionsSeries = {
        type: "line" as const,
        xKey: "age",
        yKey: `${strategy.name}_contributions`,
        yName: `${strategy.name} - ${t(
          "components.features.strategies-growth-chart.contributions"
        )}`,
        stroke: color,
        strokeWidth: 2,
        lineDash: [8, 4], // Пунктирная линия для собственных вложений
        marker: {
          enabled: false,
          size: 4,
          fill: color,
        },
      };

      return [capitalSeries, contributionsSeries];
    });

    return {
      data: chartData,
      series,
      axes: [
        {
          type: "number",
          position: "left",
          title: {
            text: t("components.features.strategies-growth-chart.yAxisTitle"),
          },
          min: Math.max(0, minValue - padding),
          max: maxValue + padding,
          label: {
            formatter: (params: { value: number }) => {
              return formatCurrency(params.value);
            },
          },
        },
        {
          type: "number",
          position: "bottom",
          title: {
            text: t("components.features.strategies-growth-chart.xAxisTitle"),
          },
          min: Math.max(0, minAge - agePadding),
          max: maxAge + agePadding,
          label: {
            formatter: (params: { value: number }) => {
              const dataPoint = chartData.find((d) => d.age === params.value);
              if (dataPoint && dataPoint.yearLabel) {
                return dataPoint.yearLabel as string;
              }
              return `${params.value}`;
            },
          },
        },
      ],
      legend: {
        enabled: true,
        position: "bottom",
      },
      background: {
        fill: "transparent",
      },
      tooltip: {
        enabled: true,
        renderer: (params: any) => {
          const datum = params.datum;
          const year = datum?.year;
          const age = datum?.age;

          let content = `<div style="padding: 12px; font-family: system-ui, sans-serif;">`;
          content += `<div style="margin-bottom: 8px; font-weight: 600; font-size: 14px;">${t(
            "components.features.strategies-growth-chart.tooltip.age"
          )}: ${age}`;
          if (year !== undefined) {
            content += ` (${t(
              "components.features.strategies-growth-chart.tooltip.year"
            )}: ${year})`;
          }
          content += `</div>`;

          // Show all series values for all strategies
          strategies.forEach((strategy) => {
            const capital = datum?.[strategy.name] as number;
            const contributions = datum?.[
              `${strategy.name}_contributions`
            ] as number;

            if (capital !== undefined && !isNaN(capital)) {
              content += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">`;
              content += `<div style="font-weight: 600; color: ${getStrategyColor(
                strategy.id
              )}; margin-bottom: 4px;">${strategy.name}</div>`;
              content += `<div style="margin-left: 8px; font-size: 13px;">`;
              content += `<div>${t(
                "components.features.strategies-growth-chart.capital"
              )}: <strong>${formatCurrency(capital)}</strong></div>`;
              if (contributions !== undefined && !isNaN(contributions)) {
                content += `<div style="margin-top: 2px;">${t(
                  "components.features.strategies-growth-chart.contributions"
                )}: <strong>${formatCurrency(contributions)}</strong></div>`;
              }
              content += `</div>`;
              content += `</div>`;
            }
          });

          content += `</div>`;
          return content;
        },
      },
    };
  }, [chartData, strategies, formatCurrency, t]);

  if (strategies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("components.features.strategies-growth-chart.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] sm:h-[450px] lg:h-[550px] w-full">
          <AgCharts
            options={chartOptions}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
