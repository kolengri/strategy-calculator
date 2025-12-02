import type { Strategy } from "@/stores/strategy";
import { FUNDS } from "@/db/funds";

export type CapitalGrowthRow = {
  year: number;
  age: number;
  capitalStart: number;
  contributions: number;
  return: number;
  tax: number;
  capitalEnd: number;
  goalProgress: number; // percentage of goal achieved
};

export type YearCapitalResult = {
  capitalEnd: number;
  totalReturn: number;
  tax: number;
  annualContributions: number;
};

/**
 * Calculates monthly return from yearly return
 */
export function calculateMonthlyReturn(yearlyReturn: number): number {
  return Math.pow(1 + yearlyReturn, 1 / 12) - 1;
}

/**
 * Calculates capital growth for a single year with monthly compounding
 */
export function calculateYearCapital(
  capitalStart: number,
  monthlyContribution: number,
  monthlyReturn: number,
  taxRate: number
): YearCapitalResult {
  const annualContributions = monthlyContribution * 12;

  // Calculate monthly compounding with contributions
  let capitalAfterContributions = capitalStart;
  for (let month = 0; month < 12; month++) {
    // Add monthly contribution at the start of the month
    capitalAfterContributions += monthlyContribution;
    // Apply monthly return
    capitalAfterContributions *= 1 + monthlyReturn;
  }

  // Calculate return (gain)
  const totalReturn =
    capitalAfterContributions - capitalStart - annualContributions;

  // Calculate tax on return
  const tax = totalReturn > 0 ? totalReturn * taxRate : 0;

  // Final capital after tax
  const capitalEnd = capitalAfterContributions - tax;

  return {
    capitalEnd,
    totalReturn,
    tax,
    annualContributions,
  };
}

/**
 * Calculates goal progress percentage
 */
export function calculateGoalProgress(
  strategy: Strategy,
  year: number,
  yearsToGoal: number,
  capitalEnd: number,
  targetAmount: number
): number {
  if (strategy.type === "age-based") {
    // For age-based: progress is based on years elapsed vs years to goal
    const yearsElapsed = year + 1; // +1 because we're at the end of this year
    return yearsToGoal > 0
      ? Math.min((yearsElapsed / yearsToGoal) * 100, 100)
      : 100;
  } else {
    // For goal-based: progress is based on capital vs target amount
    return targetAmount > 0 ? (capitalEnd / targetAmount) * 100 : 0;
  }
}

/**
 * Calculates target amount and years to goal for a strategy
 */
export function calculateTargetAmount(
  strategy: Strategy,
  yearlyReturn: number,
  taxRate: number
): { targetAmount: number; yearsToGoal: number } {
  if (strategy.type === "age-based") {
    const yearsToGoal = strategy.goalAge - strategy.currentAge;
    // For age-based, calculate projected capital at goal age for progress tracking
    // This gives us a target to measure progress against
    const targetAmount = calculateProjectedCapital(
      strategy.initialAmount,
      strategy.monthlyContribution,
      yearlyReturn,
      taxRate,
      yearsToGoal
    );
    return { targetAmount, yearsToGoal };
  } else {
    // For goal-based, adjust goal for inflation
    const yearsToGoal = estimateYearsToGoal(
      strategy.initialAmount,
      strategy.monthlyContribution,
      yearlyReturn,
      taxRate,
      strategy.goal
    );
    // Adjust goal for inflation over the years
    const inflationMultiplier = Math.pow(
      1 + strategy.inflationRate / 100,
      yearsToGoal
    );
    const targetAmount = strategy.goal * inflationMultiplier;
    return { targetAmount, yearsToGoal };
  }
}

/**
 * Calculates effective max years for calculation based on strategy type
 */
export function getEffectiveMaxYears(
  strategy: Strategy,
  maxYears: number
): number {
  if (strategy.type === "age-based") {
    const yearsToGoalAge = strategy.goalAge - strategy.currentAge;
    return Math.min(maxYears, yearsToGoalAge + 1); // +1 to include goalAge year
  }
  return maxYears;
}

/**
 * Checks if calculation should stop based on strategy type and current state
 */
export function shouldStopCalculation(
  strategy: Strategy,
  age: number,
  capitalEnd: number,
  targetAmount: number
): boolean {
  if (strategy.type === "age-based" && age >= strategy.goalAge) {
    return true;
  }
  if (strategy.type === "goal-based" && capitalEnd >= targetAmount) {
    return true;
  }
  return false;
}

export function calculateCapitalGrowth(
  strategy: Strategy,
  maxYears: number = 50
): CapitalGrowthRow[] {
  const fund = FUNDS.find((f) => f.id === strategy.selectedFund);
  if (!fund) {
    return [];
  }

  const yearlyReturn = fund.yearlyReturn;
  const monthlyReturn = calculateMonthlyReturn(yearlyReturn);
  const taxRate = strategy.taxRate / 100;

  // Calculate target amount and years to goal
  const { targetAmount, yearsToGoal } = calculateTargetAmount(
    strategy,
    yearlyReturn,
    taxRate
  );

  const rows: CapitalGrowthRow[] = [];
  let currentCapital = strategy.initialAmount;
  const currentYear = new Date().getFullYear();

  // For age-based strategies, limit maxYears to not exceed goalAge
  const effectiveMaxYears = getEffectiveMaxYears(strategy, maxYears);

  for (let year = 0; year < effectiveMaxYears; year++) {
    const age = strategy.currentAge + year;
    const capitalStart = currentCapital;

    const yearResult = calculateYearCapital(
      capitalStart,
      strategy.monthlyContribution,
      monthlyReturn,
      taxRate
    );

    currentCapital = yearResult.capitalEnd;

    // Calculate goal progress
    const goalProgress = calculateGoalProgress(
      strategy,
      year,
      yearsToGoal,
      yearResult.capitalEnd,
      targetAmount
    );

    rows.push({
      year: currentYear + year,
      age,
      capitalStart: Math.round(capitalStart),
      contributions: Math.round(yearResult.annualContributions),
      return: Math.round(yearResult.totalReturn),
      tax: Math.round(yearResult.tax),
      capitalEnd: Math.round(yearResult.capitalEnd),
      goalProgress: Math.min(goalProgress, 100), // Cap at 100%
    });

    // Stop if we've reached the goal age for age-based strategies
    // Stop when we reach the goal age (inclusive), so if goalAge is 65, show up to age 65
    if (
      shouldStopCalculation(strategy, age, yearResult.capitalEnd, targetAmount)
    ) {
      break;
    }
  }

  return rows;
}

/**
 * Calculates projected capital after a given number of years
 */
export function calculateProjectedCapital(
  initial: number,
  monthlyContribution: number,
  yearlyReturn: number,
  taxRate: number,
  years: number
): number {
  const monthlyReturn = calculateMonthlyReturn(yearlyReturn);
  let capital = initial;

  for (let year = 0; year < years; year++) {
    const yearResult = calculateYearCapital(
      capital,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );
    capital = yearResult.capitalEnd;
  }

  return capital;
}

/**
 * Estimates years needed to reach a goal amount
 */
export function estimateYearsToGoal(
  initial: number,
  monthlyContribution: number,
  yearlyReturn: number,
  taxRate: number,
  goal: number
): number {
  // Simple estimation - iterative approach
  let years = 0;
  let capital = initial;
  const monthlyReturn = calculateMonthlyReturn(yearlyReturn);

  while (capital < goal && years < 100) {
    const yearResult = calculateYearCapital(
      capital,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );
    capital = yearResult.capitalEnd;
    years++;
  }

  return years;
}
