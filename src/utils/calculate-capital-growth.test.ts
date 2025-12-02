import { test, expect, describe } from "bun:test";
import {
  calculateCapitalGrowth,
  calculateMonthlyReturn,
  calculateYearCapital,
  calculateGoalProgress,
  calculateTargetAmount,
  getEffectiveMaxYears,
  shouldStopCalculation,
  calculateProjectedCapital,
  estimateYearsToGoal,
  calculateGoalBasedMonthlyContribution,
} from "./calculate-capital-growth";
import type { Strategy } from "@/stores/strategy";
import { FUNDS } from "@/db/funds";

describe("calculateMonthlyReturn", () => {
  test("should calculate monthly return from yearly return", () => {
    const yearlyReturn = 0.12; // 12% yearly
    const monthlyReturn = calculateMonthlyReturn(yearlyReturn);
    // Monthly return should be approximately (1.12^(1/12)) - 1
    expect(monthlyReturn).toBeCloseTo(0.00948879, 5);
  });

  test("should handle zero return", () => {
    const monthlyReturn = calculateMonthlyReturn(0);
    expect(monthlyReturn).toBe(0);
  });

  test("should handle negative return", () => {
    const yearlyReturn = -0.1; // -10% yearly
    const monthlyReturn = calculateMonthlyReturn(yearlyReturn);
    expect(monthlyReturn).toBeLessThan(0);
  });
});

describe("calculateYearCapital", () => {
  test("should calculate capital growth for a year", () => {
    const capitalStart = 100000;
    const monthlyContribution = 1000;
    const monthlyReturn = 0.01; // 1% monthly
    const taxRate = 0.13; // 13% tax

    const result = calculateYearCapital(
      capitalStart,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );

    expect(result.annualContributions).toBe(12000);
    expect(result.capitalEnd).toBeGreaterThan(capitalStart);
    expect(result.totalReturn).toBeGreaterThan(0);
    expect(result.tax).toBeGreaterThanOrEqual(0);
  });

  test("should handle zero monthly return", () => {
    const capitalStart = 100000;
    const monthlyContribution = 1000;
    const monthlyReturn = 0;
    const taxRate = 0.13;

    const result = calculateYearCapital(
      capitalStart,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );

    expect(result.capitalEnd).toBe(capitalStart + 12000);
    expect(result.totalReturn).toBe(0);
    expect(result.tax).toBe(0);
  });

  test("should not apply tax on negative returns", () => {
    const capitalStart = 100000;
    const monthlyContribution = 1000;
    const monthlyReturn = -0.01; // -1% monthly (loss)
    const taxRate = 0.13;

    const result = calculateYearCapital(
      capitalStart,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );

    expect(result.totalReturn).toBeLessThan(0);
    expect(result.tax).toBe(0); // No tax on losses
  });
});

describe("calculateGoalProgress", () => {
  test("should calculate progress for age-based strategy", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const progress = calculateGoalProgress(strategy, 0, 40, 150000, 2000000);
    // After 1 year out of 40, progress should be 2.5%
    expect(progress).toBeCloseTo(2.5, 1);
  });

  test("should calculate progress for goal-based strategy", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 65,
    };

    const progress = calculateGoalProgress(strategy, 0, 20, 500000, 1000000);
    // 500000 / 1000000 = 50%
    expect(progress).toBe(50);
  });

  test("should cap progress at 100%", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const progress = calculateGoalProgress(strategy, 39, 40, 2000000, 2000000);
    expect(progress).toBe(100);
  });
});

describe("calculateTargetAmount", () => {
  test("should calculate target for age-based strategy", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const { targetAmount, yearsToGoal } = calculateTargetAmount(
      strategy,
      0.1,
      0.13
    );

    expect(yearsToGoal).toBe(40);
    expect(targetAmount).toBeGreaterThan(strategy.initialAmount);
  });

  test("should calculate target for goal-based strategy", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 65,
    };

    const { targetAmount, yearsToGoal } = calculateTargetAmount(
      strategy,
      0.1,
      0.13
    );

    expect(yearsToGoal).toBe(40); // 65 - 25
    expect(targetAmount).toBe(strategy.goal); // Exact goal amount, no inflation adjustment
  });
});

