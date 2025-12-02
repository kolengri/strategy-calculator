import type { Strategy } from "@/stores/strategy";
import {
  calculateCapitalGrowth,
  type CapitalGrowthRow,
} from "@/utils/calculate-capital-growth";

export type StrategyGrowthData = {
  strategy: Strategy;
  data: CapitalGrowthRow[];
};

export type PreparedChartDataPoint = {
  year?: number;
  age: number;
  yearLabel?: string;
  [key: string]: number | string | undefined;
};

/**
 * Calculates cumulative contributions up to a given year for a strategy
 */
export function calculateCumulativeContributions(
  data: CapitalGrowthRow[],
  year: number
): number {
  return data
    .filter((r) => r.year <= year)
    .reduce((sum, r) => sum + r.contributions, 0);
}

/**
 * Calculates cumulative contributions up to a given age for a strategy
 */
export function calculateCumulativeContributionsByAge(
  data: CapitalGrowthRow[],
  age: number
): number {
  return data
    .filter((r) => r.age <= age)
    .reduce((sum, r) => sum + r.contributions, 0);
}

/**
 * Gets the last available row for a strategy up to a given year
 */
export function getLastRowUpToYear(
  data: CapitalGrowthRow[],
  year: number
): CapitalGrowthRow | undefined {
  return data.filter((r) => r.year <= year).sort((a, b) => b.year - a.year)[0];
}

/**
 * Gets all unique ages from growth data
 */
export function getAllAges(
  allGrowthData: StrategyGrowthData[]
): { minAge: number; maxAge: number } | null {
  const allAges = allGrowthData.flatMap(({ data }) =>
    data.map((row) => row.age)
  );
  if (allAges.length === 0) {
    return null;
  }

  return {
    minAge: Math.min(...allAges),
    maxAge: Math.max(...allAges),
  };
}

/**
 * Processes a single strategy for a given age and updates the age data point
 */
export function processStrategyForAge(
  ageData: PreparedChartDataPoint,
  years: number[],
  strategy: Strategy,
  data: CapitalGrowthRow[],
  age: number
): void {
  const row = data.find((r) => r.age === age);

  if (row) {
    // Use the exact data for this age
    ageData[strategy.name] = row.capitalEnd;
    ageData[`${strategy.name}_contributions`] =
      calculateCumulativeContributionsByAge(data, age);
    years.push(row.year);
  } else {
    // If no data for this age, use the last available value for this strategy
    const lastRow = data
      .filter((r) => r.age <= age)
      .sort((a, b) => b.age - a.age)[0];

    if (lastRow) {
      ageData[strategy.name] = lastRow.capitalEnd;
      ageData[`${strategy.name}_contributions`] =
        calculateCumulativeContributionsByAge(data, age);
      years.push(lastRow.year);
    }
  }
}

/**
 * Calculates average year from an array of years
 */
export function calculateAverageYear(years: number[]): number {
  if (years.length === 0) {
    return 0;
  }
  return Math.round(years.reduce((a, b) => a + b, 0) / years.length);
}

/**
 * Creates a data point for a specific age with all strategies
 */
export function createAgeDataPoint(
  age: number,
  allGrowthData: StrategyGrowthData[]
): PreparedChartDataPoint {
  const ageData: PreparedChartDataPoint = { age };
  const years: number[] = [];

  // Process each strategy independently
  allGrowthData.forEach(({ strategy, data }) => {
    processStrategyForAge(ageData, years, strategy, data, age);
  });

  // Add average year for this age (for display purposes)
  if (years.length > 0) {
    ageData.year = calculateAverageYear(years);
  }

  return ageData;
}

/**
 * Prepares growth data for all strategies for chart/table visualization
 * Each strategy is processed independently - no summing between strategies
 * Data is grouped by age to allow comparison at the same life stage
 */
export function prepareGrowthData(
  strategies: Strategy[]
): PreparedChartDataPoint[] {
  if (strategies.length === 0) {
    return [];
  }

  // Calculate growth for all strategies independently
  const allGrowthData: StrategyGrowthData[] = strategies.map((strategy) => ({
    strategy,
    data: calculateCapitalGrowth(strategy),
  }));

  // Find the maximum and minimum age across all strategies
  const ageRange = getAllAges(allGrowthData);
  if (!ageRange) {
    return [];
  }

  const { minAge, maxAge } = ageRange;

  // Create a map of age -> data point with all strategies
  const ageMap = new Map<number, PreparedChartDataPoint>();

  for (let age = minAge; age <= maxAge; age++) {
    const ageData = createAgeDataPoint(age, allGrowthData);
    ageMap.set(age, ageData);
  }

  return Array.from(ageMap.values());
}
