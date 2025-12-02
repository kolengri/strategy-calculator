import type { Strategy, LifeEvent } from "@/stores/strategy";
import {
  calculateMonthlyReturn,
  calculateYearCapital,
  calculateGoalProgress,
  calculateTargetAmount,
  getEffectiveMaxYears,
  calculateGoalBasedMonthlyContribution,
  getStrategyFinancialParams,
  type CapitalGrowthRow,
} from "./calculate-capital-growth";
import { getCurrentYear } from "./format";
import { AGE_LIMITS } from "./constants";

/**
 * Gets life events for a specific age
 */
function getLifeEventsForAge(
  lifeEvents: LifeEvent[] | undefined,
  age: number
): LifeEvent[] {
  if (!lifeEvents || lifeEvents.length === 0) {
    return [];
  }
  return lifeEvents.filter((event) => event.age === age);
}

/**
 * Calculates total withdrawal amount for life events
 */
function calculateWithdrawal(events: LifeEvent[]): number {
  return events.reduce((sum, event) => sum + event.amount, 0);
}

export type WhatIfScenario = {
  id: string;
  name: string;
  returnModifier: number; // e.g., -0.02 for -2%, +0.02 for +2%
  rows: CapitalGrowthRow[];
  finalCapital: number;
  difference: number;
  differencePercentage: number;
};

export type WhatIfScenariosResult = {
  scenarios: WhatIfScenario[];
  baseFinalCapital: number;
};

/**
 * Generates what-if scenarios for different return rates
 */
export function generateWhatIfScenarios(
  strategy: Strategy,
  baseRows: CapitalGrowthRow[]
): WhatIfScenariosResult {
  const params = getStrategyFinancialParams(strategy);
  if (!params || baseRows.length === 0) {
    return { scenarios: [], baseFinalCapital: 0 };
  }

  // Calculate base monthly contribution (same for all scenarios)
  const baseMonthlyContribution =
    strategy.type === "goal-based"
      ? calculateGoalBasedMonthlyContribution(
          strategy.goal,
          strategy.initialAmount,
          strategy.currentAge,
          strategy.goalAge,
          params.netYearlyReturn,
          params.taxRate,
          strategy.inflationRate
        )
      : strategy.monthlyContribution;

  // For fair comparison, calculate base scenario with same logic (until goalAge)
  // This ensures we compare capital at the same point in time
  const baseScenarioRows = calculateCapitalGrowthWithModifiedReturn(
    strategy,
    0, // no modifier for base
    baseMonthlyContribution
  );
  const baseFinalCapital =
    baseScenarioRows.length > 0
      ? baseScenarioRows[baseScenarioRows.length - 1]?.capitalEnd ?? 0
      : baseRows[baseRows.length - 1]?.capitalEnd ?? 0;

  const modifiers = [
    { id: "pessimistic-3", name: "-3%", modifier: -0.03 },
    { id: "pessimistic-2", name: "-2%", modifier: -0.02 },
    { id: "pessimistic-1", name: "-1%", modifier: -0.01 },
    { id: "optimistic-1", name: "+1%", modifier: 0.01 },
    { id: "optimistic-2", name: "+2%", modifier: 0.02 },
    { id: "optimistic-3", name: "+3%", modifier: 0.03 },
  ];

  const scenarios = modifiers
    .map((mod) => {
      const rows = calculateCapitalGrowthWithModifiedReturn(
        strategy,
        mod.modifier,
        baseMonthlyContribution
      );

      if (rows.length === 0) {
        return null;
      }

      const finalCapital = rows[rows.length - 1]?.capitalEnd ?? 0;
      const difference = finalCapital - baseFinalCapital;
      const differencePercentage =
        baseFinalCapital > 0 ? (difference / baseFinalCapital) * 100 : 0;

      return {
        id: mod.id,
        name: mod.name,
        returnModifier: mod.modifier,
        rows,
        finalCapital,
        difference,
        differencePercentage,
      };
    })
    .filter((scenario): scenario is WhatIfScenario => scenario !== null);

  return { scenarios, baseFinalCapital };
}

/**
 * Calculate capital growth with a modified return rate
 * Uses the base monthly contribution to show how return changes affect outcome
 */
function calculateCapitalGrowthWithModifiedReturn(
  strategy: Strategy,
  returnModifier: number,
  baseMonthlyContribution: number
): CapitalGrowthRow[] {
  const params = getStrategyFinancialParams(strategy);
  if (!params) {
    return [];
  }

  // Temporarily create a modified calculation by adjusting the yearly return
  const modifiedNetReturn = params.netYearlyReturn + returnModifier;

  const monthlyReturn = calculateMonthlyReturn(modifiedNetReturn);
  const taxRate = strategy.taxRate / 100;

  // Use the same monthly contribution as base scenario for fair comparison
  const monthlyContribution = baseMonthlyContribution;

  const strategyWithMonthlyContribution =
    strategy.type === "goal-based"
      ? { ...strategy, monthlyContribution }
      : strategy;

  const { targetAmount, yearsToGoal } = calculateTargetAmount(
    strategyWithMonthlyContribution,
    modifiedNetReturn,
    taxRate
  );

  const rows: CapitalGrowthRow[] = [];
  let currentCapital = strategy.initialAmount;
  const currentYear = getCurrentYear();
  const effectiveMaxYears = getEffectiveMaxYears(
    strategy,
    AGE_LIMITS.MAX_INVESTMENT_YEARS
  );

  for (let year = 0; year < effectiveMaxYears; year++) {
    const age = strategy.currentAge + year;
    const capitalStart = currentCapital;

    const yearResult = calculateYearCapital(
      capitalStart,
      monthlyContribution,
      monthlyReturn,
      taxRate
    );

    // Get life events for this year and calculate withdrawal
    const yearLifeEvents = getLifeEventsForAge(strategy.lifeEvents, age);
    const withdrawal = calculateWithdrawal(yearLifeEvents);

    // Apply withdrawal after year-end calculations
    const capitalAfterWithdrawal = Math.max(
      0,
      yearResult.capitalEnd - withdrawal
    );
    currentCapital = capitalAfterWithdrawal;

    const goalProgress = calculateGoalProgress(
      strategy,
      year,
      yearsToGoal,
      capitalAfterWithdrawal,
      targetAmount
    );

    rows.push({
      year: currentYear + year,
      age,
      capitalStart: Math.round(capitalStart),
      contributions: Math.round(yearResult.annualContributions),
      return: Math.round(yearResult.totalReturn),
      tax: Math.round(yearResult.tax),
      withdrawal: Math.round(withdrawal),
      lifeEvents: yearLifeEvents,
      capitalEnd: Math.round(capitalAfterWithdrawal),
      goalProgress: Math.min(goalProgress, 100),
    });

    // For what-if scenarios, only stop at goalAge, not when goal is reached
    // This allows comparing final capital at the same point in time
    if (age >= strategy.goalAge) {
      break;
    }
  }

  return rows;
}