describe("calculateGoalBasedMonthlyContribution", () => {
  test("should return positive contribution for valid inputs", () => {
    const fund = FUNDS[0];
    const contribution = calculateGoalBasedMonthlyContribution(
      1000000, // goal
      100000, // initialAmount
      30, // currentAge
      65, // goalAge
      fund.yearlyReturn,
      0.13,
      3
    );

    expect(contribution).toBeGreaterThan(0);
  });

  test("should return 0 when goal already met", () => {
    const fund = FUNDS[0];
    const contribution = calculateGoalBasedMonthlyContribution(
      100000, // goal
      1000000, // initialAmount (already exceeds goal)
      30, // currentAge
      65, // goalAge
      fund.yearlyReturn,
      0.13,
      3
    );

    expect(contribution).toBe(0);
  });
});

describe("getEffectiveMaxYears", () => {
  test("should limit maxYears for goal-based strategy based on goalAge", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 65,
    };

    const effectiveMaxYears = getEffectiveMaxYears(strategy, 50);
    expect(effectiveMaxYears).toBe(41); // 65 - 25 + 1
  });

  test("should limit maxYears for age-based strategy", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const effectiveMaxYears = getEffectiveMaxYears(strategy, 50);
    expect(effectiveMaxYears).toBe(41); // 65 - 25 + 1
  });

  test("should use maxYears when it's less than years to goal", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const effectiveMaxYears = getEffectiveMaxYears(strategy, 10);
    expect(effectiveMaxYears).toBe(10);
  });
});

describe("shouldStopCalculation", () => {
  test("should stop for age-based strategy when age reached", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    expect(shouldStopCalculation(strategy, 65, 1000000, 2000000)).toBe(true);
    expect(shouldStopCalculation(strategy, 64, 1000000, 2000000)).toBe(false);
  });

  test("should stop for goal-based strategy when goal reached", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 65,
    };

    expect(shouldStopCalculation(strategy, 50, 1000000, 1000000)).toBe(true);
    expect(shouldStopCalculation(strategy, 50, 999999, 1000000)).toBe(false);
  });
});

describe("calculateProjectedCapital", () => {
  test("should calculate projected capital after years", () => {
    const initial = 100000;
    const monthlyContribution = 1000;
    const yearlyReturn = 0.1; // 10%
    const taxRate = 0.13; // 13%
    const years = 10;

    const result = calculateProjectedCapital(
      initial,
      monthlyContribution,
      yearlyReturn,
      taxRate,
      years
    );

    expect(result).toBeGreaterThan(initial);
    expect(result).toBeGreaterThan(initial + monthlyContribution * 12 * years);
  });

  test("should return initial capital for zero years", () => {
    const result = calculateProjectedCapital(100000, 1000, 0.1, 0.13, 0);
    expect(result).toBe(100000);
  });

  test("should handle zero return", () => {
    const result = calculateProjectedCapital(100000, 1000, 0, 0.13, 5);
    // Should be initial + contributions (no growth, no tax)
    expect(result).toBe(100000 + 1000 * 12 * 5);
  });
});

describe("estimateYearsToGoal", () => {
  test("should estimate years to reach goal", () => {
    const initial = 100000;
    const monthlyContribution = 1000;
    const yearlyReturn = 0.1; // 10%
    const taxRate = 0.13; // 13%
    const goal = 500000;

    const years = estimateYearsToGoal(
      initial,
      monthlyContribution,
      yearlyReturn,
      taxRate,
      goal
    );

    expect(years).toBeGreaterThan(0);
    expect(years).toBeLessThan(100);
  });

  test("should return 0 if initial capital already exceeds goal", () => {
    const years = estimateYearsToGoal(1000000, 1000, 0.1, 0.13, 500000);
    expect(years).toBe(0);
  });

  test("should cap at 100 years", () => {
    const years = estimateYearsToGoal(1000, 10, 0.01, 0.13, 1000000000);
    expect(years).toBeLessThanOrEqual(100);
  });
});

