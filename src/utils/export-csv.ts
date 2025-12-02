import type { CapitalGrowthRow } from "./calculate-capital-growth";
import type { Strategy } from "@/stores/strategy";

/**
 * Converts capital growth data to CSV format
 */
export function capitalGrowthToCSV(
  data: CapitalGrowthRow[],
  strategy: Strategy,
  headers: {
    year: string;
    age: string;
    capitalStart: string;
    contributions: string;
    return: string;
    tax: string;
    capitalEnd: string;
    goalProgress: string;
  }
): string {
  const csvHeaders = [
    headers.year,
    headers.age,
    headers.capitalStart,
    headers.contributions,
    headers.return,
    headers.tax,
    headers.capitalEnd,
    headers.goalProgress,
  ];

  const rows = data.map((row) => [
    row.year,
    row.age,
    row.capitalStart,
    row.contributions,
    row.return,
    row.tax,
    row.capitalEnd,
    `${row.goalProgress.toFixed(1)}%`,
  ]);

  const csvContent = [
    `# ${strategy.name}`,
    csvHeaders.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Downloads a string as a file
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = "text/csv;charset=utf-8;"
): void {
  const blob = new Blob(["\ufeff" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports strategies to JSON format for backup/restore
 */
export function strategiesToJSON(strategies: Strategy[]): string {
  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    strategies: strategies.map((s) => ({
      ...s,
      // Remove internal IDs, they will be regenerated on import
      id: undefined,
    })),
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Parses imported JSON and returns strategies
 */
export function parseStrategiesJSON(
  json: string
): { strategies: Omit<Strategy, "id">[]; version: string } | null {
  try {
    const data = JSON.parse(json);
    if (!data.strategies || !Array.isArray(data.strategies)) {
      return null;
    }
    return {
      strategies: data.strategies,
      version: data.version || "unknown",
    };
  } catch {
    return null;
  }
}

