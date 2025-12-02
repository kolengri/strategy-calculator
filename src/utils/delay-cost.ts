import type { Strategy } from "@/stores/strategy";
import {
  calculateDelayCost,
  type DelayCostResult,
} from "./calculate-capital-growth";

const DEFAULT_MAX_DELAY_YEARS = 30;

/**
 * Calculates the effective maximum delay years based on strategy type.
 * For age-based strategies, limits to years until goal age minus 1.
 * For goal-based strategies, uses a default of 30 years.
 */
export function getEffectiveMaxDelayYears(
  strategy: Strategy,
  maxDelayYears?: number
): number {
  if (maxDelayYears !== undefined) {
    return maxDelayYears;
  }

  if (strategy.type === "age-based") {
    return Math.max(0, strategy.goalAge - strategy.currentAge - 1);
  }

  return DEFAULT_MAX_DELAY_YEARS;
}

/**
 * Generates an array of delay periods in increments of stepYears.
 * Example: stepYears=3, maxYears=12 => [3, 6, 9, 12]
 */
export function generateDelayPeriods(
  stepYears: number,
  maxDelayYears: number
): number[] {
  const periods: number[] = [];

  for (let years = stepYears; years <= maxDelayYears; years += stepYears) {
    periods.push(years);
  }

  return periods;
}

/**
 * Checks if a delay scenario is valid for the given strategy.
 * For age-based strategies, delay years must be less than years to goal.
 */
export function isValidDelayScenario(
  strategy: Strategy,
  delayYears: number,
  cost: number
): boolean {
  // Must have positive cost
  if (cost <= 0) {
    return false;
  }

  // For age-based, can't start investing after goal age
  if (strategy.type === "age-based") {
    const yearsToGoal = strategy.goalAge - strategy.currentAge;
    if (delayYears >= yearsToGoal) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates delay cost data for all valid delay periods.
 * Returns filtered list of delay scenarios that are valid and have positive cost.
 */
export function calculateDelayDataList(
  strategy: Strategy,
  stepYears: number = 3,
  maxDelayYears?: number
): DelayCostResult[] {
  const effectiveMaxYears = getEffectiveMaxDelayYears(strategy, maxDelayYears);
  const periods = generateDelayPeriods(stepYears, effectiveMaxYears);

  return periods
    .map((delayYears) => calculateDelayCost(strategy, delayYears))
    .filter((data) =>
      isValidDelayScenario(strategy, data.delayYears, data.cost)
    );
}
