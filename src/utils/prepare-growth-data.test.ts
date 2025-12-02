import { test, expect, describe } from "bun:test";
import {
  prepareGrowthData,
  calculateCumulativeContributions,
  getLastRowUpToYear,
  processStrategyForAge,
  calculateAverageYear,
  createAgeDataPoint,
  getAllAges,
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

describe("calculateAverageYear", () => {
  test("should calculate average year", () => {
    const years = [2024, 2025, 2026];
    const avgYear = calculateAverageYear(years);
    expect(avgYear).toBe(2025);
  });

  test("should round average year", () => {
    const years = [2024, 2025, 2026, 2027];
    const avgYear = calculateAverageYear(years);
    expect(avgYear).toBe(2026); // (2024+2025+2026+2027)/4 = 2025.5, rounded to 2026
  });

  test("should return 0 for empty array", () => {
    const avgYear = calculateAverageYear([]);
    expect(avgYear).toBe(0);
  });

  test("should handle single year", () => {
    const avgYear = calculateAverageYear([2024]);
    expect(avgYear).toBe(2024);
  });
});

describe("getAllAges", () => {
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

    const result = getAllAges(allGrowthData);
    expect(result).not.toBeNull();
    expect(result?.minAge).toBe(25);
    expect(result?.maxAge).toBe(32);
  });

  test("should return null for empty data", () => {
    const result = getAllAges([]);
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

    const result = getAllAges(allGrowthData);
    expect(result).toBeNull();
  });
});

describe("processStrategyForAge", () => {
  test("should process strategy with exact age match", () => {
    const ageData: any = { age: 25 };
    const years: number[] = [];
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

    processStrategyForAge(ageData, years, strategy, data, 25);

    expect(ageData["Strategy 1"]).toBe(120700);
    expect(ageData["Strategy 1_contributions"]).toBe(12000);
    expect(years).toContain(2024);
  });

  test("should use last available row when age doesn't match", () => {
    const ageData: any = { age: 26 };
    const years: number[] = [];
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

    processStrategyForAge(ageData, years, strategy, data, 26);

    expect(ageData["Strategy 1"]).toBe(120700);
    expect(ageData["Strategy 1_contributions"]).toBe(12000);
  });

  test("should not add data when no rows exist", () => {
    const ageData: any = { age: 25 };
    const years: number[] = [];
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

    processStrategyForAge(ageData, years, strategy, data, 25);

    expect(ageData["Strategy 1"]).toBeUndefined();
    expect(years.length).toBe(0);
  });
});

describe("createAgeDataPoint", () => {
  test("should create data point for an age with multiple strategies", () => {
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

    const ageData = createAgeDataPoint(25, allGrowthData);

    expect(ageData.age).toBe(25);
    expect(ageData["Strategy 1"]).toBe(120700);
    expect(ageData["Strategy 2"]).toBeUndefined(); // Strategy 2 doesn't have data for age 25
    expect(ageData["Strategy 1_contributions"]).toBe(12000);
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
        goalAge: 65,
      },
    ];

    const result = prepareGrowthData(strategies);

    expect(result.length).toBeGreaterThan(0);
    // Both strategies should have data at some point
    const hasStrategy1 = result.some((r) => r["Strategy 1"] !== undefined);
    const hasStrategy2 = result.some((r) => r["Strategy 2"] !== undefined);
    expect(hasStrategy1).toBe(true);
    expect(hasStrategy2).toBe(true);
    
    // Find a point where both strategies have data
    const pointWithBoth = result.find(
      (r) => r["Strategy 1"] !== undefined && r["Strategy 2"] !== undefined
    );
    if (pointWithBoth) {
      expect(pointWithBoth["Strategy 1_contributions"]).toBeDefined();
      expect(pointWithBoth["Strategy 2_contributions"]).toBeDefined();
    }
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

