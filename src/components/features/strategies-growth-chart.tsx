import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AgCharts } from "ag-charts-react";
import type { AgChartOptions } from "ag-charts-community";
import { useStrategyStore } from "@/stores/strategy";
import { calculateCapitalGrowth } from "@/utils/calculate-capital-growth";
import { useCurrencyStore } from "@/stores/currency";
import { formatCurrency } from "@/utils/currencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Generate a unique color for each strategy based on its ID
function getStrategyColor(strategyId: string, index: number): string {
  // Use a hash function to generate a consistent color from the ID
  let hash = 0;
  for (let i = 0; i < strategyId.length; i++) {
    hash = strategyId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  const saturation = 60 + (Math.abs(hash) % 20); // 60-80% saturation
  const lightness = 45 + (Math.abs(hash) % 15); // 45-60% lightness

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export const StrategiesGrowthChart = () => {
  const { t } = useTranslation();
  const { strategies } = useStrategyStore();
  const { currency } = useCurrencyStore();

  const chartData = useMemo(() => {
    if (strategies.length === 0) {
      return [];
    }

    // Calculate growth for all strategies
    const allGrowthData = strategies.map((strategy) => ({
      strategy,
      data: calculateCapitalGrowth(strategy),
    }));

    // Find the maximum year across all strategies
    const maxYear = Math.max(
      ...allGrowthData.flatMap(({ data }) => data.map((row) => row.year))
    );
    const minYear = Math.min(
      ...allGrowthData.flatMap(({ data }) => data.map((row) => row.year))
    );

    // Create a map of year -> { strategyName: capitalEnd, strategyNameContributions: totalContributions, age: age }
    const yearMap = new Map<number, Record<string, number | string>>();

    for (let year = minYear; year <= maxYear; year++) {
      const yearData: Record<string, number | string> = { year };
      const ages: number[] = [];

      allGrowthData.forEach(({ strategy, data }, index) => {
        const row = data.find((r) => r.year === year);
        if (row) {
          yearData[strategy.name] = row.capitalEnd;
          // Calculate cumulative contributions up to this year
          const cumulativeContributions = data
            .filter((r) => r.year <= year)
            .reduce((sum, r) => sum + r.contributions, 0);
          yearData[`${strategy.name}_contributions`] = cumulativeContributions;
          ages.push(row.age);
        } else {
          // If no data for this year, use the last available value
          const lastRow = data
            .filter((r) => r.year <= year)
            .sort((a, b) => b.year - a.year)[0];
          if (lastRow) {
            yearData[strategy.name] = lastRow.capitalEnd;
            // Calculate cumulative contributions up to this year
            const cumulativeContributions = data
              .filter((r) => r.year <= year)
              .reduce((sum, r) => sum + r.contributions, 0);
            yearData[`${strategy.name}_contributions`] =
              cumulativeContributions;
            ages.push(lastRow.age);
          }
        }
      });

      // Add average age for this year (for display purposes)
      if (ages.length > 0) {
        const avgAge = Math.round(
          ages.reduce((a, b) => a + b, 0) / ages.length
        );
        yearData.age = avgAge;
        yearData.yearLabel = `${t(
          "components.features.strategies-growth-chart.year"
        )} ${year} (${avgAge})`;
      }

      yearMap.set(year, yearData);
    }

    return Array.from(yearMap.values());
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

    const years = chartData
      .map((d) => d.year as number)
      .filter((y) => !isNaN(y));
    const minYear =
      years.length > 0 ? Math.min(...years) : new Date().getFullYear();
    const maxYear =
      years.length > 0 ? Math.max(...years) : new Date().getFullYear() + 10;
    const yearRange = maxYear - minYear;
    const yearPadding = Math.max(1, Math.floor(yearRange * 0.05)); // 5% padding or at least 1 year

    const series = strategies.flatMap((strategy, index) => {
      const color = getStrategyColor(strategy.id, index);
      // Capital growth line
      const capitalSeries = {
        type: "line" as const,
        xKey: "year",
        yKey: strategy.name,
        yName: strategy.name,
        stroke: color,
        strokeWidth: 2,
        marker: {
          enabled: false,
          size: 4,
          fill: color,
        },
      };

      // Contributions line (dashed)
      const contributionsSeries = {
        type: "line" as const,
        xKey: "year",
        yKey: `${strategy.name}_contributions`,
        yName: `${strategy.name} - ${t(
          "components.features.strategies-growth-chart.contributions"
        )}`,
        stroke: color,
        strokeWidth: 2,
        strokeDashArray: [8, 4],
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
              return formatCurrency(params.value, currency);
            },
          },
        },
        {
          type: "number",
          position: "bottom",
          title: {
            text: t("components.features.strategies-growth-chart.xAxisTitle"),
          },
          min: minYear - yearPadding,
          max: maxYear + yearPadding,
          label: {
            formatter: (params: { value: number }) => {
              const dataPoint = chartData.find((d) => d.year === params.value);
              if (dataPoint && dataPoint.yearLabel) {
                return dataPoint.yearLabel as string;
              }
              return params.value.toString();
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
          const year = params.datum?.year;
          const age = params.datum?.age;
          let content = `<div style="padding: 8px;"><strong>${t(
            "components.features.strategies-growth-chart.tooltip.year"
          )}: ${year}</strong>`;
          if (age !== undefined) {
            content += `<br/><strong>${t(
              "components.features.strategies-growth-chart.tooltip.age"
            )}: ${age}</strong>`;
          }
          content += "</div>";
          return content;
        },
      },
    };
  }, [chartData, strategies, currency, t]);

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
        <div className="h-[600px] w-full">
          <AgCharts
            options={chartOptions}
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