describe("calculateCapitalGrowth", () => {
  test("should return empty array for invalid fund", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "age-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: "INVALID" as any,
      inflationRate: 3,
      taxRate: 13,
      goalAge: 65,
    };

    const result = calculateCapitalGrowth(strategy);
    expect(result).toEqual([]);
  });

  test("should calculate growth for age-based strategy", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const result = calculateCapitalGrowth(strategy, 5);

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result[0].year).toBeGreaterThan(0);
    expect(result[0].age).toBe(25);
    expect(result[0].capitalStart).toBe(100000);
    expect(result[0].capitalEnd).toBeGreaterThan(result[0].capitalStart);
    expect(result[0].goalProgress).toBeGreaterThanOrEqual(0);
    expect(result[0].goalProgress).toBeLessThanOrEqual(100);
  });

  test("should calculate growth for goal-based strategy", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 100000,
      monthlyContribution: 0,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 65,
    };

    const result = calculateCapitalGrowth(strategy, 50);
    const fund = FUNDS.find((f) => f.id === strategy.selectedFund)!;
    const expectedContribution = calculateGoalBasedMonthlyContribution(
      strategy.goal,
      strategy.initialAmount,
      strategy.currentAge,
      strategy.goalAge,
      fund.yearlyReturn,
      strategy.taxRate / 100,
      strategy.inflationRate
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(41); // 65 - 25 + 1
    expect(result[0].capitalStart).toBe(100000);
    expect(result[0].contributions).toBe(
      Math.round(expectedContribution * 12)
    );
  });

  test("should stop at goal age for age-based strategy", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "age-based",
      currentAge: 60,
      initialAmount: 100000,
      monthlyContribution: 1000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goalAge: 65,
    };

    const result = calculateCapitalGrowth(strategy, 50);
    const lastRow = result[result.length - 1];

    expect(lastRow.age).toBeLessThanOrEqual(65);
    expect(result.length).toBeLessThanOrEqual(6); // 60 to 65 inclusive
  });

  test("should stop when goal reached for goal-based strategy", () => {
    const strategy: GoalBasedStrategy = {
      id: "1",
      name: "Test",
      createdAt: new Date(),
      type: "goal-based",
      currentAge: 25,
      initialAmount: 900000,
      monthlyContribution: 10000,
      selectedFund: FUNDS[0].id,
      inflationRate: 3,
      taxRate: 13,
      goal: 1000000,
      goalAge: 30, // Short goal to reach quickly
    };

    const result = calculateCapitalGrowth(strategy, 50);
    expect(result.length).toBeGreaterThan(0);
    const lastRow = result[result.length - 1];

    // Should stop at goalAge or when goal reached
    expect(lastRow.age).toBeLessThanOrEqual(30);
  });

  test("should have increasing capital over time", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const result = calculateCapitalGrowth(strategy, 5);

    for (let i = 1; i < result.length; i++) {
      expect(result[i].capitalEnd).toBeGreaterThan(result[i - 1].capitalEnd);
    }
  });

  test("should calculate correct contributions", () => {
    const strategy: AgeBasedStrategy = {
      id: "1",
      name: "Test",
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

    const result = calculateCapitalGrowth(strategy, 3);

    result.forEach((row) => {
      expect(row.contributions).toBe(12000); // 1000 * 12
    });
  });
});

type AgeBasedStrategy = Strategy & { type: "age-based" };
type GoalBasedStrategy = Strategy & { type: "goal-based" };
