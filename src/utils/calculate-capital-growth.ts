import type { Strategy } from "@/stores/strategy";
import { getFundById, type Fund } from "@/db/funds";
import { AGE_LIMITS, CALCULATION_LIMITS } from "./constants";
import { getCurrentYear } from "./format";

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
 * Financial parameters derived from a strategy
 */
export type StrategyFinancialParams = {
  fund: Fund;
  yearlyReturn: number;
  /** Net yearly return after expense ratio */
  netYearlyReturn: number;
  taxRate: number;
  monthlyReturn: number;
};

/**
 * Gets financial parameters from a strategy
 * @returns null if fund is not found
 */
export function getStrategyFinancialParams(
  strategy: Strategy
): StrategyFinancialParams | null {
  const fund = getFundById(strategy.selectedFund);
  if (!fund) return null;

  const yearlyReturn = fund.yearlyReturn;
  // Subtract expense ratio from yearly return for net return
  const netYearlyReturn = yearlyReturn - fund.expenseRatio;

  return {
    fund,
    yearlyReturn,
    netYearlyReturn,
    taxRate: strategy.taxRate / 100,
    monthlyReturn: calculateMonthlyReturn(netYearlyReturn),
  };
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
  // Both strategy types now have goalAge
  const yearsToGoal = strategy.goalAge - strategy.currentAge;

  if (strategy.type === "age-based") {
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
    // For goal-based, target is the nominal goal amount (what user wants to have)
    // No inflation adjustment here - user specified the exact target amount
    return { targetAmount: strategy.goal, yearsToGoal };
  }
}

/**
 * Calculates effective max years for calculation based on strategy type
 */
export function getEffectiveMaxYears(
  strategy: Strategy,
  maxYears: number
): number {
  // Both strategy types now have goalAge
  const yearsToGoalAge = strategy.goalAge - strategy.currentAge;
  return Math.min(maxYears, yearsToGoalAge + 1); // +1 to include goalAge year
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
  // Both strategy types stop at goalAge
  if (age >= strategy.goalAge) {
    return true;
  }
  // Goal-based also stops when goal amount is reached
  if (strategy.type === "goal-based" && capitalEnd >= targetAmount) {
    return true;
  }
  return false;
}

function getStrategyMonthlyContribution(
  strategy: Strategy,
  yearlyReturn: number,
  taxRate: number
): number {
  if (strategy.type === "goal-based") {
    return calculateGoalBasedMonthlyContribution(
      strategy.goal,
      strategy.initialAmount,
      strategy.currentAge,
      strategy.goalAge,
      yearlyReturn,
      taxRate,
      strategy.inflationRate
    );
  }

  return strategy.monthlyContribution;
}

