import { test, expect, describe } from "bun:test";
import {
  prepareGrowthData,
  calculateCumulativeContributions,
  getLastRowUpToYear,
  processStrategyForYear,
  calculateAverageAge,
  createYearDataPoint,
  getAllYears,
} from "./prepare-growth-data";
import type { Strategy } from "@/stores/strategy";
import { FUNDS } from "@/db/funds";
import type { CapitalGrowthRow } from "./calculate-capital-growth";

describe("calculateCumulativeContributions", () => {
  test("should calculate cumulative contributions up to a year", () => {
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
      {
        year: 2025,
        age: 26,
        capitalStart: 120700,
        contributions: 12000,
        return: 12000,
        tax: 1560,
        capitalEnd: 143140,
        goalProgress: 10,
      },
      {
        year: 2026,
        age: 27,
        capitalStart: 143140,
        contributions: 12000,
        return: 14000,
        tax: 1820,
        capitalEnd: 167320,
        goalProgress: 15,
      },
    ];

    const cumulative = calculateCumulativeContributions(data, 2025);
    expect(cumulative).toBe(24000); // 12000 + 12000
  });

  test("should return 0 for year before any data", () => {
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
    ];

    const cumulative = calculateCumulativeContributions(data, 2023);
    expect(cumulative).toBe(0);
  });

  test("should handle empty data", () => {
    const cumulative = calculateCumulativeContributions([], 2024);
    expect(cumulative).toBe(0);
  });
});

describe("getLastRowUpToYear", () => {
  test("should return last row up to given year", () => {
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
      {
        year: 2025,
        age: 26,
        capitalStart: 120700,
        contributions: 12000,
        return: 12000,
        tax: 1560,
        capitalEnd: 143140,
        goalProgress: 10,
      },
    ];

    const lastRow = getLastRowUpToYear(data, 2025);
    expect(lastRow?.year).toBe(2025);
  });

  test("should return undefined for year before any data", () => {
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
    ];

    const lastRow = getLastRowUpToYear(data, 2023);
    expect(lastRow).toBeUndefined();
  });

  test("should return most recent row when multiple rows exist", () => {
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
      {
        year: 2026,
        age: 27,
        capitalStart: 143140,
        contributions: 12000,
        return: 14000,
        tax: 1820,
        capitalEnd: 167320,
        goalProgress: 15,
      },
    ];

    const lastRow = getLastRowUpToYear(data, 2025);
    expect(lastRow?.year).toBe(2024);
  });
});

describe("calculateAverageAge", () => {
  test("should calculate average age", () => {
    const ages = [25, 26, 27];
    const avgAge = calculateAverageAge(ages);
    expect(avgAge).toBe(26);
  });

  test("should round average age", () => {
    const ages = [25, 26, 27, 28];
    const avgAge = calculateAverageAge(ages);
    expect(avgAge).toBe(27); // (25+26+27+28)/4 = 26.5, rounded to 27
  });

  test("should return 0 for empty array", () => {
    const avgAge = calculateAverageAge([]);
    expect(avgAge).toBe(0);
  });

  test("should handle single age", () => {
    const avgAge = calculateAverageAge([25]);
    expect(avgAge).toBe(25);
  });
});

