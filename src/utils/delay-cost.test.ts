import { describe, test, expect } from "bun:test";
import {
  getEffectiveMaxDelayYears,
  generateDelayPeriods,
  isValidDelayScenario,
  calculateDelayDataList,
} from "./delay-cost";
import type { Strategy, AgeBasedStrategy, GoalBasedStrategy } from "@/stores/strategy";

// Mock strategies for testing
const createAgeBasedStrategy = (
  overrides: Partial<AgeBasedStrategy> = {}
): AgeBasedStrategy => ({
  id: "test-age-based",
  name: "Test Age Based",
  createdAt: new Date("2024-01-01"),
  type: "age-based",
  currentAge: 30,
  goalAge: 65,
  initialAmount: 10000,
  monthlyContribution: 500,
  selectedFund: "SPX",
  inflationRate: 3,
  taxRate: 13,
  ...overrides,
});

const createGoalBasedStrategy = (
  overrides: Partial<GoalBasedStrategy> = {}
): GoalBasedStrategy => ({
  id: "test-goal-based",
  name: "Test Goal Based",
  createdAt: new Date("2024-01-01"),
  type: "goal-based",
  currentAge: 30,
  goalAge: 65,
  goal: 1000000,
  initialAmount: 10000,
  monthlyContribution: 500,
  selectedFund: "SPX",
  inflationRate: 3,
  taxRate: 13,
  ...overrides,
});

describe("getEffectiveMaxDelayYears", () => {
  test("returns provided maxDelayYears when specified", () => {
    const strategy = createAgeBasedStrategy();
    expect(getEffectiveMaxDelayYears(strategy, 10)).toBe(10);
  });

  test("returns years until goal minus 1 for age-based strategy", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    // 65 - 30 - 1 = 34
    expect(getEffectiveMaxDelayYears(strategy)).toBe(34);
  });

  test("returns 0 when current age is at or past goal for age-based", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 65, goalAge: 65 });
    expect(getEffectiveMaxDelayYears(strategy)).toBe(0);
  });

  test("returns 30 (default) for goal-based strategy", () => {
    const strategy = createGoalBasedStrategy();
    expect(getEffectiveMaxDelayYears(strategy)).toBe(30);
  });

  test("handles edge case where current age is 1 year before goal", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 64, goalAge: 65 });
    // 65 - 64 - 1 = 0
    expect(getEffectiveMaxDelayYears(strategy)).toBe(0);
  });
});

describe("generateDelayPeriods", () => {
  test("generates periods with step of 3 up to 12", () => {
    const periods = generateDelayPeriods(3, 12);
    expect(periods).toEqual([3, 6, 9, 12]);
  });

  test("generates periods with step of 5 up to 20", () => {
    const periods = generateDelayPeriods(5, 20);
    expect(periods).toEqual([5, 10, 15, 20]);
  });

  test("returns empty array when maxDelayYears is less than stepYears", () => {
    const periods = generateDelayPeriods(5, 3);
    expect(periods).toEqual([]);
  });

  test("returns empty array when maxDelayYears is 0", () => {
    const periods = generateDelayPeriods(3, 0);
    expect(periods).toEqual([]);
  });

  test("handles step of 1", () => {
    const periods = generateDelayPeriods(1, 5);
    expect(periods).toEqual([1, 2, 3, 4, 5]);
  });

  test("handles case where max is not divisible by step", () => {
    const periods = generateDelayPeriods(3, 10);
    expect(periods).toEqual([3, 6, 9]);
  });
});

describe("isValidDelayScenario", () => {
  test("returns false when cost is 0", () => {
    const strategy = createAgeBasedStrategy();
    expect(isValidDelayScenario(strategy, 5, 0)).toBe(false);
  });

  test("returns false when cost is negative", () => {
    const strategy = createAgeBasedStrategy();
    expect(isValidDelayScenario(strategy, 5, -100)).toBe(false);
  });

  test("returns true for valid age-based scenario with positive cost", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    // delay 10 years is valid (30 + 10 = 40, which is less than 65)
    expect(isValidDelayScenario(strategy, 10, 1000)).toBe(true);
  });

  test("returns false for age-based when delay >= years to goal", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    // delay 35 years would mean starting at age 65, which equals goal age
    expect(isValidDelayScenario(strategy, 35, 1000)).toBe(false);
  });

  test("returns false for age-based when delay > years to goal", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    // delay 40 years would mean starting at age 70, past goal age
    expect(isValidDelayScenario(strategy, 40, 1000)).toBe(false);
  });

  test("returns true for goal-based with any valid delay and positive cost", () => {
    const strategy = createGoalBasedStrategy();
    expect(isValidDelayScenario(strategy, 50, 1000)).toBe(true);
  });

  test("returns true when delay is just below years to goal for age-based", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    // delay 34 years is valid (35 years to goal, delay must be < 35)
    expect(isValidDelayScenario(strategy, 34, 1000)).toBe(true);
  });
});

describe("calculateDelayDataList", () => {
  test("returns array of delay cost results", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    const result = calculateDelayDataList(strategy, 3);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("each result has required properties", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 30, goalAge: 65 });
    const result = calculateDelayDataList(strategy, 3);

    if (result.length > 0) {
      const firstResult = result[0];
      expect(firstResult).toHaveProperty("delayYears");
      expect(firstResult).toHaveProperty("cost");
      expect(firstResult).toHaveProperty("currentCapital");
      expect(firstResult).toHaveProperty("delayedCapital");
      expect(firstResult).toHaveProperty("costPercentage");
    }
  });

  test("filters out invalid scenarios", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 60, goalAge: 65 });
    // Only 4 years until goal, so only delays < 5 are valid
    const result = calculateDelayDataList(strategy, 3);

    // With step 3 and max 4, only delay of 3 should be valid
    result.forEach((data) => {
      expect(data.delayYears).toBeLessThan(5);
    });
  });

  test("respects custom maxDelayYears parameter", () => {
    const strategy = createAgeBasedStrategy();
    const result = calculateDelayDataList(strategy, 3, 9);

    // With max 9 and step 3, should get at most 3 periods: 3, 6, 9
    const maxDelayYears = Math.max(...result.map((d) => d.delayYears));
    expect(maxDelayYears).toBeLessThanOrEqual(9);
  });

  test("returns empty array when no valid scenarios exist", () => {
    const strategy = createAgeBasedStrategy({ currentAge: 64, goalAge: 65 });
    // Only 1 year to goal, step of 3 means no valid periods
    const result = calculateDelayDataList(strategy, 3);

    expect(result).toEqual([]);
  });

  test("all returned results have positive cost", () => {
    const strategy = createAgeBasedStrategy();
    const result = calculateDelayDataList(strategy, 3);

    result.forEach((data) => {
      expect(data.cost).toBeGreaterThan(0);
    });
  });
});

