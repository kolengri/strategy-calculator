import type { Strategy } from "@/stores/strategy";
import {
  calculateMonthlyReturn,
  calculateYearCapital,
  calculateGoalProgress,
  calculateTargetAmount,
  getEffectiveMaxYears,
  shouldStopCalculation,
  calculateGoalBasedMonthlyContribution,
  getStrategyFinancialParams,
  type CapitalGrowthRow,
} from "./calculate-capital-growth";
import { getCurrentYear } from "./format";
import { AGE_LIMITS } from "./constants";

export type WhatIfScenario = {
  id: string;
  name: string;
  returnModifier: number; // e.g., -0.02 for -2%, +0.02 for +2%
  rows: CapitalGrowthRow[];
  finalCapital: number;
  difference: number;
  differencePercentage: number;
};

/**
 * Generates what-if scenarios for different return rates
 */
export function generateWhatIfScenarios(
  strategy: Strategy,
  baseRows: CapitalGrowthRow[]
): WhatIfScenario[] {
  const params = getStrategyFinancialParams(strategy);
  if (!params || baseRows.length === 0) {
    return [];
  }

  const baseFinalCapital = baseRows[baseRows.length - 1]?.capitalEnd ?? 0;
  const modifiers = [
    { id: "pessimistic-3", name: "-3%", modifier: -0.03 },
    { id: "pessimistic-2", name: "-2%", modifier: -0.02 },
    { id: "pessimistic-1", name: "-1%", modifier: -0.01 },
    { id: "optimistic-1", name: "+1%", modifier: 0.01 },
    { id: "optimistic-2", name: "+2%", modifier: 0.02 },
    { id: "optimistic-3", name: "+3%", modifier: 0.03 },
  ];

  return modifiers
    .map((mod) => {
      const rows = calculateCapitalGrowthWithModifiedReturn(
        strategy,
        mod.modifier
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
}

/**
 * Calculate capital growth with a modified return rate
 */
function calculateCapitalGrowthWithModifiedReturn(
  strategy: Strategy,
  returnModifier: number
): CapitalGrowthRow[] {
  const params = getStrategyFinancialParams(strategy);
  if (!params) {
    return [];
  }

  // Temporarily create a modified calculation by adjusting the yearly return
  const modifiedNetReturn = params.netYearlyReturn + returnModifier;

  const monthlyReturn = calculateMonthlyReturn(modifiedNetReturn);
  const taxRate = strategy.taxRate / 100;

  let monthlyContribution: number;
  if (strategy.type === "goal-based") {
    monthlyContribution = calculateGoalBasedMonthlyContribution(
      strategy.goal,
      strategy.initialAmount,
      strategy.currentAge,
      strategy.goalAge,
      modifiedNetReturn,
      taxRate,
      strategy.inflationRate
    );
  } else {
    monthlyContribution = strategy.monthlyContribution;
  }

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

    currentCapital = yearResult.capitalEnd;

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
      goalProgress: Math.min(goalProgress, 100),
    });

    if (
      shouldStopCalculation(strategy, age, yearResult.capitalEnd, targetAmount)
    ) {
      break;
    }
  }

  return rows;
}