export function calculateCapitalGrowth(
  strategy: Strategy,
  maxYears: number = AGE_LIMITS.MAX_INVESTMENT_YEARS
): CapitalGrowthRow[] {
  const params = getStrategyFinancialParams(strategy);
  if (!params) {
    return [];
  }

  const { netYearlyReturn, monthlyReturn, taxRate } = params;
  const monthlyContribution = getStrategyMonthlyContribution(
    strategy,
    netYearlyReturn,
    taxRate
  );
  const strategyWithMonthlyContribution =
    strategy.type === "goal-based"
      ? { ...strategy, monthlyContribution }
      : strategy;

  // Calculate target amount and years to goal
  const { targetAmount, yearsToGoal } = calculateTargetAmount(
    strategyWithMonthlyContribution,
    netYearlyReturn,
    taxRate
  );

  const rows: CapitalGrowthRow[] = [];
  let currentCapital = strategy.initialAmount;
  const currentYear = getCurrentYear();

  // For age-based strategies, limit maxYears to not exceed goalAge
  const effectiveMaxYears = getEffectiveMaxYears(strategy, maxYears);

  for (let year = 0; year < effectiveMaxYears; year++) {
    const age = strategy.currentAge + year;
    const capitalStart = currentCapital;

    const yearResult = calculateYearCapital(
      capitalStart,
      monthlyContribution,
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

  while (capital < goal && years < CALCULATION_LIMITS.MAX_YEARS_TO_GOAL) {
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

/**
 * Calculates required initial amount to reach target capital
 * Uses binary search for efficiency
 */
export function calculateRequiredInitialAmount(
  targetCapital: number,
  monthlyContribution: number,
  yearlyReturn: number,
  taxRate: number,
  years: number
): number {
  if (years <= 0) {
    return targetCapital;
  }

  // Binary search for initial amount
  let low = 0;
  let high = targetCapital;
  let result = 0;
  const tolerance = 1; // 1 unit precision

  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const projected = calculateProjectedCapital(
      mid,
      monthlyContribution,
      yearlyReturn,
      taxRate,
      years
    );

    if (projected >= targetCapital) {
      result = mid;
      high = mid;
    } else {
      low = mid;
    }
  }

  return Math.ceil(result);
}

/**
 * Calculates required monthly contribution to reach target capital
 * Uses binary search for efficiency
 */
export function calculateRequiredMonthlyContribution(
  targetCapital: number,
  initialAmount: number,
  yearlyReturn: number,
  taxRate: number,
  years: number
): number {
  if (years <= 0) {
    return 0;
  }

  // Binary search for monthly contribution
  // Upper bound: assume we need to contribute the entire target (worst case)
  let low = 0;
  let high = Math.max(
    targetCapital / (years * 12),
    (targetCapital - initialAmount) / (years * 12)
  );
  let result = 0;
  const tolerance = 0.01; // 1 cent precision
  let iterations = 0;

  while (
    high - low > tolerance &&
    iterations < CALCULATION_LIMITS.MAX_ITERATIONS
  ) {
    iterations++;
    const mid = (low + high) / 2;
    const projected = calculateProjectedCapital(
      initialAmount,
      mid,
      yearlyReturn,
      taxRate,
      years
    );

    if (projected >= targetCapital) {
      result = mid;
      high = mid;
    } else {
      low = mid;
      // If we're still too low, increase upper bound
      if (iterations > 50 && projected < targetCapital * 0.9) {
        high = mid * 2;
      }
    }
  }

  return Math.ceil(result * 100) / 100; // Round to cents
}

/**
 * Calculates required monthly contribution for goal-based strategy
 * Calculates how much needs to be invested monthly to reach the goal by goalAge
 */
export function calculateGoalBasedMonthlyContribution(
  goal: number,
  initialAmount: number,
  currentAge: number,
  goalAge: number,
  yearlyReturn: number,
  taxRate: number,
  _inflationRate: number // kept for API compatibility, but not used
): number {
  // Validate inputs
  if (goal <= 0 || currentAge <= 0 || currentAge >= AGE_LIMITS.MAX) {
    return 0;
  }

  // Calculate years to goal based on goalAge
  const yearsToGoal = goalAge - currentAge;

  if (yearsToGoal <= 0) {
    return 0;
  }

  // If initial amount already exceeds goal, return 0
  if (initialAmount >= goal) {
    return 0;
  }

  // Calculate required monthly contribution to reach the nominal goal
  // Inflation is NOT applied here - user specifies the exact target amount
  // Inflation impact is shown separately in the summary as "purchasing power"
  const monthlyContribution = calculateRequiredMonthlyContribution(
    goal,
    initialAmount,
    yearlyReturn,
    taxRate,
    yearsToGoal
  );

  return Math.max(0, monthlyContribution);
}

/**
 * Calculates the cost of delay - how much it costs to start investing later
 * @param strategy - The current strategy
 * @param delayYears - Number of years to delay (default: 3)
 * @returns Object with delay cost information
 */
export type DelayCostResult = {
  currentCapital: number;
  delayedCapital: number;
  cost: number;
  costPercentage: number;
  delayYears: number;
  currentAgeAtGoal: number;
  delayedAgeAtGoal: number;
  currentYearAtGoal: number;
  delayedYearAtGoal: number;
  requiredInitialAmount: number | null;
  requiredMonthlyContribution: number | null;
};

export function calculateDelayCost(
  strategy: Strategy,
  delayYears: number = 3
): DelayCostResult {
  const params = getStrategyFinancialParams(strategy);
  const currentYear = getCurrentYear();

  if (!params) {
    return {
      currentCapital: 0,
      delayedCapital: 0,
      cost: 0,
      costPercentage: 0,
      delayYears,
      currentAgeAtGoal: strategy.currentAge,
      delayedAgeAtGoal: strategy.currentAge + delayYears,
      currentYearAtGoal: currentYear,
      delayedYearAtGoal: currentYear + delayYears,
      requiredInitialAmount: null,
      requiredMonthlyContribution: null,
    };
  }

  const { netYearlyReturn, taxRate } = params;
  const monthlyContribution = getStrategyMonthlyContribution(
    strategy,
    netYearlyReturn,
    taxRate
  );

  // Calculate current strategy capital at goal
  let currentCapital: number;
  let delayedCapital: number;
  let currentAgeAtGoal: number;
  let delayedAgeAtGoal: number;
  let currentYearsToGoal: number;
  let delayedYearsToGoal: number;

  if (strategy.type === "age-based") {
    currentYearsToGoal = strategy.goalAge - strategy.currentAge;

    // Current strategy: start now
    currentCapital = calculateProjectedCapital(
      strategy.initialAmount,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      currentYearsToGoal
    );
    currentAgeAtGoal = strategy.goalAge;

    // Delayed strategy: start delayYears later
    // When person delays, they don't make contributions during delay period
    // Initial capital remains the same (or grows minimally if already invested)
    // The key loss is the missed contributions during delay years

    // For delayed scenario: initial amount stays the same (or minimal growth)
    // We assume initial capital is not actively invested during delay
    const delayedInitialAmount = strategy.initialAmount;

    delayedYearsToGoal = currentYearsToGoal - delayYears;

    // If delayYears >= currentYearsToGoal, there's no time left to reach goalAge
    if (delayedYearsToGoal <= 0) {
      // Person starts investing at or after goalAge
      // Capital is just the initial amount (no time for contributions)
      delayedCapital = delayedInitialAmount;
      delayedAgeAtGoal = strategy.currentAge + delayYears; // They start at this age
    } else {
      // Calculate capital if they start delayYears later with same initial amount
      // but only have remaining years to contribute
      delayedCapital = calculateProjectedCapital(
        delayedInitialAmount,
        monthlyContribution,
        netYearlyReturn,
        taxRate,
        delayedYearsToGoal
      );
      // For age-based, goal age remains the same
      delayedAgeAtGoal = strategy.goalAge;
    }
  } else {
    // Goal-based strategy
    // Current strategy: calculate years to goal starting now
    currentYearsToGoal = estimateYearsToGoal(
      strategy.initialAmount,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      strategy.goal
    );

    currentCapital = calculateProjectedCapital(
      strategy.initialAmount,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      currentYearsToGoal
    );
    currentAgeAtGoal = strategy.currentAge + currentYearsToGoal;

    // Delayed strategy: initial amount stays the same during delay (no contributions)
    // When person delays, they don't make contributions, and initial capital doesn't grow
    const delayedInitialAmount = strategy.initialAmount;

    // Adjust goal for inflation over delay years
    const inflationMultiplier = Math.pow(
      1 + strategy.inflationRate / 100,
      delayYears
    );
    const delayedGoal = strategy.goal * inflationMultiplier;

    delayedYearsToGoal = estimateYearsToGoal(
      delayedInitialAmount,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      delayedGoal
    );

    delayedCapital = calculateProjectedCapital(
      delayedInitialAmount,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      delayedYearsToGoal
    );
    delayedAgeAtGoal = strategy.currentAge + delayYears + delayedYearsToGoal;
  }

  const cost = currentCapital - delayedCapital;
  const costPercentage = currentCapital > 0 ? (cost / currentCapital) * 100 : 0;

  // Calculate years at goal
  const currentYearAtGoal = currentYear + currentYearsToGoal;
  // For age-based, if delayedYearsToGoal <= 0, use the age when they would start
  const delayedYearAtGoal =
    strategy.type === "age-based" && delayedYearsToGoal <= 0
      ? currentYear + delayYears
      : currentYear + delayYears + delayedYearsToGoal;

  // Calculate required adjustments to match current capital
  let requiredInitialAmount: number | null = null;
  let requiredMonthlyContribution: number | null = null;

  if (delayedYearsToGoal > 0 && currentCapital > delayedCapital) {
    // Calculate required initial amount (keeping monthly contribution the same)
    requiredInitialAmount = calculateRequiredInitialAmount(
      currentCapital,
      monthlyContribution,
      netYearlyReturn,
      taxRate,
      delayedYearsToGoal
    );

    // Calculate required monthly contribution (keeping initial amount the same)
    requiredMonthlyContribution = calculateRequiredMonthlyContribution(
      currentCapital,
      strategy.initialAmount,
      netYearlyReturn,
      taxRate,
      delayedYearsToGoal
    );
  }

  return {
    currentCapital,
    delayedCapital,
    cost,
    costPercentage,
    delayYears,
    currentAgeAtGoal,
    delayedAgeAtGoal,
    currentYearAtGoal,
    delayedYearAtGoal,
    requiredInitialAmount,
    requiredMonthlyContribution,
  };
}