describe("getAllYears", () => {
  test("should return min and max years from growth data", () => {
    const allGrowthData = [
      {
        strategy: {
          id: "1",
          name: "Strategy 1",
          createdAt: new Date(),
          type: "age-based" as const,
          currentAge: 25,
          initialAmount: 100000,
          monthlyContribution: 1000,
          selectedFund: FUNDS[0].id,
          inflationRate: 3,
          taxRate: 13,
          goalAge: 65,
        },
        data: [
          {
            year: 2024,
            age: 25,
            capitalStart: 100000,
            contributions: 12000,
            return: 10000,
            tax: 1300,
            capitalEnd: 120700,
            goalProgress: 5,
          },
          {
            year: 2025,
            age: 26,
            capitalStart: 120700,
            contributions: 12000,
            return: 12000,
            tax: 1560,
            capitalEnd: 143140,
            goalProgress: 10,
          },
        ],
      },
      {
        strategy: {
          id: "2",
          name: "Strategy 2",
          createdAt: new Date(),
          type: "age-based" as const,
          currentAge: 30,
          initialAmount: 200000,
          monthlyContribution: 2000,
          selectedFund: FUNDS[0].id,
          inflationRate: 3,
          taxRate: 13,
          goalAge: 65,
        },
        data: [
          {
            year: 2024,
            age: 30,
            capitalStart: 200000,
            contributions: 24000,
            return: 20000,
            tax: 2600,
            capitalEnd: 241400,
            goalProgress: 8,
          },
          {
            year: 2026,
            age: 32,
            capitalStart: 265400,
            contributions: 24000,
            return: 25000,
            tax: 3250,
            capitalEnd: 292150,
            goalProgress: 15,
          },
        ],
      },
    ];

    const result = getAllYears(allGrowthData);
    expect(result).not.toBeNull();
    expect(result?.minYear).toBe(2024);
    expect(result?.maxYear).toBe(2026);
  });

  test("should return null for empty data", () => {
    const result = getAllYears([]);
    expect(result).toBeNull();
  });

  test("should return null when all strategies have empty data", () => {
    const allGrowthData = [
      {
        strategy: {
          id: "1",
          name: "Strategy 1",
          createdAt: new Date(),
          type: "age-based" as const,
          currentAge: 25,
          initialAmount: 100000,
          monthlyContribution: 1000,
          selectedFund: FUNDS[0].id,
          inflationRate: 3,
          taxRate: 13,
          goalAge: 65,
        },
        data: [],
      },
    ];

    const result = getAllYears(allGrowthData);
    expect(result).toBeNull();
  });
});

describe("processStrategyForYear", () => {
  test("should process strategy with exact year match", () => {
    const yearData: any = { year: 2024 };
    const ages: number[] = [];
    const strategy: Strategy = {
      id: "1",
      name: "Strategy 1",
      createdAt: new Date(),
      type: "age-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goalAge: 65,
    };
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
    ];

    processStrategyForYear(yearData, ages, strategy, data, 2024);

    expect(yearData["Strategy 1"]).toBe(120700);
    expect(yearData["Strategy 1_contributions"]).toBe(12000);
    expect(ages).toContain(25);
  });

  test("should use last available row when year doesn't match", () => {
    const yearData: any = { year: 2025 };
    const ages: number[] = [];
    const strategy: Strategy = {
      id: "1",
      name: "Strategy 1",
      createdAt: new Date(),
      type: "age-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goalAge: 65,
    };
    const data: CapitalGrowthRow[] = [
      {
        year: 2024,
        age: 25,
        capitalStart: 100000,
        contributions: 12000,
        return: 10000,
        tax: 1300,
        capitalEnd: 120700,
        goalProgress: 5,
      },
    ];

    processStrategyForYear(yearData, ages, strategy, data, 2025);

    expect(yearData["Strategy 1"]).toBe(120700);
    expect(yearData["Strategy 1_contributions"]).toBe(12000);
  });

  test("should not add data when no rows exist", () => {
    const yearData: any = { year: 2024 };
    const ages: number[] = [];
    const strategy: Strategy = {
      id: "1",
      name: "Strategy 1",
      createdAt: new Date(),
      type: "age-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goalAge: 65,
    };
    const data: CapitalGrowthRow[] = [];

    processStrategyForYear(yearData, ages, strategy, data, 2024);

    expect(yearData["Strategy 1"]).toBeUndefined();
    expect(ages.length).toBe(0);
  });
});

describe("createYearDataPoint", () => {
  test("should create data point for a year with multiple strategies", () => {
    const allGrowthData = [
      {
        strategy: {
          id: "1",
          name: "Strategy 1",
          createdAt: new Date(),
          type: "age-based" as const,
          currentAge: 25,
          initialAmount: 100000,
          monthlyContribution: 1000,
          selectedFund: FUNDS[0].id,
          inflationRate: 3,
          taxRate: 13,
          goalAge: 65,
        },
        data: [
          {
            year: 2024,
            age: 25,
            capitalStart: 100000,
            contributions: 12000,
            return: 10000,
            tax: 1300,
            capitalEnd: 120700,
            goalProgress: 5,
          },
        ],
      },
      {
        strategy: {
          id: "2",
          name: "Strategy 2",
          createdAt: new Date(),
          type: "age-based" as const,
          currentAge: 30,
          initialAmount: 200000,
          monthlyContribution: 2000,
          selectedFund: FUNDS[0].id,
          inflationRate: 3,
          taxRate: 13,
          goalAge: 65,
        },
        data: [
          {
            year: 2024,
            age: 30,
            capitalStart: 200000,
            contributions: 24000,
            return: 20000,
            tax: 2600,
            capitalEnd: 241400,
            goalProgress: 8,
          },
        ],
      },
    ];

    const yearData = createYearDataPoint(2024, allGrowthData);

    expect(yearData.year).toBe(2024);
    expect(yearData["Strategy 1"]).toBe(120700);
    expect(yearData["Strategy 2"]).toBe(241400);
    expect(yearData["Strategy 1_contributions"]).toBe(12000);
    expect(yearData["Strategy 2_contributions"]).toBe(24000);
    expect(yearData.age).toBe(28); // Average of 25 and 30, rounded
  });
});

