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

export function calculateCapitalGrowth(
  strategy: Strategy,
  maxYears: number = 50
): CapitalGrowthRow[] {
  const fund = FUNDS.find((f) => f.id === strategy.selectedFund);
  if (!fund) {
    return [];
  }

  const yearlyReturn = fund.yearlyReturn;
  const monthlyReturn = Math.pow(1 + yearlyReturn, 1 / 12) - 1;
  const taxRate = strategy.taxRate / 100;

  // Calculate target amount
  let targetAmount: number;
  if (strategy.type === "age-based") {
    const yearsToGoal = strategy.goalAge - strategy.currentAge;
    // For age-based, we calculate what the capital will be at goal age
    // We'll calculate this as we go, but for progress we need a target
    // Let's use a projection based on current parameters
    targetAmount = calculateProjectedCapital(
      strategy.initialAmount,
      strategy.monthlyContribution,
      yearlyReturn,
      taxRate,
      yearsToGoal
    );
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
    const inflationMultiplier = Math.pow(1 + strategy.inflationRate / 100, yearsToGoal);
    targetAmount = strategy.goal * inflationMultiplier;
  }

  const rows: CapitalGrowthRow[] = [];
  let currentCapital = strategy.initialAmount;
  const currentYear = new Date().getFullYear();

  for (let year = 0; year < maxYears; year++) {
    const age = strategy.currentAge + year;
    const capitalStart = currentCapital;
    const annualContributions = strategy.monthlyContribution * 12;

    // Calculate monthly compounding with contributions
    let capitalAfterContributions = capitalStart;
    for (let month = 0; month < 12; month++) {
      // Add monthly contribution at the start of the month
      capitalAfterContributions += strategy.monthlyContribution;
      // Apply monthly return
      capitalAfterContributions *= 1 + monthlyReturn;
    }

    // Calculate return (gain)
    const totalReturn = capitalAfterContributions - capitalStart - annualContributions;

    // Calculate tax on return
    const tax = totalReturn > 0 ? totalReturn * taxRate : 0;

    // Final capital after tax
    const capitalEnd = capitalAfterContributions - tax;
    currentCapital = capitalEnd;

    // Calculate goal progress
    const goalProgress = targetAmount > 0 ? (capitalEnd / targetAmount) * 100 : 0;

    rows.push({
      year: currentYear + year,
      age,
      capitalStart: Math.round(capitalStart),
      contributions: Math.round(annualContributions),
      return: Math.round(totalReturn),
      tax: Math.round(tax),
      capitalEnd: Math.round(capitalEnd),
      goalProgress: Math.min(goalProgress, 100), // Cap at 100%
    });

    // Stop if we've reached the goal age for age-based strategies
    if (strategy.type === "age-based" && age >= strategy.goalAge) {
      break;
    }

    // Stop if we've reached the goal for goal-based strategies
    if (strategy.type === "goal-based" && capitalEnd >= targetAmount) {
      break;
    }
  }

  return rows;
}

function calculateProjectedCapital(
  initial: number,
  monthlyContribution: number,
  yearlyReturn: number,
  taxRate: number,
  years: number
): number {
  const monthlyReturn = Math.pow(1 + yearlyReturn, 1 / 12) - 1;
  let capital = initial;

  for (let year = 0; year < years; year++) {
    const capitalStart = capital;
    let capitalAfterContributions = capitalStart;
    
    for (let month = 0; month < 12; month++) {
      capitalAfterContributions += monthlyContribution;
      capitalAfterContributions *= 1 + monthlyReturn;
    }
    
    const annualContributions = monthlyContribution * 12;
    const totalReturn = capitalAfterContributions - capitalStart - annualContributions;
    const tax = totalReturn > 0 ? totalReturn * taxRate : 0;
    capital = capitalAfterContributions - tax;
  }

  return capital;
}

function estimateYearsToGoal(
  initial: number,
  monthlyContribution: number,
  yearlyReturn: number,
  taxRate: number,
  goal: number
): number {
  // Simple estimation - iterative approach
  let years = 0;
  let capital = initial;
  const monthlyReturn = Math.pow(1 + yearlyReturn, 1 / 12) - 1;

  while (capital < goal && years < 100) {
    const capitalStart = capital;
    let capitalAfterContributions = capitalStart;
    
    for (let month = 0; month < 12; month++) {
      capitalAfterContributions += monthlyContribution;
      capitalAfterContributions *= 1 + monthlyReturn;
    }
    
    const annualContributions = monthlyContribution * 12;
    const totalReturn = capitalAfterContributions - capitalStart - annualContributions;
    const tax = totalReturn > 0 ? totalReturn * taxRate : 0;
    capital = capitalAfterContributions - tax;
    years++;
  }

  return years;
}