describe("prepareGrowthData", () => {
  test("should return empty array for empty strategies", () => {
    const result = prepareGrowthData([]);
    expect(result).toEqual([]);
  });

  test("should prepare data for single strategy", () => {
    const strategies: Strategy[] = [
      {
        id: "1",
        name: "Strategy 1",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 25,
        initialAmount: 100000,
        monthlyContribution: 1000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
    ];

    const result = prepareGrowthData(strategies);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].year).toBeGreaterThan(0);
    expect(result[0]["Strategy 1"]).toBeDefined();
  });

  test("should prepare data for multiple strategies", () => {
    const strategies: Strategy[] = [
      {
        id: "1",
        name: "Strategy 1",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 25,
        initialAmount: 100000,
        monthlyContribution: 1000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
      {
        id: "2",
        name: "Strategy 2",
        createdAt: new Date(),
        type: "goal-based",
        currentAge: 30,
        initialAmount: 200000,
        monthlyContribution: 2000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goal: 1000000,
      },
    ];

    const result = prepareGrowthData(strategies);

    expect(result.length).toBeGreaterThan(0);
    const firstPoint = result[0];
    expect(firstPoint["Strategy 1"]).toBeDefined();
    expect(firstPoint["Strategy 2"]).toBeDefined();
    expect(firstPoint["Strategy 1_contributions"]).toBeDefined();
    expect(firstPoint["Strategy 2_contributions"]).toBeDefined();
  });

  test("should handle strategies with different year ranges", () => {
    const strategies: Strategy[] = [
      {
        id: "1",
        name: "Short Strategy",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 60,
        initialAmount: 100000,
        monthlyContribution: 1000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
      {
        id: "2",
        name: "Long Strategy",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 25,
        initialAmount: 200000,
        monthlyContribution: 2000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
    ];

    const result = prepareGrowthData(strategies);

    // Should include all years from both strategies
    const years = result.map((r) => r.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Both strategies should have data
    const shortStrategyYears = result.filter(
      (r) => r["Short Strategy"] !== undefined
    ).length;
    const longStrategyYears = result.filter(
      (r) => r["Long Strategy"] !== undefined
    ).length;

    // Both should have some data
    expect(shortStrategyYears).toBeGreaterThan(0);
    expect(longStrategyYears).toBeGreaterThan(0);
    
    // Short strategy should have data for fewer or equal years (since it starts later)
    expect(shortStrategyYears).toBeLessThanOrEqual(longStrategyYears);
    
    // Check that result includes data from both strategies
    const hasShortStrategy = result.some((r) => r["Short Strategy"] !== undefined);
    const hasLongStrategy = result.some((r) => r["Long Strategy"] !== undefined);
    expect(hasShortStrategy).toBe(true);
    expect(hasLongStrategy).toBe(true);
  });

  test("should calculate cumulative contributions correctly", () => {
    const strategies: Strategy[] = [
      {
        id: "1",
        name: "Strategy 1",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 25,
        initialAmount: 100000,
        monthlyContribution: 1000,
        selectedFund: FUNDS[0].id,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
    ];

    const result = prepareGrowthData(strategies);

    // Contributions should be cumulative
    if (result.length >= 2) {
      const firstContributions = result[0]["Strategy 1_contributions"] as number;
      const secondContributions = result[1][
        "Strategy 1_contributions"
      ] as number;

      expect(secondContributions).toBeGreaterThan(firstContributions);
    }
  });

  test("should handle invalid fund gracefully", () => {
    const strategies: Strategy[] = [
      {
        id: "1",
        name: "Invalid Strategy",
        createdAt: new Date(),
        type: "age-based",
        currentAge: 25,
        initialAmount: 100000,
        monthlyContribution: 1000,
        selectedFund: "INVALID" as any,
        inflationRate: 3,
        taxRate: 13,
        goalAge: 65,
      },
    ];

    const result = prepareGrowthData(strategies);
    expect(result).toEqual([]);
  });
});

